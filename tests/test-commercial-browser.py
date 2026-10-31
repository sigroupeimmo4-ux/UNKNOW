"""Browser smoke tests for public prelaunch (no user accounts, no payment secrets)."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
handler=partial(SimpleHTTPRequestHandler,directory=str(ROOT))
server=ThreadingHTTPServer(("127.0.0.1",0),handler)
Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_port}"
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        for width,height in ((390,844),(768,1024),(1440,900)):
            page=browser.new_page(viewport={"width":width,"height":height},device_scale_factor=1)
            # Avoid making requests to external CDN, authentication or videos in smoke checks.
            page.route("**/*",lambda route:route.continue_() if route.request.url.startswith(base) else route.abort())
            page.goto(base+"/index.html",wait_until="domcontentloaded")
            assert page.locator("h1").count()==1, f"Homepage heading at {width}"
            assert page.get_by_role("link",name="Mentions légales").count()>=1
            assert page.get_by_role("link",name="CGU").count()>=1
            assert page.get_by_role("link",name="État du lancement").count()>=1
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+3"),f"Homepage overflow at {width}"
            if width<=768:
                summary=page.locator(".landing-menu summary")
                assert summary.is_visible(),f"Menu missing at {width}"
                summary.click()
                assert page.locator(".landing-menu").evaluate("(x)=>x.open"),"Menu failed to open"
                page.locator(".landing-menu a[href='#comment-ca-marche']").click()
                assert not page.locator(".landing-menu").evaluate("(x)=>x.open"),"Menu failed to close"
            page.goto(base+"/statut-ouverture.html",wait_until="domcontentloaded")
            assert page.get_by_role("heading",name="Où en est l’ouverture de StudyBeam ?").count()==1
            assert page.get_by_text("Ouverture commerciale : non autorisée pour l'instant").count()==1
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+3"),f"Status page overflow at {width}"
            for route in ("mentions-legales.html","conditions-utilisation.html","confidentialite.html","conditions-vente.html"):
                page.goto(base+"/"+route,wait_until="domcontentloaded")
                assert page.locator("main h1").count()==1,f"Missing heading on {route}"
                assert page.locator("a[href='./index.html']").count()>=1
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+3"),f"Legal overflow {route} at {width}"
            page.goto(base+"/signup.html",wait_until="domcontentloaded")
            assert page.locator("#adultTester").get_attribute("required") is not None,"Adult test checkbox not required"
            print(f"OK: public pages and beta signup at {width}px")
            page.close()
        browser.close()
finally:
    server.shutdown()
