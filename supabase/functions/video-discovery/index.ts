// Supabase Edge Function: admin-only YouTube discovery -> pending moderation queue.
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
Deno.serve(async (req: Request) => {
 const origin=Deno.env.get('VIDEO_ALLOWED_ORIGIN')||'';
 const cors={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Vary':'Origin'};
 const reply=(code:number,body:unknown)=>new Response(JSON.stringify(body),{status:code,headers:cors});
 if(!origin || req.headers.get('origin')!==origin)return reply(403,{error:'origin_not_allowed'});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return reply(405,{error:'method_not_allowed'});
 const apiKey=Deno.env.get('YOUTUBE_DATA_API_KEY');
 const url=Deno.env.get('SUPABASE_URL'),publicKey=Deno.env.get('SUPABASE_ANON_KEY'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!apiKey||!url||!publicKey||!secret)return reply(503,{error:'video_search_not_configured'});
 const auth=req.headers.get('Authorization')||'';
 if(!auth.startsWith('Bearer '))return reply(401,{error:'authentication_required'});
 const userClient=createClient(url,publicKey,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await userClient.auth.getUser(auth.substring(7));
 if(error||!user)return reply(401,{error:'invalid_session'});
 if(user.app_metadata?.studybeam_role!=='admin')return reply(403,{error:'admin_required'});
 let payload:Record<string,unknown>;try{payload=await req.json()}catch{return reply(400,{error:'invalid_json'});}
 const read=(key:string)=>typeof payload[key]==='string'?String(payload[key]).trim():'';
 const grade=read('grade'),pathway=read('pathway'),subject_id=read('subject_id'),chapter_id=read('chapter_id');
 const subject_title=read('subject_title'),chapter_title=read('chapter_title');
 if([grade,pathway,subject_id,chapter_id,subject_title,chapter_title].some(x=>!x||x.length>110||!/^[\p{L}\p{N} \-_'().,À-ÿ]+$/u.test(x)))return reply(400,{error:'invalid_curriculum_selection'});
 const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
 const filter={grade,pathway,subject_id,chapter_id,school_year:'2026-2027',provider:'youtube'};
 const {data:cache}=await db.from('studybeam_video_search_cache').select('expires_at,result_count').match(filter).maybeSingle();
 if(cache&&new Date(cache.expires_at).getTime()>Date.now())return reply(200,{cached:true,pending:cache.result_count});
 const q=[grade,subject_title,chapter_title,'cours scolaire français'].join(' ');
 const endpoint=new URL('https://www.googleapis.com/youtube/v3/search');
 endpoint.search=new URLSearchParams({key:apiKey,part:'snippet',type:'video',videoEmbeddable:'true',videoSyndicated:'true',relevanceLanguage:'fr',safeSearch:'strict',maxResults:'10',q}).toString();
 let results:any;try{const response=await fetch(endpoint,{signal:AbortSignal.timeout(12000)});if(!response.ok)return reply(502,{error:'provider_unavailable',provider_status:response.status});results=await response.json();}catch{return reply(502,{error:'provider_unavailable'});}
 const videos=(results.items||[]).filter((item:any)=>/^[\w-]{11}$/.test(item.id?.videoId||'')).map((item:any)=>({
  ...filter,provider_video_id:item.id.videoId,url:'https://www.youtube.com/watch?v='+item.id.videoId,
  title:String(item.snippet?.title||'').slice(0,250),
  channel:String(item.snippet?.channelTitle||'').slice(0,200),
  description:String(item.snippet?.description||'').slice(0,1500),
  source:'YouTube Data API',language:'fr',status:'pending'
 })).filter((v:any)=>v.title.length>=3);
 for(const video of videos){
  const {error}=await db.from('studybeam_videos').upsert(video,{onConflict:'provider,provider_video_id,grade,pathway,subject_id,chapter_id,school_year',ignoreDuplicates:true});
  if(error)return reply(500,{error:'write_failed'});
 }
 const {error:cacheError}=await db.from('studybeam_video_search_cache').upsert({...filter,searched_at:new Date().toISOString(),expires_at:new Date(Date.now()+14*86400000).toISOString(),result_count:videos.length,error_message:null},{onConflict:'grade,pathway,subject_id,chapter_id,school_year,provider'});
 if(cacheError)return reply(500,{error:'cache_failed'});
 return reply(200,{cached:false,pending:videos.length,notice:'Suggestions en attente de validation humaine'});
});
