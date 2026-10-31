#!/usr/bin/env python3
"""Contrôles statiques StudyBeam, sans dépendances ni accès aux données utilisateurs."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys

ROOT = Path(__file__).resolve().parent
EXCLUDED = {".git", "node_modules", ".venv"}
FAILURES = []
WARNINGS = []

class PageParser(HTMLParser):
    def __init__(self, page):
        super().__init__(convert_charrefs=True)
        self.page = page
        self.links = []
        self.title = False
        self.has_title = False
        self.has_lang = False
        self.has_viewport = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html" and a.get("lang"):
            self.has_lang = True
        if tag == "title":
            self.has_title = True
        if tag == "meta" and a.get("name", "").lower() == "viewport":
            self.has_viewport = True
        for key in ("href", "src"):
            if tag in ("a", "link", "script", "img", "source", "iframe") and a.get(key):
                self.links.append((tag, key, a[key]))
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

pages = sorted(p for p in ROOT.rglob("*.html") if not (set(p.relative_to(ROOT).parts) & EXCLUDED))
if not pages:
    FAILURES.append("Aucune page HTML trouvée")
for page in pages:
    rel = page.relative_to(ROOT)
    try:
        parser = PageParser(page)
        parser.feed(page.read_text(encoding="utf-8"))
    except (UnicodeDecodeError, OSError, ValueError) as exc:
        FAILURES.append(f"{rel}: lecture HTML impossible : {exc}")
        continue
    for present, label in ((parser.has_title, "title"), (parser.has_lang, "html lang"), (parser.has_viewport, "viewport")):
        if not present:
            WARNINGS.append(f"{rel}: balise {label} absente")
    for tag, key, url in parser.links:
        if url.startswith(("#", "//")) or urlsplit(url).scheme or url.startswith(("mailto:", "tel:", "data:", "javascript:")):
            continue
        pathname = unquote(urlsplit(url).path)
        if not pathname:
            continue
        target = (ROOT / pathname.lstrip("/")) if pathname.startswith("/") else (page.parent / pathname)
        if target.is_dir():
            target /= "index.html"
        if not target.exists():
            FAILURES.append(f"{rel}: {tag}[{key}] -> {url} introuvable")

print(f"StudyBeam : {len(pages)} pages HTML examinées")
for message in WARNINGS:
    print(f"AVERTISSEMENT : {message}")
for message in FAILURES:
    print(f"ERREUR : {message}")
print(f"{len(FAILURES)} erreurs, {len(WARNINGS)} avertissements")
sys.exit(1 if FAILURES else 0)
