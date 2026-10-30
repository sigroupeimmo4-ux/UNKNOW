"""Tests navigateur : exécuter
python3 -m unittest discover -s tests -v
Nécessite Playwright Python et Chromium (présents dans l'environnement cloud).
"""
import json
import os
import unittest
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import sync_playwright


class StudyBeamTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(
            SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parents[1])))
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base_url = f'http://127.0.0.1:{cls.server.server_port}/'
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(
            executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'),
            headless=True,
            args=['--no-sandbox'],
        )

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.server_thread.join()

    def setUp(self):
        self.context = self.browser.new_context()
        # Ces tests couvrent les fonctions locales, indépendamment du CDN.
        self.context.route('https://**/*', lambda route: route.abort())
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))

    def tearDown(self):
        self.context.close()

    def open_site(self):
        self.page.goto(self.base_url + 'app.html', wait_until='networkidle')

    def test_invalid_profiles_fall_back_without_breaking_quiz(self):
        for profile in ['{invalid', 'null', '[]', '42',
                        '{"grade":"inconnue","subject":7,"chapter":{}}']:
            with self.subTest(profile=profile):
                self.open_site()
                self.page.evaluate('(value) => localStorage.setItem("sw-profile", value)', profile)
                self.page.reload(wait_until='networkidle')
                self.assertEqual(self.page.locator('#grade').input_value(), 'CP')
                self.assertEqual(self.page.locator('#subject').input_value(), 'mathematiques-commun')
                self.assertEqual(self.page.locator('#chapter').input_value(), 'cp-dizaines-unites')
                self.page.get_by_role('button', name='Mes quiz').click()
                self.assertEqual(self.page.locator('.choice').count(), 3)
                self.assertEqual(self.errors, [])

    def test_valid_profile_is_preserved(self):
        self.open_site()
        profile = {'grade': 'CM2', 'subject': 'Français', 'chapter': 'Grammaire'}
        self.page.evaluate('(value) => localStorage.setItem("sw-profile", value)', json.dumps(profile))
        self.page.reload(wait_until='networkidle')
        self.assertEqual(self.page.locator('#grade').input_value(), 'CM2')
        self.assertEqual(self.page.locator('#subject').input_value(), 'francais-commun')
        self.assertEqual(self.page.evaluate('localStorage.getItem("sw-profile")'), json.dumps(profile))
        self.assertEqual(self.page.locator('#chapter').input_value(), '')
        self.assertEqual(self.errors, [])

    def complete_quiz(self, choices):
        self.page.get_by_role('link', name='Démonstrations', exact=True).click()
        self.page.get_by_role('button', name='Quiz de démonstration', exact=True).click()
        for choice in choices:
            self.page.locator('.choice').nth(choice).click()
            self.page.get_by_role('button', name='Continuer').click()
        self.page.locator('#demo-quiz .back').click()

    def test_home_score_updates_and_keeps_best_result(self):
        self.open_site()
        self.complete_quiz([1, 0, 2])
        self.assertEqual(self.page.locator('#homeProgress').inner_text(),
                         'Meilleur score de démonstration : 3/3.')
        self.complete_quiz([0, 1, 0])
        self.assertEqual(self.page.locator('#homeProgress').inner_text(),
                         'Meilleur score de démonstration : 3/3.')
        self.assertEqual(self.page.evaluate('localStorage.getItem("sw-last")'), '0')
        self.page.reload(wait_until='networkidle')
        self.assertIn('3/3', self.page.locator('#homeProgress').inner_text())
        self.assertEqual(self.errors, [])

    def open_curriculum(self):
        self.open_site()
        self.page.get_by_role('button', name='Programmes français 2026-2027').click()
        self.page.locator('#curriculumActivity h3').wait_for()

    def test_curriculum_course_quiz_and_chapter_change(self):
        self.open_curriculum()
        self.assertIn('dizaines et les unités', self.page.locator('#curriculumActivity h3').inner_text())
        self.page.locator('#curriculumActivity').get_by_role('button', name='Quiz', exact=True).click()
        for choice in [1, 1, 0]:
            self.page.locator('#curriculumLessonBody .choice').nth(choice).click()
            self.page.locator('#curriculumLessonBody').get_by_role('button', name='Continuer', exact=True).click()
        self.assertIn('3 / 3', self.page.locator('#curriculumLessonBody').inner_text())
        self.page.locator('#curriculumChapter').select_option('cp-comparer-nombres')
        self.page.locator('#curriculumActivity h3').filter(has_text='Comparer').wait_for()
        self.assertIn('49 < 53', self.page.locator('#curriculumLessonBody').inner_text())
        self.page.locator('#curriculumActivity').get_by_role('button', name='Audio', exact=True).click()
        self.assertIn('quarante', self.page.locator('#curriculumLessonBody').inner_text().lower())
        self.assertEqual(self.errors, [])

    def test_curriculum_does_not_replace_missing_lessons_with_demo(self):
        self.open_curriculum()
        self.page.locator('#curriculumGrade').select_option('4e')
        self.assertIn('encore à intégrer', self.page.locator('#curriculumStatus').inner_text())
        self.assertEqual(self.page.locator('#curriculumActivity').inner_text(), '')
        self.page.locator('#curriculumCalendar summary').click()
        self.assertIn('rentrée future 2027', self.page.locator('#curriculumCalendar').inner_text())
        self.assertEqual(self.errors, [])

    def test_curriculum_technological_series_and_general_subjects(self):
        self.open_curriculum()
        self.page.locator('#curriculumGrade').select_option('1re')
        self.page.locator('#curriculumPathway').select_option('technologique')
        self.page.locator('#curriculumType').select_option('specialite')
        self.page.locator('#curriculumVariant').select_option('STMG')
        titles = self.page.locator('#curriculumSubject option').all_text_contents()
        self.assertTrue(titles)
        self.assertTrue(all('STMG' in title for title in titles))
        self.page.locator('#curriculumPathway').select_option('generale')
        self.assertNotIn('STMG', self.page.locator('#curriculumSubject').inner_text())
        self.assertEqual(self.errors, [])

    def test_curriculum_audio_uses_selected_chapter_and_stops_on_change(self):
        self.open_curriculum()
        self.page.evaluate("""() => {
            window.audioChecks = {text: '', stops: 0};
            Object.defineProperty(window, 'speechSynthesis', {configurable: true, value: {
                cancel() { window.audioChecks.stops++; },
                speak(utterance) { window.audioChecks.text = utterance.text; }
            }});
        }""")
        self.page.locator('#curriculumActivity').get_by_role('button', name='Audio', exact=True).click()
        self.page.get_by_role('button', name='Écouter ce chapitre', exact=True).click()
        spoken = self.page.evaluate('window.audioChecks.text')
        self.assertIn('Une dizaine', spoken)
        self.assertNotIn('dériv', spoken)
        before = self.page.evaluate('window.audioChecks.stops')
        self.page.locator('#curriculumGrade').select_option('4e')
        self.assertGreater(self.page.evaluate('window.audioChecks.stops'), before)
        self.assertEqual(self.errors, [])

    def test_beam_dragon_and_local_actions_without_fake_ai(self):
        self.open_site()
        self.page.locator('#beamLauncher').click()
        self.assertTrue(self.page.locator('#tutor img').evaluate('(el)=>el.complete && el.naturalWidth>0'))
        self.assertIn('API IA à connecter',self.page.locator('#agentConnection').inner_text())
        self.page.locator('#message').fill('Explique-moi les fractions')
        self.page.locator('#agentSend').click()
        self.assertIn('pas encore connectée',self.page.locator('#chat').inner_text())
        self.page.locator('#message').fill('Ouvre mon quiz')
        self.page.locator('#agentSend').click()
        self.page.locator('#curriculumLessonBody .choice').first.wait_for()
        self.assertTrue(self.page.locator('#curriculum').is_visible())
        self.assertIn('Beam a ouvert : Quiz',self.page.locator('#beamActionStatus').inner_text())
        self.assertEqual(self.errors,[])

    def test_school_choices_follow_level_pathway_and_series(self):
        self.open_site()
        self.assertEqual(self.page.locator('#grade option').count(),12)
        cp_subjects=self.page.locator('#subject option').all_text_contents()
        self.page.locator('#grade').select_option('1re')
        self.page.locator('#schoolPathway').select_option('technologique')
        self.page.locator('#schoolType').select_option('specialite')
        self.page.locator('#schoolVariant').select_option('STMG')
        self.assertTrue(all('STMG' in value for value in self.page.locator('#subject option').all_text_contents()))
        self.page.locator('#schoolPathway').select_option('professionnelle')
        pro_subjects=self.page.locator('#subject option').all_text_contents()
        self.assertNotEqual(cp_subjects,pro_subjects)
        self.assertTrue(any('économie' in value for value in pro_subjects))
        self.page.reload(wait_until='networkidle')
        self.assertEqual(self.page.locator('#schoolPathway').input_value(),'professionnelle')
        self.assertEqual(self.errors,[])

    def test_every_learning_card_routes_to_available_cp_content(self):
        self.open_site()
        for name, marker in [('Mes cours','Commencer avec des objets'),('Mes fiches','À retenir'),('Mes audios','Écouter ce chapitre'),('Mes quiz','Question 1 sur 3')]:
            with self.subTest(name=name):
                self.page.get_by_role('link',name='Accueil',exact=True).click()
                self.page.get_by_role('button',name=name).click()
                self.page.locator('#curriculumLessonBody').get_by_text(marker,exact=False).first.wait_for()
                self.assertNotIn('dérivation',self.page.locator('#curriculumLessonBody').inner_text().lower())
        self.assertEqual(self.errors,[])

    def test_navigation_hash_reload_and_browser_back(self):
        self.open_site()
        self.page.get_by_role('link',name='Beam',exact=True).click()
        self.assertTrue(self.page.url.endswith('#tutor'))
        self.page.reload(wait_until='networkidle')
        self.assertTrue(self.page.locator('#tutor').is_visible())
        self.page.get_by_role('link',name='Démonstrations',exact=True).click()
        self.page.go_back()
        self.page.locator('#tutor').wait_for(state='visible')
        self.page.get_by_role('link',name='Aller au contenu').focus()
        self.page.keyboard.press('Enter')
        self.assertTrue(self.page.locator('#tutor').is_visible())
        self.assertEqual(self.errors,[])

    def test_unavailable_storage_and_invalid_scores_do_not_break_app(self):
        self.context.add_init_script("""Storage.prototype.getItem = function(){throw new DOMException('blocked','SecurityError')};Storage.prototype.setItem=function(){throw new DOMException('blocked','SecurityError')};""")
        self.open_site()
        self.assertTrue(self.page.locator('#storageStatus').is_visible())
        self.page.get_by_role('button',name='Mes cours').click()
        self.page.locator('#curriculumActivity h3').wait_for()
        self.assertEqual(self.errors,[])

    def test_score_values_are_never_inserted_as_html_or_rewritten_on_load(self):
        value='<img src=x onerror="window.injected=true">'
        self.context.add_init_script('localStorage.setItem("sw-best",'+json.dumps(value)+');')
        self.open_site()
        self.page.get_by_role('link',name='Progression',exact=True).click()
        self.assertEqual(self.page.locator('#progressContent img').count(),0)
        self.assertIsNone(self.page.evaluate('window.injected'))
        self.assertEqual(self.page.evaluate('localStorage.getItem("sw-best")'),value)
        self.assertIn('Aucun résultat',self.page.locator('#progressContent').inner_text())
        self.assertEqual(self.errors,[])

    def test_catalogue_failure_keeps_demo_available(self):
        self.context.route('**/curriculum/catalogue.json',lambda r:r.fulfill(status=503,body='unavailable'))
        self.open_site()
        self.assertIn('ne peut pas être chargé',self.page.locator('#schoolStatus').inner_text())
        self.page.get_by_role('link',name='Démonstrations',exact=True).click()
        self.page.get_by_role('button',name='Quiz de démonstration',exact=True).click()
        self.assertEqual(self.page.locator('#quizContent .choice').count(),3)
        self.assertEqual(self.errors,[])

    def test_demo_audio_controls_handle_missing_browser_support(self):
        self.context.add_init_script("Object.defineProperty(window,'speechSynthesis',{value:undefined});")
        self.open_site()
        self.page.get_by_role('link',name='Démonstrations',exact=True).click()
        self.page.get_by_role('button',name='Audio de démonstration',exact=True).click()
        for name in ['Pause','Reprendre','Arrêter','Lire']:
            self.page.locator('#demo-audio').get_by_role('button',name=name).click()
            self.assertIn('pas disponible',self.page.locator('#audioStatus').inner_text())
        self.assertEqual(self.errors,[])

    def test_clearing_demo_scores_requires_confirmation(self):
        self.open_site()
        self.complete_quiz([1,0,2])
        self.page.get_by_role('link',name='Progression',exact=True).click()
        self.page.once('dialog',lambda d:d.dismiss())
        self.page.get_by_role('button',name='Effacer mes résultats locaux').click()
        self.assertEqual(self.page.evaluate('localStorage.getItem("sw-best")'),'3')
        self.page.once('dialog',lambda d:d.accept())
        self.page.get_by_role('button',name='Effacer mes résultats locaux').click()
        self.assertIsNone(self.page.evaluate('localStorage.getItem("sw-best")'))
        self.assertIn('Aucun résultat',self.page.locator('#progressContent').inner_text())
        self.assertEqual(self.errors,[])

    def test_mobile_navigation_stays_below_header_and_fields_are_named(self):
        self.page.set_viewport_size({'width':390,'height':844})
        self.open_site()
        for name in ['Beam','Démonstrations','Progression']:
            self.page.get_by_role('link',name=name,exact=True).click()
            bounds=self.page.locator('.app-nav').bounding_box()
            header=self.page.locator('.topbar').bounding_box()
            self.assertGreaterEqual(bounds['y'],header['y']+header['height']-1)
            self.assertLess(bounds['y']+bounds['height'],844)
        self.page.get_by_role('button',name='Paramètres').click()
        self.assertTrue(self.page.get_by_label('Taille du texte',exact=True).is_visible())
        self.assertTrue(self.page.get_by_label('Préférence de costume (démonstration)',exact=True).is_visible())
        self.assertEqual(self.errors,[])

    def test_video_search_uses_selected_school_context(self):
        from urllib.parse import urlparse,parse_qs
        self.context.route('https://www.youtube.com/**',lambda route:route.fulfill(status=200,content_type='text/html',body='<title>Recherche externe simulée</title>'))
        self.open_site()
        self.page.locator('#grade').select_option('CE2')
        self.page.get_by_role('button',name='Mes vidéos').click()
        with self.page.expect_popup() as popup_info:
            self.page.get_by_role('button',name='Rechercher sur YouTube').click()
        popup=popup_info.value;popup.wait_for_load_state()
        query=parse_qs(urlparse(popup.url).query)['search_query'][0]
        self.assertIn('CE2',query)
        self.assertIn('Mathématiques',query)
        self.assertNotIn('Dérivation',query)
        self.assertTrue(popup.evaluate('window.opener === null'))
        popup.close()
        self.assertEqual(self.errors,[])
