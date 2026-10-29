(() => {
  const form=document.getElementById('authForm'); if(!form)return;
  const status=document.getElementById('authStatus'), account=document.getElementById('authAccount');
  const url=window.STUDYWINK_SUPABASE_URL,key=window.STUDYWINK_SUPABASE_ANON_KEY;
  let client;
  if(url&&key&&window.supabase){client=window.supabase.createClient(url,key);client.auth.getSession().then(({data})=>update(data.session?.user));client.auth.onAuthStateChange((_e,s)=>update(s?.user));}
  else status.textContent='Connexion non activée : configure un projet Supabase dans supabase-config.js. Aucune connexion fictive.';
  function update(user){account.textContent=user?'Connecté : '+user.email:'Tu n’es pas connecté.';}
  form.addEventListener('submit',async e=>{e.preventDefault();if(!client)return;const email=document.getElementById('authEmail').value.trim(),password=document.getElementById('authPassword').value,mode=e.submitter?.value;status.textContent='Connexion en cours…';const result=mode==='signup'?await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}}):await client.auth.signInWithPassword({email,password});status.textContent=result.error?result.error.message:mode==='signup'?'Inscription envoyée. Vérifie ta boîte mail si la confirmation est activée.':'Connexion réussie.';});
  document.getElementById('signOut').addEventListener('click',async()=>{if(!client)return;const {error}=await client.auth.signOut();status.textContent=error?error.message:'Déconnexion effectuée.';});
})();

