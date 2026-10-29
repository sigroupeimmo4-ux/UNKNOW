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


class StudyWinkTests(unittest.TestCase):
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
                self.assertEqual(self.page.locator('#grade').input_value(), 'Terminale')
                self.assertEqual(self.page.locator('#subject').input_value(), 'Mathématiques')
                self.assertEqual(self.page.locator('#chapter').input_value(), 'Dérivation')
                self.page.get_by_role('button', name='Mes quiz').click()
                self.assertEqual(self.page.locator('.choice').count(), 3)
                self.assertEqual(self.errors, [])

    def test_valid_profile_is_preserved(self):
        self.open_site()
        profile = {'grade': 'CM2', 'subject': 'Français', 'chapter': 'Grammaire'}
        self.page.evaluate('(value) => localStorage.setItem("sw-profile", value)', json.dumps(profile))
        self.page.reload(wait_until='networkidle')
        for field, value in profile.items():
            self.assertEqual(self.page.locator('#' + field).input_value(), value)
        self.assertEqual(self.errors, [])

    def complete_quiz(self, choices):
        self.page.get_by_role('button', name='Mes quiz').click()
        for choice in choices:
            self.page.locator('.choice').nth(choice).click()
            self.page.get_by_role('button', name='Continuer').click()
        self.page.locator('#quiz .back').click()

    def test_home_score_updates_and_keeps_best_result(self):
        self.open_site()
        self.complete_quiz([1, 0, 2])
        self.assertEqual(self.page.locator('#homeProgress').inner_text(),
                         'Ton meilleur score local : 3/3.')
        self.complete_quiz([0, 1, 0])
        self.assertEqual(self.page.locator('#homeProgress').inner_text(),
                         'Ton meilleur score local : 3/3.')
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
