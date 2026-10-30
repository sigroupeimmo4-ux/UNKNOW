"""Tarifs régionaux proposés, affichage exact et absence de paiement réel."""
import json
import threading
import unittest
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
class PricingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT.parent)));cls.thread=threading.Thread(target=cls.server.serve_forever,daemon=True);cls.thread.start()
        cls.base=f'http://127.0.0.1:{cls.server.server_port}/{ROOT.name}/'
        cls.playwright=sync_playwright().start();cls.browser=cls.playwright.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    @classmethod
    def tearDownClass(cls):
        cls.browser.close();cls.playwright.stop();cls.server.shutdown();cls.server.server_close();cls.thread.join()
    def setUp(self):
        self.context=self.browser.new_context();self.context.route('https://**/*',lambda r:r.abort());self.page=self.context.new_page();self.errors=[];self.page.on('pageerror',lambda e:self.errors.append(str(e)))
    def tearDown(self):self.context.close();self.assertEqual(self.errors,[])
    def open(self,query=''):self.page.goto(self.base+'learning-pass.html'+query,wait_until='networkidle')
    def fixture(self,config):self.context.route('**/data/learning-pass.json',lambda r:r.fulfill(content_type='application/json',body=json.dumps(config)))
    def config(self):return json.loads((ROOT/'data/learning-pass.json').read_text())
    def test_no_country_is_inferred_and_prices_are_proposals(self):
        self.open();expect(self.page.get_by_label('Pays de facturation',exact=True)).to_have_value('')
        expect(self.page.locator('#libraryContent')).to_contain_text('Grille commerciale proposée')
        self.assertEqual(self.page.locator('.plan-price').count(),0)
    def test_senegal_amounts_currency_and_exact_saving(self):
        self.open('?country=SN')
        for plan,amount in [('free','0'),('monthly','2500'),('annual','25000')]:
            expect(self.page.locator(f'[data-plan={plan}] .plan-price')).to_have_attribute('data-amount-minor',amount)
            expect(self.page.locator(f'[data-plan={plan}] .plan-price')).to_have_attribute('data-currency','XOF')
        text=self.page.locator('[data-plan=annual]').inner_text().replace('\u202f',' ').replace('\xa0',' ')
        self.assertIn('25 000 FCFA',text);self.assertIn('5 000 FCFA',text);self.assertIn('30 000 FCFA',text);self.assertIn('2 mois économisés',text)
        expect(self.page.locator('[data-plan=annual] .plan-period')).to_have_text('par an')
    def test_france_prices_have_exact_cents_and_saving(self):
        self.open('?country=FR');expect(self.page.locator('[data-plan=monthly] .plan-price')).to_have_text('3,99 €')
        expect(self.page.locator('[data-plan=annual] .plan-price')).to_have_text('39,90 €')
        expect(self.page.locator('[data-plan=annual]')).to_contain_text('7,98 €');expect(self.page.locator('[data-plan=annual]')).to_contain_text('47,88 €')
        expect(self.page.locator('[data-plan=free] .plan-price')).to_have_text('Gratuit')
    def test_country_selection_direct_links_reload_and_history(self):
        self.open();select=self.page.get_by_label('Pays de facturation',exact=True);select.select_option('SN');expect(self.page).to_have_url(self.base+'learning-pass.html?country=SN')
        self.page.get_by_label('Pays de facturation',exact=True).select_option('FR');expect(self.page).to_have_url(self.base+'learning-pass.html?country=FR');self.page.reload(wait_until='networkidle')
        expect(self.page.get_by_label('Pays de facturation',exact=True)).to_have_value('FR');self.page.go_back();expect(self.page.get_by_label('Pays de facturation',exact=True)).to_have_value('SN')
        self.page.go_forward();expect(self.page.locator('[data-plan=monthly] .plan-price')).to_have_text('3,99 €')
    def test_unknown_market_never_falls_back_to_another_currency(self):
        self.open('?country=US');expect(self.page.locator('#libraryContent')).to_contain_text('n’est pas pris en charge');self.assertEqual(self.page.locator('.plan-price').count(),0)
    def test_changing_json_changes_prices_and_recalculates_saving(self):
        config=self.config();config['markets']['FR']['prices']['annual']['amount_minor']=3400;self.fixture(config)
        self.open('?country=FR');expect(self.page.locator('[data-plan=annual] .plan-price')).to_have_text('34,00 €')
        expect(self.page.locator('[data-plan=annual]')).to_contain_text('13,88 €');self.assertNotIn('2 mois économisés',self.page.locator('[data-plan=annual]').inner_text())
    def test_invalid_amount_does_not_render_a_purchase_price(self):
        config=self.config();config['markets']['FR']['prices']['monthly']['amount_minor']=-1;self.fixture(config)
        self.open('?country=FR');expect(self.page.locator('#libraryTitle')).to_contain_text('ne peut pas être affichée');self.assertEqual(self.page.locator('.plan-price').count(),0)
    def test_payments_cannot_be_enabled_by_a_json_flag(self):
        config=self.config();config['payments']={'enabled':True,'provider':'test'};config['validation']={k:True for k in config['validation']};self.fixture(config)
        posts=[];self.page.on('request',lambda req:posts.append(req.url) if req.method!='GET' else None)
        self.open('?country=FR');buttons=self.page.get_by_role('button',name='Paiement indisponible');expect(buttons).to_have_count(2)
        for b in buttons.all():expect(b).to_be_disabled()
        self.assertEqual(self.page.locator('input[autocomplete^=cc-],iframe').count(),0);self.assertEqual(posts,[])
        expect(self.page.locator('.pricing-conditions')).to_contain_text('parent ou du représentant légal')
        expect(self.page.locator('[data-plan=monthly]')).to_contain_text('Conditions de renouvellement à valider')
        expect(self.page.locator('[data-plan=annual]')).to_contain_text('Modalités de résiliation à valider')
    def test_both_markets_fit_small_screens_with_large_text(self):
        self.open();self.page.evaluate('localStorage.setItem("sw-size","22")')
        for width in [320,390,768,1440]:
            self.page.set_viewport_size({'width':width,'height':900})
            for country in ['SN','FR']:
                self.open('?country='+country);expect(self.page.locator('[data-plan=annual]')).to_be_visible()
                self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),width)
    def test_production_config_keeps_every_launch_validation_pending(self):
        config=self.config();self.assertEqual(config['status'],'proposed');self.assertFalse(config['payments']['enabled']);self.assertIsNone(config['payments']['provider']);self.assertTrue(all(v is False for v in config['validation'].values()))
