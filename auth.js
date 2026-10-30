(() => {
  'use strict';
  const page = document.body.dataset.authPage || 'app';
  const status = document.getElementById('authStatus');
  if (!status) return;
  const form = document.getElementById('authForm');
  const fields = document.getElementById('authFields');
  const submit = document.getElementById('authSubmit');
  const account = document.getElementById('authAccount');
  const signOut = document.getElementById('signOut');
  const login = document.getElementById('accountLogin');
  const continuation = document.getElementById('authContinue');
  const retry = document.getElementById('authRetry');
  let client, busy = false, ready = false, session = null;
  let recoveryEvent = false;
  const callbackParams = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(location.hash.slice(1));
  const callbackError = callbackParams.has('error') || hashParams.has('error') || callbackParams.has('error_code') || hashParams.has('error_code');
  const hadCallback = callbackParams.has('code') || hashParams.has('access_token') || callbackError;
  const recoveryLink = hashParams.get('type') === 'recovery';
  const destination = filename => new URL('./' + filename, location.href).href;
  function message(text, state = '') {
    status.textContent = text;
    status.dataset.state = state;
    if (page === 'callback' && state === 'error') document.querySelector('h1').textContent = 'Ce lien ne peut pas être utilisé.';
  }
  function cleanCallback() {
    if (hadCallback) history.replaceState(null, '', location.pathname);
  }
  function setBusy(value) {
    busy = value;
    if (fields) fields.disabled = value || !ready;
    if (signOut) signOut.disabled = value;
    if (form) form.setAttribute('aria-busy', String(value));
    if (submit) submit.textContent = value ? 'Un instant…' : submit.dataset.label;
  }
  function errorMessage(error) {
    const messages = {
      invalid_credentials: 'L’adresse e-mail ou le mot de passe est incorrect.',
      email_not_confirmed: 'Confirme ton adresse avec le lien reçu par e-mail avant de te connecter.',
      weak_password: 'Choisis un mot de passe plus long et plus difficile à deviner.',
      over_email_send_rate_limit: 'Trop de demandes ont été envoyées. Patiente avant de réessayer.',
      over_request_rate_limit: 'Trop de tentatives. Patiente quelques instants avant de réessayer.',
      signup_disabled: 'Les nouvelles inscriptions sont momentanément fermées.',
      email_address_invalid: 'Vérifie le format de ton adresse e-mail.',
      same_password: 'Choisis un mot de passe différent de ton mot de passe actuel.',
      otp_expired: 'Ce lien a expiré. Demande un nouveau lien pour continuer.',
      session_not_found: 'Ta session a expiré. Reconnecte-toi pour continuer.',
    };
    if (messages[error?.code]) return messages[error.code];
    if (error?.name === 'AuthRetryableFetchError' || error instanceof TypeError) return 'La connexion au service a échoué. Vérifie ta connexion et réessaie.';
    return 'La demande n’a pas abouti. Réessaie dans un instant.';
  }
  function displayAccount(current) {
    if (!account) return;
    account.textContent = current?.user ? 'Connecté : ' + current.user.email : 'Tu n’es pas connecté.';
    if (login) login.hidden = Boolean(current?.user);
    if (signOut) signOut.hidden = !current?.user;
  }
  document.querySelectorAll('[data-password-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.textContent = show ? 'Masquer' : 'Afficher';
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute('aria-label', (show ? 'Masquer ' : 'Afficher ') + (input.id === 'confirmPassword' ? 'la confirmation du mot de passe' : 'le mot de passe'));
    });
  });
  if (submit) submit.dataset.label = submit.textContent.trim();
  if (form) {
    const confirmation = document.getElementById('confirmPassword');
    const password = document.getElementById('password');
    const validateConfirmation = () => {
      if (confirmation) confirmation.setCustomValidity(confirmation.value && confirmation.value !== password.value ? 'Les mots de passe ne correspondent pas.' : '');
    };
    if (confirmation) {
      confirmation.addEventListener('input', validateConfirmation);
      password.addEventListener('input', validateConfirmation);
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !ready) return;
      validateConfirmation();
      if (!form.reportValidity()) return;
      setBusy(true);
      message('Demande en cours…');
      const email = document.getElementById('email')?.value.trim();
      try {
        if (page === 'login') {
          const {data, error} = await client.auth.signInWithPassword({email, password:password.value});
          if (error) throw error;
          if (!data?.session?.user) throw new Error('No authenticated session');
          location.assign(destination('app.html'));
        } else if (page === 'signup') {
          const {data, error} = await client.auth.signUp({email, password:password.value, options:{emailRedirectTo:destination('auth-callback.html')}});
          if (error) throw error;
          password.value = ''; confirmation.value = '';
          if (data?.session?.user) location.assign(destination('app.html'));
          else message('Si cette adresse peut être inscrite, un e-mail de confirmation vient d’être envoyé. Vérifie ta boîte de réception et les courriers indésirables, puis ouvre le lien dans ce navigateur.', 'success');
        } else if (page === 'forgot') {
          const {error} = await client.auth.resetPasswordForEmail(email, {redirectTo:destination('reset-password.html')});
          if (error) throw error;
          message('Si un compte correspond à cette adresse, un lien de réinitialisation a été envoyé. Vérifie ta boîte de réception et ouvre le lien dans ce navigateur.', 'success');
        } else if (page === 'reset') {
          if (!session?.user) throw {code:'session_not_found'};
          const {error} = await client.auth.updateUser({password:password.value});
          if (error) throw error;
          form.reset(); form.hidden = true;
          message('Ton mot de passe a été mis à jour. Tu peux retourner dans ton espace.', 'success');
          continuation.hidden = false;
        }
      } catch (error) {
        message(errorMessage(error), 'error');
      } finally {
        setBusy(false);
      }
    });
  }
  if (signOut) signOut.addEventListener('click', async () => {
    if (busy || !ready) return;
    setBusy(true);
    try {
      const {error} = await client.auth.signOut({scope:'local'});
      if (error) throw error;
      session = null; displayAccount(null);
      message('Tu es déconnecté. La démonstration reste accessible.', 'success');
    } catch (error) {
      message(errorMessage(error), 'error');
    } finally { setBusy(false); }
  });
  async function init() {
    try {
      if (!window.supabase || !window.STUDYBEAM_SUPABASE_URL || !window.STUDYBEAM_SUPABASE_ANON_KEY) throw new Error('Auth configuration unavailable');
      client = window.supabase.createClient(window.STUDYBEAM_SUPABASE_URL, window.STUDYBEAM_SUPABASE_ANON_KEY, {
        auth:{flowType:'pkce', detectSessionInUrl:true, persistSession:true, autoRefreshToken:true}
      });
      window.studybeamAuth = {getSession: () => client.auth.getSession()};
      // Callback synchrone : ne pas attendre une autre méthode auth depuis cet événement.
      client.auth.onAuthStateChange((event, current) => {
        session = current;
        if (event === 'PASSWORD_RECOVERY') recoveryEvent = true;
        displayAccount(current);
        if (page === 'reset' && ready && !current?.user) {
          ready = false; setBusy(false);
          message('Ta session a expiré. Demande un nouveau lien de réinitialisation.', 'error');
        }
      });
      const {data, error} = await client.auth.getSession();
      cleanCallback();
      if (callbackError) {
        message('Ce lien est invalide ou a expiré. Reconnecte-toi ou demande un nouveau lien.', 'error');
        return;
      }
      if (error) {
        if (['login', 'signup', 'forgot'].includes(page)) {
          ready = true; setBusy(false);
          message('La session précédente n’a pas pu être vérifiée. Tu peux te connecter ou refaire ta demande.', 'error');
          return;
        }
        throw error;
      }
      session = data?.session || null;
      displayAccount(session);
      if (page === 'callback') {
        if (session?.user) location.replace(destination(recoveryEvent || recoveryLink ? 'reset-password.html' : 'app.html'));
        else message('Le lien n’a pas permis d’ouvrir une session. Il peut avoir expiré ou avoir été ouvert dans un autre navigateur. Essaie de te connecter ou demande un nouveau lien.', 'error');
        return;
      }
      if ((page === 'login' || page === 'signup') && session?.user) {
        location.replace(destination('app.html')); return;
      }
      if (page === 'reset' && !session?.user) {
        message('Ce lien est incomplet ou a expiré. Demande un nouveau lien de réinitialisation.', 'error');
        return;
      }
      ready = true; setBusy(false);
      if (page === 'app') message(session?.user ? 'Ta session est active.' : 'La démonstration reste accessible sans compte.');
      else message(page === 'reset' ? 'Tu peux maintenant choisir ton nouveau mot de passe.' : '');
    } catch {
      cleanCallback();
      message(page === 'reset' || page === 'callback' ? 'Impossible de vérifier ce lien. Réessaie dans le navigateur où tu as fait la demande ou demande un nouveau lien.' : 'La connexion est momentanément indisponible. Recharge la page pour réessayer.', 'error');
      if (account) account.textContent = 'Impossible de vérifier la session.';
      if (login) login.hidden = false;
      if (signOut) signOut.hidden = true;
      if (retry) retry.hidden = false;
    }
  }
  init();
})();
