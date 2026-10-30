"""Mission 1.5 : navigation réelle, routes GitHub Pages et ressources existantes."""
import json
import threading
import unittest
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect

class NavigationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        root=Path(__file__).resolve().parents[1]
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root.parent)))
        cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.base=f'http://127.0.0.1:{cls.server.server_port}/{root.name}/'
        cls.playwright=sync_playwright().start();cls.browser=cls.playwright.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.playwright.stop();cls.server.shutdown();cls.server.server_close();cls.thread.join()
    def setUp(self):
        self.context=self.browser.new_context();self.context.route('https://**/*',lambda r:r.abort());self.page=self.context.new_page();self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
    def tearDown(self):
        self.context.close();self.assertEqual(self.errors,[])
    def open(self,path):
        self.page.goto(self.base+path,wait_until='networkidle')
    def test_all_main_destinations_are_distinct_pages(self):
        for name,file in [('Accueil','index.html'),('Programmes','programmes.html'),('Cours','cours.html'),('Fiches','fiches.html'),('Audio','audio.html'),('Quiz','quiz.html'),('Vidéos','videos.html'),('Learning Pass','learning-pass.html'),('Connexion','login.html'),('Inscription','signup.html')]:
            with self.subTest(name=name):
                self.open('index.html');a=self.page.get_by_role('navigation',name='Menu principal').get_by_role('link',name=name,exact=True)
                self.assertEqual(urlparse(a.get_attribute('href')).fragment,'')
                a.click();expect(self.page).to_have_url(self.base+file)
                self.assertEqual(self.page.evaluate('Math.round(scrollY)'),0)
                if file not in ['index.html','login.html','signup.html']:
                    expect(self.page.locator('#library')).to_be_visible()
                    self.assertEqual(self.page.locator('.page').count(),1)
                self.page.reload(wait_until='networkidle');self.assertTrue(self.page.url.endswith(file))
    def test_programme_hierarchy_and_lesson_direct_link(self):
        self.open('programmes.html');visited=[self.page.url]
        for name in ['École primaire','CP','Mathématiques','Comprendre les dizaines et les unités']:
            self.page.locator('#libraryContent').get_by_role('link',name=name,exact=False).first.click();visited.append(self.page.url)
        self.assertEqual(len(set(visited)),5)
        self.page.get_by_role('navigation',name='Ressources associées au chapitre').get_by_role('link',name='Cours',exact=True).click()
        expect(self.page.locator('#curriculumLessonBody')).to_contain_text('Commencer avec des objets')
        uri=self.page.url;self.page.reload(wait_until='networkidle');expect(self.page.locator('#curriculumLessonBody')).to_contain_text('24 = 20 + 4')
        self.assertEqual(self.page.url,uri);self.assertIn('lesson=cp-dizaines-unites',uri)
        expect(self.page.get_by_role('navigation',name='Fil d’Ariane')).to_contain_text('Cours')
    def test_college_subject_shows_no_fictitious_chapters(self):
        self.open('programmes.html');self.page.get_by_role('link',name='Collège',exact=False).first.click();self.page.locator('#libraryContent').get_by_role('link',name='5e',exact=False).first.click();self.page.locator('#libraryContent').get_by_role('link',name='Mathématiques',exact=False).first.click()
        expect(self.page.locator('#libraryContent')).to_contain_text('Aucun chapitre')
        self.assertNotIn('dizaines et les unités',self.page.locator('#libraryContent').inner_text())
        self.assertIn('level=college',self.page.url);self.assertIn('grade=5e',self.page.url)
        self.page.reload(wait_until='networkidle');expect(self.page.locator('#libraryTitle')).to_have_text('Mathématiques')
    def test_search_filters_and_course_open_a_new_url(self):
        self.open('cours.html');self.page.get_by_label('Rechercher une matière ou un chapitre').fill('comparer');self.page.get_by_role('button',name='Filtrer',exact=True).click()
        expect(self.page.locator('#libraryContent .route-card')).to_have_count(1)
        self.assertIn('q=comparer',self.page.url)
        self.page.locator('#libraryContent .route-card').click();self.assertIn('lesson=cp-comparer-nombres',self.page.url)
        expect(self.page.locator('#curriculumLessonBody')).to_contain_text('49 < 53')
        self.page.go_back();expect(self.page.get_by_label('Rechercher une matière ou un chapitre')).to_have_value('comparer')
        self.page.go_forward();expect(self.page.locator('#libraryTitle')).to_have_text('Comparer et ranger les nombres')
    def test_fiche_links_to_its_audio_and_other_resources(self):
        self.open('fiches.html?lesson=cp-dizaines-unites');expect(self.page.locator('#curriculumLessonBody')).to_contain_text('À retenir')
        nav=self.page.get_by_role('navigation',name='Ressources associées au chapitre')
        for name in ['Cours','Exercices','Quiz','Audio']:self.assertTrue(nav.get_by_role('link',name=name,exact=True).is_visible())
        nav.get_by_role('link',name='Audio',exact=True).click();expect(self.page.get_by_role('button',name='Écouter ce chapitre')).to_be_visible()
        self.assertIn('audio.html?lesson=cp-dizaines-unites',self.page.url)
        self.assertEqual(self.page.locator('audio').count(),0)
    def test_speech_controls_report_real_boundary_progress(self):
        self.open('audio.html?lesson=cp-dizaines-unites');expect(self.page.get_by_role('button',name='Écouter ce chapitre')).to_be_enabled()
        self.page.evaluate("""()=>{window.voiceCalls=[];Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){voiceCalls.push('stop');},pause(){voiceCalls.push('pause');},resume(){voiceCalls.push('resume');},speak(u){window.utterance=u;}}});}""")
        self.page.get_by_label('Volume (prochaine lecture)',exact=True).fill('0.4');self.page.get_by_label('Vitesse (prochaine lecture)',exact=True).select_option('1.25');self.page.get_by_role('button',name='Écouter ce chapitre').click()
        self.assertAlmostEqual(self.page.evaluate('window.utterance.volume'),0.4,places=6);self.assertEqual(self.page.evaluate('window.utterance.rate'),1.25)
        self.assertIsNone(self.page.locator('progress[aria-label="Avancement dans le texte lu"]').get_attribute('value'))
        self.page.evaluate('window.utterance.onboundary({charIndex:20,charLength:4})')
        self.assertGreater(float(self.page.locator('progress[aria-label="Avancement dans le texte lu"]').get_attribute('value')),0)
        self.page.get_by_role('button',name='Pause',exact=True).click();self.page.get_by_role('button',name='Reprise',exact=True).click();self.assertIn('resume',self.page.evaluate('window.voiceCalls'))
        self.page.evaluate('window.utterance.onend()');expect(self.page.locator('progress[aria-label="Avancement dans le texte lu"]')).to_have_attribute('value','100')
    def test_quiz_activity_survives_reload_and_preserves_saved_data(self):
        self.open('index.html');values={'sw-best':'2','sw-last':'1','sw-profile':'{"grade":"CM2","subject":"Français","chapter":"Grammaire"}'}
        self.page.evaluate('(values)=>Object.entries(values).forEach(([k,v])=>localStorage.setItem(k,v))',values)
        self.open('quiz.html?lesson=cp-dizaines-unites');expect(self.page.locator('#curriculumLessonBody')).to_contain_text('Question 1 sur 3')
        self.page.locator('#curriculumLessonBody .choice').nth(1).click();self.page.get_by_role('button',name='Continuer',exact=True).click();expect(self.page.locator('#curriculumLessonBody')).to_contain_text('Question 2 sur 3')
        self.page.reload(wait_until='networkidle');expect(self.page.locator('#libraryTitle')).to_have_text('Comprendre les dizaines et les unités');expect(self.page.locator('#curriculumLessonBody')).to_contain_text('Question 1 sur 3')
        self.assertEqual(self.page.evaluate('(keys)=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]))',list(values)),values)
    def test_unconfigured_video_and_learning_pass_do_not_invent_content(self):
        self.open('videos.html');expect(self.page.locator('#libraryContent')).to_contain_text('Aucune vidéo pédagogique')
        self.assertEqual(self.page.locator('video,iframe').count(),0)
        self.assertTrue(self.page.get_by_role('link',name='Rechercher sur YouTube').is_visible())
        self.context.route('**/data/learning-pass.json',lambda route:route.fulfill(content_type='application/json',body=json.dumps({'configured':False})))
        self.open('learning-pass.html');expect(self.page.locator('#libraryContent')).to_contain_text('Aucun abonnement ni paiement')
        self.assertEqual(self.page.locator('.offer-table').count(),0);self.assertNotIn('€',self.page.locator('#libraryContent').inner_text())
    def test_direct_link_back_button_has_safe_parent(self):
        self.open('cours.html?lesson=cp-dizaines-unites');expect(self.page.locator('#curriculumLessonBody')).to_be_visible()
        self.page.get_by_role('button',name='Page précédente',exact=True).click();expect(self.page.locator('#filter-grade')).to_be_visible();self.assertNotIn('lesson=',self.page.url)
    def test_mobile_menu_and_secondary_menu_access(self):
        self.page.set_viewport_size({'width':390,'height':844});self.open('programmes.html')
        self.assertFalse(self.page.locator('[data-main-menu]').evaluate('(el)=>el.open'))
        self.page.locator('[data-main-menu] summary').click();self.page.get_by_role('navigation',name='Menu principal').get_by_role('link',name='Cours',exact=True).click()
        expect(self.page.locator('#libraryTitle')).to_have_text('Cours');self.assertFalse(self.page.locator('[data-main-menu]').evaluate('(el)=>el.open'))
        self.page.locator('#libraryMenuLink').click();self.assertTrue(self.page.locator('[data-main-menu]').evaluate('(el)=>el.open'))
        self.assertEqual(self.page.evaluate('document.documentElement.scrollWidth'),390)
    def test_legacy_activity_hash_redirects_to_real_page(self):
        self.open('app.html#course');expect(self.page).to_have_url(__import__('re').compile('/cours.html(?:\\?|$)'));expect(self.page.locator('#libraryTitle')).to_have_text('Cours')
    def test_unknown_resource_has_honest_error(self):
        self.open('cours.html?lesson=unknown');expect(self.page.locator('#libraryTitle')).to_contain_text('ne peut pas être affichée');expect(self.page.locator('#libraryContent')).to_contain_text('Aucun contenu de remplacement')

    def test_learning_pass_uses_only_explicit_configuration(self):
        config=json.loads((Path(__file__).resolve().parents[1]/'data/learning-pass.json').read_text())
        config['markets']['FR']['prices']['monthly']['amount_minor']=549
        config['markets']['FR']['prices']['annual']['amount_minor']=5490
        self.context.route('**/data/learning-pass.json',lambda route:route.fulfill(content_type='application/json',body=json.dumps(config)))
        self.open('learning-pass.html?country=FR')
        expect(self.page.locator('[data-plan=monthly] .plan-price')).to_contain_text('5,49 €')
        expect(self.page.locator('.offer-table')).to_contain_text('5,49 €')
        expect(self.page.locator('[data-plan=annual]')).to_contain_text('2 mois économisés')

    def test_missing_speech_support_keeps_transcript_without_fake_player(self):
        self.context.add_init_script("Object.defineProperty(window,'speechSynthesis',{value:undefined});")
        self.open('audio.html?lesson=cp-dizaines-unites');expect(self.page.get_by_role('button',name='Écouter ce chapitre')).to_be_disabled()
        expect(self.page.locator('#curriculumLessonBody')).to_contain_text('La transcription reste accessible')
        self.assertEqual(self.page.locator('audio').count(),0)
