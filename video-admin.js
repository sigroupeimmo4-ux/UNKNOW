(() => {
 'use strict';
 const $=id=>document.getElementById(id),status=$('adminStatus'),panel=$('adminPanel'),list=$('adminVideos');
 const api=window.STUDYBEAM_SUPABASE_URL,key=window.STUDYBEAM_SUPABASE_ANON_KEY;
 const client=window.supabase?.createClient(api,key);
 const field=(name,val)=>{const item=document.createElement('span');item.textContent=name+': '+(val??'—');return item;};
 async function load(){
  list.replaceChildren();status.textContent='Chargement des références…';
  const {data,error}=await client.from('studybeam_videos').select('*').order('created_at',{ascending:false}).limit(150);
  if(error){status.textContent='Erreur : '+error.message;return;}
  status.textContent=(data?.length||0)+' référence(s) dans le catalogue.';
  if(!data?.length){list.textContent='Aucune référence pour le moment.';return;}
  for(const v of data){
   const article=document.createElement('article');article.className='video-admin-item';
   const title=document.createElement('strong');title.textContent=v.title;
   const link=document.createElement('a');link.href=v.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Consulter la source';
   const meta=document.createElement('p');meta.append(field('État',v.status),' · ',field('Classe',v.grade),' · ',field('Matière',v.subject_id),' · ',field('Chapitre',v.chapter_id),' · ',field('Source',v.source));
   const actions=document.createElement('div');actions.className='row';
   for(const [value,label] of [['approved','Valider'],['rejected','Refuser'],['unavailable','Indisponible'],['pending','À vérifier']]){
    const btn=document.createElement('button');btn.className='btn ghost';btn.type='button';btn.textContent=label;
    btn.onclick=async()=>{if(value==='approved'&&!confirm('As-tu vérifié la conformité pédagogique, le chapitre, la langue et le lien de cette vidéo ?'))return;
      btn.disabled=true;const {data:user}=await client.auth.getUser();
      const patch={status:value,reviewed_by:user?.user?.id||null,reviewed_at:new Date().toISOString(),availability_checked_at:new Date().toISOString()};
      const {error}=await client.from('studybeam_videos').update(patch).eq('id',v.id);
      if(error){status.textContent='Erreur : '+error.message;btn.disabled=false;return;}load();};
    actions.append(btn);
   }
   const edit=document.createElement('button');edit.className='btn ghost';edit.type='button';edit.textContent='Modifier';
   edit.onclick=async()=>{const name=prompt('Nouveau titre',v.title);if(name===null)return;const desc=prompt('Nouvelle description',v.description);if(desc===null)return;
     const url=prompt('Nouvelle URL HTTPS',v.url);if(url===null)return;let parsed;try{parsed=new URL(url);if(parsed.protocol!=='https:')throw Error();}catch{status.textContent='URL HTTPS obligatoire.';return;}
     const {error}=await client.from('studybeam_videos').update({title:name,description:desc,url:parsed.href,status:'pending',reviewed_at:null,reviewed_by:null}).eq('id',v.id);
     if(error)status.textContent='Erreur : '+error.message;else load();};
   const del=document.createElement('button');del.className='btn ghost';del.type='button';del.textContent='Supprimer';
   del.onclick=async()=>{if(!confirm('Supprimer définitivement cette référence ?'))return;const {error}=await client.from('studybeam_videos').delete().eq('id',v.id);if(error)status.textContent=error.message;else load();};
   actions.append(edit,del);article.append(title,document.createTextNode(' · '),link,meta,actions);list.append(article);
  }
 }
 async function start(){
  if(!client){status.textContent='Configuration Supabase indisponible.';return;}
  const {data,error}=await client.auth.getUser();
  if(error||!data?.user){status.textContent='Connecte-toi avec un compte administrateur StudyBeam pour accéder à cet espace.';return;}
  if(data.user.app_metadata?.studybeam_role!=='admin'){status.textContent='Accès refusé : ton compte ne possède pas le rôle administrateur.';return;}
  panel.classList.remove('hidden');
  $('refreshVideos').onclick=load;
  $('videoDiscoveryForm').onsubmit=async event=>{
   event.preventDefault();
   const fd=new FormData(event.currentTarget);
   const payload=Object.fromEntries([...fd.entries()].map(([k,v])=>[k,String(v).trim()]));
   const {data:session}=await client.auth.getSession();
   if(!session?.session?.access_token){status.textContent='Session expirée : reconnecte-toi.';return;}
   status.textContent='Recherche YouTube en cours…';
   try{
    const response=await fetch(api+'/functions/v1/video-discovery',{
      method:'POST',
      headers:{'Content-Type':'application/json',apikey:key,Authorization:'Bearer '+session.session.access_token},
      body:JSON.stringify(payload),signal:AbortSignal.timeout(18000)
    });
    const result=await response.json();
    if(!response.ok){status.textContent=result.error==='video_search_not_configured'?'Recherche automatique indisponible : clé API YouTube non configurée.': 'Recherche indisponible : '+(result.error||response.status);return;}
    await load();status.textContent=(result.pending||0)+' suggestion(s) en attente de vérification'+(result.cached?' (résultat déjà en cache).':'.');
   }catch{status.textContent='Impossible de contacter le service de recherche vidéo.';}
  };
  $('adminVideoForm').onsubmit=async event=>{
   event.preventDefault();const form=event.currentTarget;const fd=new FormData(form),get=k=>String(fd.get(k)||'').trim();
   let url;try{url=new URL(get('url'));if(url.protocol!=='https:')throw Error();}catch{status.textContent='Utilise une URL HTTPS valide.';return;}
   const row={title:get('title'),url:url.href,channel:get('channel'),duration_seconds:get('duration_seconds')?Number(get('duration_seconds')):null,
     grade:get('grade'),pathway:get('pathway'),subject_id:get('subject_id'),chapter_id:get('chapter_id'),language:get('language'),source:get('source'),
     description:get('description'),status:'pending',school_year:'2026-2027',provider:'manual'};
   const {error:err}=await client.from('studybeam_videos').insert(row);
   if(err){status.textContent='Ajout impossible : '+err.message;return;}form.reset();load();
  };load();
 }
 start().catch(()=>{status.textContent='Impossible de vérifier les droits administrateur.';});
})();