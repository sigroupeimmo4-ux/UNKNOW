(() => {
  'use strict';
  const form = document.getElementById('chatForm');
  if (!form) return;
  const input = document.getElementById('message');
  const send = document.getElementById('agentSend');
  const status = document.getElementById('agentStatus');
  const transcript = document.getElementById('chat');
  const allowed = new Set(['home', 'course', 'sheets', 'audio', 'quiz', 'progress', 'curriculum', 'settings', 'videos']);
  const names = {home:'Accueil',course:'Cours',sheets:'Fiches',audio:'Audio',quiz:'Quiz',progress:'Progression',curriculum:'Programmes',settings:'Paramètres',videos:'Vidéos'};
  const endpoint = window.STUDYBEAM_AGENT_ENDPOINT;
  const history = [];
  let busy = false;
  function beamState(state) { document.dispatchEvent(new CustomEvent('studybeam:beam-state', {detail:{state}})); }

  function bubble(text, who) {
    const el = document.createElement('div'); el.className = 'bubble ' + who; el.textContent = text;
    transcript.append(el); transcript.scrollTop = transcript.scrollHeight;
  }
  function act(action) {
    if (action?.name !== 'open_activity' || !allowed.has(action?.page)) throw new Error('unsupported_action');
    showPage(action.page);
    document.getElementById('beamActionStatus').textContent = 'Beam a ouvert : ' + names[action.page];
    return 'J’ai ouvert : ' + names[action.page] + '.';
  }
  // Le panneau flottant n'interrompt pas la page scolaire consultée.
  document.getElementById('beamLauncher').onclick = () => window.studybeamBeamPanel?.open();
  document.querySelectorAll('[data-beam-page]').forEach(button => button.onclick = () => {
    bubble(act({name:'open_activity',page:button.dataset.beamPage}), 'bot');
  });

  // Panneau indépendant : la conversation reste disponible sans changer de page.
  const aside=document.createElement('aside');
  aside.className='beam-dock'; aside.id='beamDock'; aside.hidden=true;
  aside.setAttribute('aria-label','Conversation avec Beam');
  const heading=document.createElement('div'); heading.className='beam-dock-head';
  const title=document.createElement('strong'); title.textContent='Beam · mon compagnon';
  const close=document.createElement('button');close.type='button';close.className='btn ghost';close.textContent='Fermer';close.setAttribute('aria-label','Fermer Beam');
  heading.append(title,close);
  const tools=document.createElement('div');tools.className='beam-dock-tools';
  const fresh=document.createElement('button');fresh.type='button';fresh.className='btn ghost';fresh.textContent='Nouvelle conversation';
  const quiet=document.createElement('label');quiet.className='beam-quiet-label';const quietBox=document.createElement('input');quietBox.type='checkbox';quietBox.checked=window.studybeamStorage?.get('beam-quiet')==='true';quiet.append(quietBox,document.createTextNode(' Mode discret'));
  tools.append(fresh,quiet);
  const prompts=document.createElement('div');prompts.className='beam-prompts';
  const suggestions=['Recommande-moi des vidéos','Explique-moi un cours','Donne-moi un indice','Aide-moi à faire un exercice','Prépare une fiche de révision','Fais-moi réviser','Teste mes connaissances'];
  for(const suggestion of suggestions){const b=document.createElement('button');b.type='button';b.className='btn ghost';b.textContent=suggestion;b.addEventListener('click',()=>{if(suggestion==='Recommande-moi des vidéos'){location.assign('./videos.html');return;}input.value=suggestion;input.focus();});prompts.append(b);}
  const tutorial=document.getElementById('tutor');
  const agentConnection=document.getElementById('agentConnection');
  const note=document.createElement('p');note.className='small muted';note.textContent='La génération de réponses nécessite le service IA serveur. Sans connexion, seuls les raccourcis fonctionnent.';
  aside.append(heading,agentConnection,prompts,transcript,form,status,tools,note);
  document.body.append(aside);
  const reopen=document.createElement('button');reopen.type='button';reopen.className='btn';reopen.textContent='Ouvrir le chat Beam';reopen.onclick=()=>openDock();
  tutorial.querySelector('.pagebox')?.append(reopen);
  const launcher=document.getElementById('beamLauncher');
  function openDock(){beamState('greet');aside.hidden=false;launcher.setAttribute('aria-expanded','true');input.focus();}
  function closeDock(){beamState('idle');aside.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus();}
  close.onclick=closeDock;
  fresh.onclick=()=>{history.length=0;transcript.replaceChildren();bubble('Coucou ! Je suis Beam, ton compagnon d’apprentissage. Qu’est-ce qu’on découvre aujourd’hui ?','bot');status.textContent='';input.focus();};
  quietBox.onchange=()=>{window.studybeamStorage?.set('beam-quiet',String(quietBox.checked));document.documentElement.classList.toggle('beam-quiet',quietBox.checked);};
  document.documentElement.classList.toggle('beam-quiet',quietBox.checked);
  window.studybeamBeamPanel={open:openDock,close:closeDock};
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!aside.hidden)closeDock();});
  // L'avatar ne doit jamais masquer les principaux contrôles d'un formulaire.

  let service = null;
  try {
    if (endpoint) {
      const parsed = new URL(endpoint);
      // La session ne peut être envoyée qu’à la fonction du projet Supabase configuré.
      const project = new URL(window.STUDYBEAM_SUPABASE_URL);
      if (parsed.protocol === 'https:' && parsed.origin === project.origin && /^\/functions\/v1\/[a-z0-9-]+$/.test(parsed.pathname) && !parsed.search && !parsed.hash) service = parsed.href;
    }
  } catch { /* Configuration invalide : pas d’envoi de session. */ }
  document.getElementById('agentConnection').textContent = service ? 'Service IA configuré · connexion requise' : 'API IA à connecter · raccourcis disponibles';
  function command(text) {
    const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    if (!/^(ouvre|ouvrir|affiche|afficher|montre|va|aller)\b/.test(normalized)) return null;
    if (/quiz/.test(normalized)) return 'quiz';
    if (/programme|referentiel/.test(normalized)) return 'curriculum';
    if (/progression|progres/.test(normalized)) return 'progress';
    if (/fiche/.test(normalized)) return 'sheets';
    if (/cours/.test(normalized)) return 'course';
    return null;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const text = input.value.trim(); if (!text) return;
    bubble(text,'me'); input.value = ''; status.textContent = '';
    const page = command(text);
    if (page) {bubble(act({name:'open_activity',page}), 'bot'); return;}
    if (!service) {
      bubble('Mon API IA n’est pas encore connectée. Je ne peux pas encore générer cette réponse. Tu peux utiliser mes raccourcis pour ouvrir tes activités.','bot'); return;
    }
    beamState('think');
    busy = true; send.disabled = true; input.disabled = true; form.setAttribute('aria-busy','true');
    const controller = new AbortController(); const timer = setTimeout(()=>controller.abort(),30000);
    try {
      const {data,error} = await window.studybeamAuth.getSession();
      if (error || !data?.session?.access_token) {status.textContent='Connecte-toi pour utiliser le service IA.';return;}
      status.textContent = 'Beam prépare sa réponse…';
      const response = await fetch(service, {method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token,apikey:window.STUDYBEAM_SUPABASE_ANON_KEY},body:JSON.stringify({message:text,history:history.slice(-8).map(m=>({role:m.role,content:m.content.slice(0,1000)})),context:window.studybeamSchool.getContext()})});
      if (!response.ok) throw new Error(String(response.status));
      const result = await response.json();
      if (typeof result.reply !== 'string' || !result.reply.trim() || result.reply.length > 10000 || !Array.isArray(result.actions) || result.actions.length > 3) throw new Error('invalid_response');
      // Valider toute la liste avant toute action. Aucun code ni URL libre n’est exécuté.
      if (result.actions.some(a=>a?.name!=='open_activity'||!allowed.has(a.page))) throw new Error('invalid_action');
      beamState('talk');
      bubble(result.reply,'bot');
      for (const action of result.actions) bubble(act(action),'bot');
      history.push({role:'user',content:text},{role:'assistant',content:result.reply});
      status.textContent = '';
    } catch (error) {
      status.textContent = error?.name==='AbortError' ? 'Le service met trop de temps à répondre. Réessaie.' : error?.message==='401' ? 'Ta session a expiré. Reconnecte-toi.' : 'Le service IA est indisponible ou sa réponse ne peut pas être utilisée. Réessaie plus tard.';
    } finally {
      beamState('idle');
      clearTimeout(timer);busy=false;send.disabled=false;input.disabled=false;form.setAttribute('aria-busy','false');
    }
  });
  document.addEventListener('studybeam:demo-quiz-completed',event=>{
    const score=event.detail?.score,total=event.detail?.total;
    if(!Number.isInteger(score)||!Number.isInteger(total)||total<=0||score<0||score>total)return;
    if(quietBox.checked)return;
    document.documentElement.classList.remove('beam-celebrate');
    if(score===total){document.documentElement.classList.add('beam-celebrate');beamState('happy');}
    const toast=document.getElementById('beamActionStatus');
    if(toast)toast.textContent=score===total?'Bravo pour ton quiz de démonstration !':'Tu avances ! Tu peux revoir la fiche et réessayer.';
  });

})();
