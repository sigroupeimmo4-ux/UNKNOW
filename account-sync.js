/* Mission 2: opt-in account synchronization. Local learning history remains available offline. */
(() => {
 'use strict';
 const store = window.studybeamStorage;
 if (!store || !window.supabase || !window.STUDYBEAM_SUPABASE_URL) return;
 const client = window.supabase.createClient(window.STUDYBEAM_SUPABASE_URL,window.STUDYBEAM_SUPABASE_ANON_KEY,{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 let userId = null, syncing = false;
 const status = document.getElementById('accountSyncStatus');
 const inform = text => { if(status) status.textContent=text; };
 const getHistory = () => (store.json('sw-learning-history')?.items || []).filter(x=>x && typeof x.id==='string' && /^[a-z0-9-]{1,120}$/.test(x.id) && typeof x.at==='string' && !Number.isNaN(Date.parse(x.at))).slice(0,20);
 async function refresh() {
  if(syncing) return;
  syncing=true;
  try {
   const {data:{user},error} = await client.auth.getUser();
   if(error || !user){userId=null;inform('Hors connexion : progression enregistrée sur cet appareil.');return;}
   userId=user.id;
   const {data:remote,error:readError}=await client.from('learning_progress').select('chapter_id,last_opened_at').order('last_opened_at',{ascending:false}).limit(20);
   if(readError) throw readError;
   const merged=new Map();
   for(const item of [...getHistory(),...(remote||[]).map(x=>({id:x.chapter_id,at:x.last_opened_at}))]){
    if(!item || !/^[a-z0-9-]{1,120}$/.test(item.id) || !Number.isFinite(Date.parse(item.at))) continue;
    if(!merged.has(item.id) || merged.get(item.id).at < item.at) merged.set(item.id,item);
   }
   const items=[...merged.values()].sort((a,b)=>b.at.localeCompare(a.at)).slice(0,20);
   // Keep device history until a successful remote write.
   if(items.length){
    const {error:writeError}=await client.from('learning_progress').upsert(items.map(x=>({user_id:user.id,chapter_id:x.id,last_opened_at:x.at,status:'opened',updated_at:new Date().toISOString()})),{onConflict:'user_id,chapter_id'});
    if(writeError) throw writeError;
   }
   store.set('sw-learning-history',JSON.stringify({items}));
   window.studybeamDashboard?.refresh();
   inform('Progression synchronisée avec ton compte.');
  }catch{inform('Synchronisation indisponible : ton historique local est conservé.');}
  finally {syncing=false;}
 }
 async function saveProfile(name) {
  if(!userId)return false;
  const clean=String(name||'').trim().slice(0,50);
  const {error}=await client.from('student_profiles').upsert({user_id:userId,display_name:clean,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(error)throw error;
  return true;
 }
 async function loadProfile(){
  if(!userId)return;
  try{
   const {data,error}=await client.from('student_profiles').select('display_name').eq('user_id',userId).maybeSingle();
   if(error)throw error;
   if(data && typeof data.display_name==='string' && !store.get('sw-display-name')){store.set('sw-display-name',data.display_name);window.studybeamDashboard?.refresh();}
  }catch{inform('Profil en ligne indisponible : préférences locales conservées.');}
 }
 window.studybeamAccountSync={refresh,saveProfile};
 document.addEventListener('studybeam:history-changed',()=>{void refresh();});
 document.addEventListener('studybeam:profile-changed',event=>{void saveProfile(event.detail?.name).catch(()=>inform('Prénom conservé localement, synchronisation impossible.'));});
 void refresh().then(loadProfile);
 client.auth.onAuthStateChange((event)=>{if(event==='SIGNED_IN')queueMicrotask(()=>{void refresh().then(loadProfile);});if(event==='SIGNED_OUT'){userId=null;inform('Déconnecté : données locales conservées.');}});
})();
