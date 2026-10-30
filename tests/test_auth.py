"""Tests des parcours et du contrat SDK avec Supabase simulé, sans compte réel."""
import json
import threading
import unittest
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
USER_SESSION = {'user': {'id': 'test-user', 'email': 'demo@example.test'}}

SDK_STUB = r"""
window.supabase = {createClient(url, key, options) {
  window.recordAuthCall('options', [options]);
  const scenario = window.__authScenario;
  const saved = sessionStorage.getItem('__test_session');
  let session = saved === null ? scenario.initial_session || null : JSON.parse(saved);
  let listener;
  function save(current) { session = current; sessionStorage.setItem('__test_session', JSON.stringify(current)); }
  async function call(name, args) {
    await window.recordAuthCall(name, args);
    if (scenario.delay && name !== 'getSession') await new Promise(r => setTimeout(r, scenario.delay));
    if (scenario.throw_method === name) throw new TypeError('Simulated network failure');
    return scenario[name + '_error'] || null;
  }
  return {auth: {
    onAuthStateChange(callback) { listener = callback; if(scenario.recovery) queueMicrotask(()=>callback('PASSWORD_RECOVERY', session)); return {data:{subscription:{unsubscribe(){}}}}; },
    async getSession() { const error = await call('getSession', []); return {data:{session},error}; },
    async signInWithPassword(args) { const error = await call('signInWithPassword',[args]); if(error)return {error}; save({user:{id:'test-user',email:args.email}}); listener('SIGNED_IN',session); return {data:{session},error:null}; },
    async signUp(args) { const error = await call('signUp',[args]); return {data:{user:{id:'new-user'},session:null},error}; },
    async resetPasswordForEmail(...args) { return {error:await call('resetPasswordForEmail',args)}; },
    async updateUser(args) { return {data:{user:session?.user},error:await call('updateUser',[args])}; },
    async signOut(options) { const error = await call('signOut',[options]); if(!error){save(null);listener('SIGNED_OUT',null);}return {error}; }
  }};
}};
"""


class AuthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT.parent)))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        # Préfixe de déploiement : vérifier aussi les chemins utilisés par GitHub Pages.
        cls.base = f'http://127.0.0.1:{cls.server.server_port}/{ROOT.name}/'
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close(); cls.playwright.stop()
        cls.server.shutdown(); cls.server.server_close(); cls.thread.join()

    def setUp(self):
        self.context = self.browser.new_context()
        self.calls = []
        self.errors = []
        self.context.expose_binding('recordAuthCall', lambda source, name, args: self.calls.append((name, args)))
        self.context.add_init_script('window.__authScenario = {};')
        self.context.route('https://**/*', lambda route: route.abort())
        self.context.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0', lambda route: route.fulfill(content_type='application/javascript', body=SDK_STUB))
        self.page = self.context.new_page()
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])

    def scenario(self, data):
        self.context.add_init_script('window.__authScenario = ' + json.dumps(data) + ';')

    def open(self, filename):
        self.page.goto(self.base + filename, wait_until='networkidle')

    def fill_login(self):
        self.page.get_by_label('Adresse e-mail', exact=True).fill('demo@example.test')
        self.page.get_by_label('Mot de passe', exact=True).fill('Test-password-123')

    def fill_passwords(self, confirmation='Test-password-123'):
        self.page.locator('#password').fill('Test-password-123')
        self.page.locator('#confirmPassword').fill(confirmation)

    def method_calls(self, method):
        return [args for name, args in self.calls if name == method]

    def test_landing_and_programme_link(self):
        self.open('index.html')
        expect(self.page.get_by_role('heading', level=1)).to_contain_text('Un progrès à la fois')
        self.page.get_by_role('link', name='Explorer le référentiel').click()
        expect(self.page).to_have_url(self.base + 'programmes.html')
        expect(self.page.locator('#libraryTitle')).to_have_text('Programmes scolaires français')
        expect(self.page.get_by_role('link',name='École primaire')).to_be_visible()

    def test_login_prevents_double_submit_and_keeps_session(self):
        self.scenario({'delay': 650})
        self.open('login.html'); self.fill_login()
        self.page.locator('#authSubmit').click()
        expect(self.page.locator('#authSubmit')).to_be_disabled()
        self.page.evaluate('document.getElementById("authForm").requestSubmit()')
        expect(self.page).to_have_url(self.base + 'app.html')
        self.page.get_by_role('button', name='Paramètres').click()
        expect(self.page.locator('#authAccount')).to_have_text('Connecté : demo@example.test')
        self.assertEqual(len(self.method_calls('signInWithPassword')), 1)
        self.assertEqual(self.method_calls('options')[0][0]['auth']['flowType'], 'pkce')
        self.page.reload(wait_until='networkidle')
        self.page.get_by_role('button', name='Paramètres').click()
        expect(self.page.locator('#authAccount')).to_have_text('Connecté : demo@example.test')

    def test_login_invalid_credentials(self):
        self.scenario({'signInWithPassword_error': {'code': 'invalid_credentials'}})
        self.open('login.html'); self.fill_login(); self.page.locator('#authSubmit').click()
        expect(self.page.locator('#authStatus')).to_contain_text('incorrect')
        expect(self.page.locator('#authSubmit')).to_be_enabled()
        self.assertTrue(self.page.url.endswith('login.html'))

    def test_login_network_failure_is_retryable(self):
        self.scenario({'throw_method': 'signInWithPassword'})
        self.open('login.html'); self.fill_login(); self.page.locator('#authSubmit').click()
        expect(self.page.locator('#authStatus')).to_contain_text('connexion au service a échoué')
        expect(self.page.locator('#authSubmit')).to_be_enabled()

    def test_signup_confirmation_and_password_validation(self):
        self.open('signup.html')
        self.page.locator('#email').fill('demo@example.test')
        self.fill_passwords('Different-password-123')
        self.page.locator('#authSubmit').click()
        self.assertEqual(len(self.method_calls('signUp')), 0)
        self.assertIn('ne correspondent pas', self.page.locator('#confirmPassword').evaluate('(el) => el.validationMessage'))
        self.page.locator('#confirmPassword').fill('Test-password-123')
        self.page.locator('[data-password-toggle="password"]').click()
        expect(self.page.locator('#password')).to_have_attribute('type', 'text')
        self.page.locator('#authSubmit').click()
        expect(self.page.locator('#authStatus')).to_contain_text('e-mail de confirmation')
        self.assertEqual(self.method_calls('signUp')[0][0]['options']['emailRedirectTo'], self.base + 'auth-callback.html')
        expect(self.page.locator('#password')).to_have_value('')
        self.assertTrue(self.page.url.endswith('signup.html'))

    def test_forgot_password_generic_message_and_redirect(self):
        self.open('forgot-password.html')
        self.page.locator('#email').fill('unknown@example.test'); self.page.locator('#authSubmit').click()
        expect(self.page.locator('#authStatus')).to_contain_text('Si un compte correspond')
        self.assertEqual(self.method_calls('resetPasswordForEmail')[0][1]['redirectTo'], self.base + 'reset-password.html')

    def test_reset_requires_session(self):
        self.open('reset-password.html')
        expect(self.page.locator('#authStatus')).to_contain_text('incomplet ou a expiré')
        expect(self.page.locator('#authSubmit')).to_be_disabled()
        self.assertEqual(self.method_calls('updateUser'), [])

    def test_reset_password_success(self):
        self.scenario({'initial_session': USER_SESSION, 'recovery': True})
        self.open('reset-password.html?code=test-code')
        self.assertEqual(self.page.url, self.base + 'reset-password.html')
        self.fill_passwords(); self.page.locator('#authSubmit').click()
        expect(self.page.locator('#authStatus')).to_contain_text('mot de passe a été mis à jour')
        expect(self.page.locator('#authForm')).to_be_hidden()
        expect(self.page.locator('#authContinue')).to_be_visible()
        self.assertEqual(len(self.method_calls('updateUser')), 1)

    def test_callback_error_does_not_use_existing_session(self):
        self.scenario({'initial_session': USER_SESSION})
        self.open('auth-callback.html?error=access_denied&error_description=%3Cscript%3Ealert(1)%3C/script%3E')
        expect(self.page.locator('#authStatus')).to_contain_text('invalide ou a expiré')
        self.assertEqual(self.page.url, self.base + 'auth-callback.html')
        self.assertNotIn('<script>', self.page.locator('#authStatus').inner_text())

    def test_confirmation_callback_opens_app(self):
        self.scenario({'initial_session': USER_SESSION})
        self.open('auth-callback.html?code=test-code')
        expect(self.page).to_have_url(self.base + 'app.html')

    def test_missing_sdk_disables_form(self):
        self.context.unroute('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0')
        self.open('login.html')
        expect(self.page.locator('#authStatus')).to_contain_text('momentanément indisponible')
        expect(self.page.locator('#authSubmit')).to_be_disabled()
        expect(self.page.locator('#authRetry')).to_be_visible()

    def test_logout_success_clears_account(self):
        self.scenario({'initial_session': USER_SESSION})
        self.open('app.html'); self.page.get_by_role('button', name='Paramètres').click()
        self.page.locator('#signOut').click()
        expect(self.page.locator('#authAccount')).to_have_text('Tu n’es pas connecté.')
        expect(self.page.locator('#accountLogin')).to_be_visible()
        expect(self.page.locator('#signOut')).to_be_hidden()
        self.assertEqual(self.method_calls('signOut')[0][0]['scope'], 'local')
        self.page.reload(wait_until='networkidle')
        self.page.get_by_role('button', name='Paramètres').click()
        expect(self.page.locator('#authAccount')).to_have_text('Tu n’es pas connecté.')

    def test_logout_failure_keeps_account(self):
        self.scenario({'initial_session': USER_SESSION, 'signOut_error': {'code': 'over_request_rate_limit'}})
        self.open('app.html'); self.page.get_by_role('button', name='Paramètres').click()
        self.page.locator('#signOut').click()
        expect(self.page.locator('#authStatus')).to_contain_text('Trop de tentatives')
        expect(self.page.locator('#authAccount')).to_have_text('Connecté : demo@example.test')
        expect(self.page.locator('#signOut')).to_be_enabled()

    def test_expired_previous_session_does_not_block_login(self):
        self.scenario({'getSession_error': {'code': 'refresh_token_not_found'}})
        self.open('login.html')
        expect(self.page.locator('#authSubmit')).to_be_enabled()
        expect(self.page.locator('#authStatus')).to_contain_text('session précédente')
        self.fill_login(); self.page.locator('#authSubmit').click()
        expect(self.page).to_have_url(self.base + 'app.html')

    def test_reset_error_keeps_form_available(self):
        self.scenario({'initial_session': USER_SESSION, 'updateUser_error': {'code': 'same_password'}})
        self.open('reset-password.html'); self.fill_passwords(); self.page.locator('#authSubmit').click()
        expect(self.page.locator('#authStatus')).to_contain_text('différent')
        expect(self.page.locator('#authSubmit')).to_be_enabled()
        expect(self.page.locator('#authContinue')).to_be_hidden()

    def test_beam_applies_only_allowed_actions_from_service(self):
        self.scenario({'initial_session': {**USER_SESSION,'access_token':'fake-test-session'}})
        endpoint='https://yjhwlflbgywxepjhwssl.supabase.co/functions/v1/beam-agent'
        self.context.route('**/agent-config.js*',lambda route:route.fulfill(content_type='application/javascript',body='window.STUDYBEAM_AGENT_ENDPOINT='+json.dumps(endpoint)+';'))
        self.context.route(endpoint,lambda route:route.fulfill(content_type='application/json',headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'},body=json.dumps({'reply':'Voici ta progression.','actions':[{'name':'open_activity','page':'progress'}]})))
        self.open('app.html');self.page.locator('#beamLauncher').click()
        self.page.locator('#message').fill('Aide-moi à retrouver mes résultats')
        self.page.locator('#agentSend').click()
        expect(self.page.locator('#progress')).to_be_visible()
        self.context.route(endpoint,lambda route:route.fulfill(content_type='application/json',headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'},body=json.dumps({'reply':'Action inconnue','actions':[{'name':'run_code','page':'home'}]})))
        self.page.locator('#beamLauncher').click()
        self.page.locator('#message').fill('Autre demande')
        self.page.locator('#agentSend').click()
        expect(self.page.locator('#agentStatus')).to_contain_text('ne peut pas être utilisée')
        expect(self.page.locator('#tutor')).to_be_visible()
