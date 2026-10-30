"""StudyBeam: verify internal links/assets before each GitHub Pages deployment.

Usage: python3 scripts/audit_site.py
Run after scripts/build_navigation_pages.py.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
ISSUES = []
COUNTS = {"pages": 0, "links": 0, "assets": 0}


class LocalLinks(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.source = source

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        sources = []
        if tag == "a":
            sources = [("href", "link")]
        elif tag in ("script", "img", "source", "iframe"):
            sources = [("src", "asset")]
        elif tag == "link" and (
            "stylesheet" in attrs.get("rel", "")
            or "icon" in attrs.get("rel", "")
        ):
            sources = [("href", "asset")]
        elif tag == "form":
            sources = [("action", "link")]
        for attr, kind in sources:
            raw = attrs.get(attr)
            if not raw:
                continue
            if raw.lower().startswith(("javascript:", "vbscript:")):
                ISSUES.append(f"{self.source.name}: forbidden unsafe URL in {tag} {attr}")
                continue
            parsed = urlsplit(raw)
            if parsed.scheme or parsed.netloc or raw.startswith(("#", "//")):
                continue
            # GitHub Pages is served below /UNKNOW/; relative links only.
            if parsed.path.startswith("/"):
                ISSUES.append(f"{self.source.name}: absolute route may fail on GitHub Pages: {raw}")
                continue
            relative = unquote(parsed.path)
            if not relative:
                continue
            target = (self.source.parent / relative).resolve()
            COUNTS["assets" if kind == "asset" else "links"] += 1
            if not target.is_relative_to(ROOT) or not target.is_file():
                ISSUES.append(f"{self.source.name}: {tag} {attr} missing: {raw}")


for path in HTML_FILES:
    COUNTS["pages"] += 1
    parser = LocalLinks(path)
    parser.feed(path.read_text(encoding="utf-8"))

for required in ("index.html", "app.html", "calendrier.html", "mes-notes.html",
                 "beam-3d-apercu.html", "login.html", "signup.html"):
    if not (ROOT / required).is_file():
        ISSUES.append(f"Missing essential page: {required}")

print(f"Site audit: {COUNTS['pages']} pages, {COUNTS['links']} internal links, "
      f"{COUNTS['assets']} local assets checked")
if ISSUES:
    for issue in sorted(set(ISSUES)):
        print("ERROR:", issue, file=sys.stderr)
    raise SystemExit(1)
print("All local references and essential pages are present.")
