"""Design compact : navigation permanente et présentation de données réelles."""
import json
import threading
import unittest
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

class DesignTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root=Path(__file__).resolve().parents[1]
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(root.parent)))
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.base=f'http://127.0.0.1:{cls.server.server_port}/{root.name}/'
        cls.playwright=sync_playwright().start();cls.browser=cls.playwright.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.playwright.stop();cls.server.shutdown();cls.server.server_close();cls.thread.join()
    def setUp(self):
        self.context=self.browser.new_context(viewport={'width':1440,'height':900});self.context.route('https://**/*',lambda r:r.abort());self.page=self.context.new_page();self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
    def tearDown(self):
        self.context.close();self.assertEqual(self.errors,[])
    def open(self,path):self.page.goto(self.base+path,wait_until='networkidle')
    def nav(self,name):return self.page.get_by_role('navigation',name='Menu principal').get_by_role('link',name=name,exact=True)
    def test_eleven_sidebar_routes_reload_and_active_state(self):
        self.open('index.html')
        for name,route in [('Accueil','index.html'),('Programmes','programmes.html'),('Cours','cours.html'),('Fiches','fiches.html'),('Audio','audio.html'),('Quiz','quiz.html'),('Vidéos','videos.html'),('Learning Pass','learning-pass.html'),('Mon dragon','app.html#dragon'),('Progression','app.html#progress'),('Paramètres','app.html#settings')]:
            with self.subTest(name=name):
                self.nav(name).click();expect(self.page).to_have_url(self.base+route)
                expect(self.nav(name)).to_have_attribute('aria-current','page')
                self.assertEqual(self.page.locator('.app-nav a[aria-current=page]').count(),1)
                self.assertEqual(self.page.evaluate('Math.round(scrollY)'),0)
                self.page.reload(wait_until='networkidle');expect(self.nav(name)).to_have_attribute('aria-current','page')
    def test_sidebar_collapse_persists_and_preserves_existing_data(self):
        self.open('index.html');saved={'sw-best':'2','sw-profile':'{"grade":"CM2"}','sw-costume':'Pirate'}
        self.page.evaluate('(x)=>Object.entries(x).forEach(([k,v])=>localStorage.setItem(k,v))',saved)
        self.page.get_by_role('button',name='Réduire la barre latérale').click()
        expect(self.page.locator('html')).to_have_attribute('data-sidebar-collapsed','')
        self.assertLess(self.page.locator('.sidebar-content').bounding_box()['width'],100)
        self.nav('Cours').click();expect(self.page.get_by_role('button',name='Agrandir la barre latérale')).to_be_visible()
        for k,v in saved.items():self.assertEqual(self.page.evaluate('(k)=>localStorage.getItem(k)',k),v)
        self.page.get_by_role('button',name='Agrandir la barre latérale').click();self.assertGreater(self.page.locator('.sidebar-content').bounding_box()['width'],200)
    def test_mobile_drawer_escape_backdrop_and_navigation(self):
        self.page.set_viewport_size({'width':390,'height':844});self.open('index.html');toggle=self.page.locator('[data-main-menu] summary')
        toggle.click();expect(self.page.locator('#sidebarBackdrop')).to_be_visible()
        self.page.keyboard.press('Escape');expect(toggle).to_be_focused();expect(self.page.locator('#sidebarBackdrop')).to_be_hidden()
        toggle.click();self.page.locator('#sidebarBackdrop').click(position={'x':370,'y':200});expect(self.page.locator('#sidebarBackdrop')).to_be_hidden()
        toggle.click();self.nav('Mon dragon').click();expect(self.page.locator('#dragon')).to_be_visible();self.assertFalse(self.page.locator('[data-main-menu]').evaluate('(el)=>el.open'))
        for name in ['Accueil','Programmes','Cours','Fiches','Audio','Quiz','Vidéos','Learning Pass','Mon dragon','Progression','Paramètres']:
            self.page.locator('[data-main-menu] summary').click();entry=self.nav(name);destination=entry.get_attribute('href');entry.click()
            expect(self.page.locator('.app-nav a[aria-current=page]')).to_have_attribute('href',destination)
            self.assertFalse(self.page.locator('[data-main-menu]').evaluate('(el)=>el.open'))
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),390)
    def test_top_search_uses_real_course_filters(self):
        self.open('index.html');self.page.get_by_label('Rechercher un cours',exact=True).fill('comparer');self.page.get_by_role('button',name='Lancer la recherche').click()
        expect(self.page).to_have_url(self.base+'cours.html?q=comparer');expect(self.page.locator('#libraryContent .route-card')).to_have_count(1)
        self.page.locator('#libraryContent .route-card').click();expect(self.page.locator('#curriculumLessonBody')).to_contain_text('49 < 53')
    def test_new_user_has_no_fake_activity_or_result(self):
        self.open('index.html');expect(self.page.locator('[data-resume]')).to_contain_text('Découvrir les programmes')
        expect(self.page.locator('[data-learning-summary]')).to_contain_text('Cours consultés0')
        expect(self.page.locator('[data-learning-summary]')).to_contain_text('Notions à revoir : aucune donnée enregistrée.')
        self.assertEqual(self.page.locator('[data-resume] a[href*="lesson="]').count(),0)
        self.assertIsNone(self.page.evaluate('localStorage.getItem("sw-learning-history")'))
        self.assertEqual(self.page.locator('[aria-label*="otification"]').count(),0)
    def test_consulted_course_can_be_resumed_after_reload(self):
        self.open('cours.html?lesson=cp-comparer-nombres');expect(self.page.locator('#curriculumLessonBody')).to_be_visible()
        self.page.wait_for_function('localStorage.getItem("sw-learning-history")!==null')
        self.nav('Accueil').click();expect(self.page.locator('[data-resume]')).to_contain_text('Comparer et ranger les nombres')
        expect(self.page.locator('[data-learning-summary]')).to_contain_text('Cours consultés1')
        self.page.reload(wait_until='networkidle');self.page.get_by_role('link',name='Reprendre le cours').click();expect(self.page).to_have_url(self.base+'cours.html?lesson=cp-comparer-nombres')
        self.nav('Accueil').click();expect(self.page.locator('[data-learning-summary]')).to_contain_text('Cours consultés1')
    def test_invalid_history_and_unknown_course_are_not_recent_activity(self):
        self.open('index.html');self.page.evaluate('localStorage.setItem("sw-learning-history",JSON.stringify({items:[{id:"unknown",at:"2026-10-30"},{id:"cp-dizaines-unites",at:"invalid"}]}))')
        self.open('cours.html?lesson=unknown');expect(self.page.locator('#libraryTitle')).to_have_text('Cette ressource ne peut pas être affichée')
        self.open('index.html');expect(self.page.locator('[data-resume]')).to_contain_text('Découvrir les programmes');expect(self.page.locator('[data-learning-summary]')).to_contain_text('Cours consultés0')
    def test_profile_name_is_local_and_escaped(self):
        self.open('app.html#settings');value='<img src=x onerror=alert(1)>'
        self.page.get_by_label('Mon prénom (facultatif)',exact=True).fill(value);self.page.locator('#displayNameForm').get_by_role('button',name='Enregistrer').click()
        self.nav('Accueil').click();expect(self.page.locator('[data-welcome]')).to_have_text('Bonjour '+value+' !');self.assertEqual(self.page.locator('[data-welcome] img').count(),0)
        self.page.reload(wait_until='networkidle');expect(self.page.locator('[data-welcome]')).to_have_text('Bonjour '+value+' !')
    def test_dragon_route_and_browser_history(self):
        self.open('app.html#dragon');expect(self.page.locator('#dragon')).to_contain_text('Aucun costume visuel disponible')
        self.assertEqual(self.page.locator('#dragon img').get_attribute('src'),'./assets/studybeam-logo.webp?v=dragon-1')
        self.nav('Paramètres').click();self.nav('Progression').click();self.page.go_back();expect(self.nav('Paramètres')).to_have_attribute('aria-current','page')
        self.page.go_back();expect(self.page.locator('#dragon')).to_be_visible();expect(self.nav('Mon dragon')).to_have_attribute('aria-current','page')
        self.page.go_forward();expect(self.page.locator('#settings')).to_be_visible()
    def test_saved_quiz_score_is_identified_as_demonstration(self):
        self.open('index.html');self.page.evaluate('localStorage.setItem("sw-last","2");localStorage.setItem("sw-best","3")');self.page.reload(wait_until='networkidle')
        expect(self.page.locator('[data-learning-summary]')).to_contain_text('Dernier quiz2/3Quiz de démonstration uniquement')
        self.open('app.html#progress');expect(self.page.locator('#progressContent')).to_contain_text('Meilleur score de démonstration : 3/3.')
        self.assertEqual(self.page.evaluate('localStorage.getItem("sw-best")'),'3')
