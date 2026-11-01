"""Contrats de la landing StudyBeam Dreamy Pastel, sans dépendance externe."""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


def read(name):
    return (ROOT / name).read_text(encoding="utf-8")


class DreamyLandingTests(unittest.TestCase):
    def test_public_routes_exist(self):
        for page in ("index.html", "fonctionnalites.html", "contact.html",
                     "login.html", "signup.html", "a-propos.html", "programmes.html",
                     "learning-pass.html", "cours.html", "fiches.html", "audio.html",
                     "quiz.html", "videos.html", "confidentialite.html",
                     "conditions-utilisation.html"):
            with self.subTest(page=page):
                self.assertTrue((ROOT / page).is_file())

    def test_header_navigation_and_signup_links_are_real_pages(self):
        html = read("index.html")
        header = re.search(r'<header class="landing-header">.*?</header>', html, re.S).group()
        for route in ("a-propos.html", "programmes.html", "fonctionnalites.html",
                      "learning-pass.html", "login.html", "signup.html"):
            self.assertIn('href="./' + route + '"', header)
        desktop = re.search(r'<nav class="landing-links".*?</nav>', header, re.S).group()
        self.assertNotIn('href="#', desktop)

    def test_hero_and_original_mascot(self):
        html = read("index.html")
        self.assertIn("Et si apprendre devenait une aventure ?", html)
        self.assertIn("Découvre un espace pensé pour apprendre, réviser et progresser à ton rythme.", html)
        self.assertGreaterEqual(html.count("assets/studybeam-logo.webp"), 3)
        self.assertNotIn("beam-live.js", html)
        self.assertIn('href="./signup.html" class="landing-btn"', html)

    def test_five_feature_cards(self):
        html = read("index.html")
        self.assertEqual(len(re.findall(r'<article class="landing-feature ', html)), 5)
        for route in ("cours.html", "fiches.html", "audio.html", "quiz.html", "videos.html"):
            self.assertIn('href="./' + route + '"', html)

    def test_unreleased_capabilities_not_misrepresented(self):
        html = read("index.html")
        self.assertIn("L'IA générative", html)
        self.assertIn("NON DISPONIBLE À LA SOUSCRIPTION", html)
        self.assertIn("adultes testeurs", html)
        self.assertIn("La couverture reste partielle", html)
        self.assertIn('href="./learning-pass.html"', html)

    def test_palette_and_responsive(self):
        html = read("index.html")
        css = read("landing-dreamy.css")
        self.assertIn("landing-dreamy.css?v=dreamy-20261101", html)
        for color in ("#CFE7F7", "#DDD6F7", "#F6D9E8",
                      "#D8F0E4", "#F9E2D2", "#F8EDBE", "#FFFDF8"):
            self.assertIn(color, css)
        self.assertIn("@media(max-width:510px)", css)
        self.assertIn("prefers-reduced-motion", css)

    def test_new_subpages_are_honest(self):
        features, contact = read("fonctionnalites.html"), read("contact.html")
        for route in ("cours.html", "fiches.html", "audio.html", "quiz.html", "videos.html"):
            self.assertIn('href="./' + route + '"', features)
        self.assertIn("L'IA générative", features)
        self.assertIn("n'est pas encore communiqué", contact)
        self.assertNotIn("<form", contact)


if __name__ == "__main__":
    unittest.main()
