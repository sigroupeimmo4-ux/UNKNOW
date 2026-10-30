/* Pages et vues à URL propre, à partir du catalogue existant. Aucun contenu scolaire inventé. */
(() => {
  'use strict';
  const mode=document.body.dataset.library;
  if(!mode)return;
  const $=id=>document.getElementById(id), box=$('libraryContent'), status=$('libraryStatus');
  const params=new URLSearchParams(location.search);
  const files={programmes:'programmes.html',course:'cours.html',revision_sheet:'fiches.html',audio:'audio.html',quiz:'quiz.html',videos:'videos.html',pass:'learning-pass.html',resource:'ressource.html',about:'a-propos.html'};
  const labels={course:'Cours',revision_sheet:'Fiches',audio:'Audio',quiz:'Quiz',exercise:'Exercices',assessment:'Évaluation',assistant_explanation:'Explication guidée',videos:'Vidéos',pass:'Learning Pass'};
  const paths={commun:'Commun',generale:'Générale',technologique:'Technologique',professionnelle:'Professionnelle','generale-technologique':'Générale et technologique'};
  const types={commun:'Enseignements communs',specialite:'Spécialités',option:'Options',professionnel:'Enseignements professionnels'};
  const levels=[{id:'primaire',title:'École primaire',grades:['CP','CE1','CE2','CM1','CM2'],path:'commun'},{id:'college',title:'Collège',grades:['6e','5e','4e','3e'],path:'commun'},{id:'general',title:'Lycée général',grades:['2nde','1re','Terminale'],path:'generale'},{id:'technologique',title:'Lycée technologique',grades:['2nde','1re','Terminale'],path:'technologique'},{id:'professionnel',title:'Lycée professionnel',grades:['2nde','1re','Terminale'],path:'professionnelle'}];
  let data,parentUrl='./index.html';
  const node=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
  function href(file,values={}){const search=new URLSearchParams();for(const [key,value] of Object.entries(values))if(value!==undefined&&value!==null&&value!=='')search.set(key,String(value));return './'+file+(search.size?'?'+search:'');}
  const link=(title,url,cls)=>{const el=node('a',title,cls);el.href=url;return el;};
  function header(title,intro,crumbs=[]){$('libraryTitle').textContent=title;$('libraryIntro').textContent=intro;document.title=title+' — StudyBeam';$('libraryBreadcrumbs').replaceChildren();for(const crumb of [{title:'Accueil',url:'./index.html'},...crumbs,{title}]){const item=node('li');if(crumb.url)item.append(link(crumb.title,crumb.url));else item.append(node('span',crumb.title));$('libraryBreadcrumbs').append(item);}const last=$('libraryBreadcrumbs').lastElementChild?.firstElementChild;if(last)last.setAttribute('aria-current','page');status.textContent='';}
  function card(parent,title,description,url){const el=link('',url,'route-card');el.append(node('h3',title),node('p',description));parent.append(el);}
  function grid(){const el=node('div',undefined,'route-grid');box.append(el);return el;}
  function empty(text){box.append(node('p',text,'alert'));}
  function scopedSubjects(scope,type='',variant=''){return scope.subjects.filter(s=>(!type||s.teaching_type===type)&&(!s.variant||!variant||s.variant===variant));}
  function program(scope,subject){return data.programs.find(p=>p.scope_id===scope.id&&p.subject_id===subject.id);}
  function chapters(p){return p && window.studybeamCurriculum.applicable(p)?p.domains.flatMap(d=>d.chapters):[];}
  function content(p,ch,kind){return data.contents.find(c=>c.kind===kind&&window.studybeamCurriculum.eligibleContent(p,c,ch.id));}
  function reference(p,subject){const refs=node('div',undefined,'resource-reference');for(const item of subject.references||[]){try{const u=new URL(item.url);if(u.protocol==='https:'&&(u.hostname==='education.gouv.fr'||u.hostname.endsWith('.education.gouv.fr'))){const a=link(item.title||'Texte de référence',u.href);a.target='_blank';a.rel='noopener noreferrer';refs.append(a,node('br'));}}catch{}}
    if(p?.legal_source){const a=link(p.legal_source.text_reference,p.legal_source.url);a.target='_blank';a.rel='noopener noreferrer';refs.append(a);}
    box.append(refs);
  }
  function formats(p,ch,parent){const nav=node('nav',undefined,'route-actions resource-links');nav.setAttribute('aria-label','Ressources associées au chapitre');for(const kind of Object.keys(labels)){if(content(p,ch,kind)){const file=files[kind]||'ressource.html';nav.append(link(labels[kind],href(file,{lesson:ch.id,...(!files[kind]?{kind}: {})}),'btn ghost'));}}parent.append(nav);}
  function calendar(scope){
    const details=node('details');details.append(node('summary','Calendrier vérifié des réformes pour cette classe'));
    const list=node('ul');for(const transition of data.transitions||[]){const stage=transition.stages.find(s=>s.scopes.includes(scope.id));if(!stage||transition.review_status!=='verified')continue;const item=node('li',transition.title+' : '+(stage.effective_from>'2026-09-01'?'rentrée future ':'application depuis la rentrée ')+stage.effective_from.slice(0,4)+'. ');const a=link(transition.source_locator,transition.source_url);a.target='_blank';a.rel='noopener noreferrer';item.append(a);list.append(item);}
    details.append(list.children.length?list:node('p','Calendrier détaillé encore à vérifier pour ce parcours.'));box.append(details);
  }
  function programmePage(){
    const level=levels.find(l=>l.id===params.get('level'));
    const grade=params.get('grade');
    if(params.get('level')&&!level)throw new Error('Niveau inconnu');
    if(!level){header('Programmes scolaires français','Choisis un niveau. Le référentiel est en cours de vérification et ne couvre pas encore tous les contenus.');const g=grid();for(const l of levels)card(g,l.title,l.grades.join(' · '),href(files.programmes,{level:l.id}));return;}
    const base={level:level.id};const levelUrl=href(files.programmes,base);parentUrl='./programmes.html';
    if(!grade){header(level.title,'Choisis ta classe pour consulter les matières recensées.',[{title:'Programmes',url:'./programmes.html'}]);const g=grid();for(const value of level.grades){card(g,value,value==='2nde'&&['general','technologique'].includes(level.id)?'Seconde générale et technologique : tronc commun partagé.':'Matières et ressources recensées',href(files.programmes,{...base,grade:value}));}return;}
    if(!level.grades.includes(grade))throw new Error('Classe inconnue');
    const pathway=grade==='2nde'&&['general','technologique'].includes(level.id)?'generale-technologique':level.path;
    const scope=data.scopes.find(s=>s.grade===grade&&s.pathway===pathway);if(!scope)throw new Error('Parcours indisponible');
    const classValues={...base,grade};const classUrl=href(files.programmes,classValues);const subject=scope.subjects.find(s=>s.id===params.get('subjectId'));
    if(params.get('subjectId')&&!subject)throw new Error('Matière inconnue');
    const crumbs=[{title:'Programmes',url:'./programmes.html'},{title:level.title,url:levelUrl}];parentUrl=levelUrl;
    if(!subject){header(grade+' — '+level.title,'Matières recensées, avec distinction entre enseignements communs, spécialités et options. La couverture et les variantes restent à vérifier.',crumbs);
      if(scope.variants?.length){const nav=node('div',undefined,'route-actions');nav.append(link('Toutes les séries',classUrl,'btn ghost'));for(const variant of scope.variants)nav.append(link(variant.title,href(files.programmes,{...classValues,variant:variant.id}),'btn ghost'));box.append(nav);}
      const variant=params.get('variant')||'';calendar(scope);
      for(const type of [...new Set(scope.subjects.map(s=>s.teaching_type))]){const subjects=scopedSubjects(scope,type,variant);if(!subjects.length)continue;box.append(node('h2',types[type]||type));const g=grid();for(const sub of subjects)card(g,sub.title,(sub.variant?sub.variant+' · ':'')+'Chapitres disponibles et références',href(files.programmes,{...classValues,subjectId:sub.id}));}
      return;
    }
    const p=program(scope,subject);const chapter=chapters(p).find(c=>c.id===params.get('chapterId'));if(params.get('chapterId')&&!chapter)throw new Error('Chapitre inconnu');parentUrl=classUrl;crumbs.push({title:grade,url:classUrl});
    if(!chapter){header(subject.title,grade+' · '+paths[pathway]+' · '+(types[subject.teaching_type]||''),crumbs);reference(p,subject);calendar(scope);const list=chapters(p);
      if(!list.length){empty('Aucun chapitre pédagogique disponible et vérifié pour cette sélection. Les références recensées ne sont pas une intégration complète du programme.');return;}
      const g=grid();for(const ch of list)card(g,ch.title,'Chapitre pédagogique relié au texte de référence ; couverture partielle.',href(files.programmes,{...classValues,subjectId:subject.id,chapterId:ch.id}));return;
    }
    parentUrl=href(files.programmes,{...classValues,subjectId:subject.id});crumbs.push({title:subject.title,url:parentUrl});header(chapter.title,'Chapitre pédagogique disponible. Cet intitulé ne remplace pas la section officielle citée.',crumbs);reference(p,subject);const list=node('ul');for(const notion of chapter.notions)list.append(node('li',typeof notion==='string'?notion:notion.text));box.append(list);formats(p,chapter,box);
  }
  function selection(){
    const saved=window.studybeamSchool?.getSelection()||{};
    const grade=params.get('grade')||saved.grade||'CP';
    const scopes=data.scopes.filter(s=>s.grade===grade);if(!scopes.length)throw new Error('Classe inconnue');
    const scope=scopes.find(s=>s.pathway===(params.get('pathway')||saved.pathway))||scopes[0];
    if(params.has('pathway') && scope.pathway!==params.get('pathway'))throw new Error('Voie inconnue');
    const type=params.get('type')||'';const variant=params.get('variant')||'';
    const subjects=scopedSubjects(scope,type,variant);
    const subject=subjects.find(s=>s.id===params.get('subjectId'));
    return {grade,scope,type,variant,subjects,subject,chapterId:params.get('chapterId')||'',q:params.get('q')||''};
  }
  function filters(kind,selected){
    const form=node('form',undefined,'resource-filters');form.method='get';form.action='./'+files[kind];form.setAttribute('aria-label','Filtres des ressources');
    function select(name,title,items,value,all){const wrapper=node('div'),id='filter-'+name;const label=node('label',title);label.htmlFor=id;const control=node('select');control.id=id;control.name=name;if(all)control.add(new Option(all,''));for(const item of items)control.add(new Option(item.title,item.id));if([...control.options].some(o=>o.value===value))control.value=value;wrapper.append(label,control);form.append(wrapper);return control;}
    const grade=select('grade','Classe',[...new Set(data.scopes.map(s=>s.grade))].map(id=>({id,title:id})),selected.grade);
    const pathway=select('pathway','Voie',data.scopes.filter(s=>s.grade===selected.grade).map(s=>({id:s.pathway,title:paths[s.pathway]})),selected.scope.pathway);
    const type=select('type','Enseignement',[...new Set(selected.scope.subjects.map(s=>s.teaching_type))].map(id=>({id,title:types[id]})),selected.type,'Tous les enseignements');
    const variant=select('variant','Série',(selected.scope.variants||[]),selected.variant,'Toutes les séries');variant.parentElement.hidden=!selected.scope.variants?.length;
    const sub=select('subjectId','Matière',selected.subjects,selected.subject?.id||'','Toutes les matières');
    const chapterChoices=selected.subject?chapters(program(selected.scope,selected.subject)):selected.subjects.flatMap(s=>chapters(program(selected.scope,s)));
    select('chapterId','Chapitre',chapterChoices,selected.chapterId,'Tous les chapitres disponibles');
    const search=node('div',undefined,'search-field');const label=node('label','Rechercher une matière ou un chapitre');label.htmlFor='resource-search';const input=node('input');input.id='resource-search';input.name='q';input.type='search';input.value=selected.q;input.maxLength=100;search.append(label,input);form.append(search);
    const submit=node('button','Filtrer','btn');submit.type='submit';form.append(submit,link('Réinitialiser les filtres','./'+files[kind],'route-back'));box.append(form);
    for(const control of [grade,pathway,type,variant,sub])control.addEventListener('change',()=>{
      const values=Object.fromEntries(new FormData(form));delete values.chapterId;
      if(control===grade){delete values.pathway;delete values.variant;delete values.subjectId;delete values.type;}
      if(control===pathway){delete values.variant;delete values.subjectId;delete values.type;}
      if(control===type||control===variant)delete values.subjectId;
      location.assign(href(files[kind],values));
    });
  }
  const normalize=text=>text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function resourceList(kind){
    const selected=selection();header(labels[kind],kind==='quiz'?'Choisis un quiz disponible. La difficulté n’est pas renseignée dans les activités actuelles.':'Filtre les ressources disponibles par classe, matière et chapitre.');filters(kind,selected);
    const g=grid();let count=0;
    for(const subject of selected.subject?[selected.subject]:selected.subjects){const p=program(selected.scope,subject);for(const chapter of chapters(p)){
      if(!content(p,chapter,kind)||selected.chapterId&&chapter.id!==selected.chapterId||selected.q&&!normalize(subject.title+' '+chapter.title).includes(normalize(selected.q)))continue;
      card(g,chapter.title,selected.grade+' · '+subject.title+' · '+labels[kind],href(files[kind],{lesson:chapter.id}));count++;
    }}
    if(!count)empty('Aucune ressource disponible et vérifiée pour ces filtres. La couverture est partielle ; aucun contenu de démonstration n’est substitué.');
    box.append(link('Consulter les démonstrations séparées','./app.html#demo','route-back'));
  }
  async function detail(kind){
    const id=params.get('lesson');let found;
    for(const p of data.programs){const ch=chapters(p).find(c=>c.id===id);if(ch&&content(p,ch,kind)){found={p,ch};break;}}
    if(!found)throw new Error('Ressource inconnue ou non disponible');
    const {p,ch}=found;const scope=data.scopes.find(s=>s.id===p.scope_id),subject=scope.subjects.find(s=>s.id===p.subject_id);
    parentUrl=href(files[kind]||'cours.html',{grade:scope.grade,pathway:scope.pathway,subjectId:subject.id});
    header(ch.title,labels[kind]+' · '+scope.grade+' · '+subject.title,[{title:labels[kind],url:'./'+(files[kind]||'cours.html')},{title:scope.grade,url:parentUrl}]);
    await window.studybeamCurriculum.open({grade:scope.grade,pathway:scope.pathway,type:p.teaching_type,variant:p.variant||'',subjectId:p.subject_id,chapterId:ch.id},kind);
    const activity=$('curriculumActivity');
    if(!activity.querySelector('#curriculumLessonBody'))throw new Error('Le contenu ne peut pas être chargé');
    activity.querySelector('[aria-label="Formats de révision"]')?.remove();activity.querySelector('h3')?.remove();
    box.append(node('p','Ressource reliée au texte de référence. La couverture du programme reste partielle.','alert'));
    const associated=node('div');formats(p,ch,associated);box.append(associated,$('curriculumReferences'),activity);
    if(kind==='course')window.studybeamDashboard?.remember(ch.id);
  }
  async function videos(){
    const selected=selection();header('Vidéos pédagogiques','Sélection de vidéos à configurer. La recherche externe reste disponible.');filters('videos',selected);
    // Publication uniquement des vidéos approuvées pour le contexte exact.
    window.studybeamVideoSelection={grade:selected.grade,pathway:selected.scope.pathway,subjectId:selected.subject?.id||'',chapterId:selected.chapterId||''};
    const recommended=node('section');recommended.id='studybeamVideoRecommendations';recommended.className='video-recommendations';
    const recommendTitle=node('h2','Vidéos vérifiées pour ce chapitre');
    const recommendStatus=node('p','Chargement des recommandations…','small muted');recommendStatus.id='videoRecommendationsStatus';
    box.append(recommendTitle,recommendStatus,recommended);
    const widget=document.createElement('script');widget.src='./video-recommendations.js?v=mission-videos-1';widget.defer=true;document.body.append(widget);
    const response=await fetch('./data/videos.json');if(!response.ok)throw new Error('Catalogue vidéo indisponible');const catalogue=await response.json();let count=0;const g=grid();
    if(catalogue.configured)for(const video of catalogue.videos||[]){try{const url=new URL(video.url);if(url.protocol!=='https:'||url.username||url.password||!video.title||!video.source||!video.description||video.grade!==selected.grade||video.pathway!==selected.scope.pathway||selected.subject&&video.subjectId!==selected.subject.id||selected.chapterId&&video.chapterId!==selected.chapterId||selected.q&&!normalize(video.title+' '+video.description).includes(normalize(selected.q)))continue;card(g,video.title,video.source+' — '+video.description,url.href);const a=g.lastElementChild;a.target='_blank';a.rel='noopener noreferrer';count++;}catch{}}
    if(!count)empty('Aucune vidéo pédagogique sélectionnée et vérifiée n’est configurée pour ce parcours. Aucun lecteur ni titre fictif n’est affiché.');
    const title=selected.subject?.title||'';const chapter=selected.subject?chapters(program(selected.scope,selected.subject)).find(c=>c.id===selected.chapterId)?.title||'':'';
    const search=link('Rechercher sur YouTube','https://www.youtube.com/results?search_query='+encodeURIComponent([selected.grade,title,chapter,selected.q,'cours'].filter(Boolean).join(' ')),'btn ghost');search.target='_blank';search.rel='noopener noreferrer';box.append(search,node('p','Les résultats sont externes et ne sont pas validés par StudyBeam.','small muted'));
  }
  async function pass(){
    header('Learning Pass','Choisis ton pays de facturation pour consulter les tarifs régionaux proposés.');
    const response=await fetch('./data/learning-pass.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Configuration des offres indisponible');
    const config=await response.json();
    if(!config.configured){empty('Les formules, tarifs et avantages ne sont pas encore configurés. Aucun abonnement ni paiement n’est proposé pour le moment.');return;}
    if(config.schema_version!==2||!config.markets||!Array.isArray(config.plans)||!config.terms)throw new Error('Configuration commerciale invalide');
    box.append(node('p',config.notice,'alert'));
    const field=node('div',undefined,'billing-country');const label=node('label','Pays de facturation');label.htmlFor='billingCountry';
    const country=node('select');country.id='billingCountry';country.name='country';country.add(new Option('Choisir un pays',''));
    for(const [id,market] of Object.entries(config.markets))country.add(new Option(market.country+' — '+market.currency,id));
    const countryId=params.get('country')||'';country.value=Object.hasOwn(config.markets,countryId)?countryId:'';
    field.append(label,country);box.append(field);
    country.addEventListener('change',()=>location.assign(href(files.pass,{country:country.value})));
    if(!country.value){empty(countryId?'Ce pays de facturation n’est pas pris en charge. Choisis un pays proposé.':'Sélectionne ton pays pour afficher StudyBeam Free et les formules mensuelle et annuelle.');return;}
    const market=config.markets[country.value];
    const plans=['free','monthly','annual'].map(id=>config.plans.find(p=>p.id===id));
    if(!['XOF','EUR'].includes(market.currency)||market.minor_unit!==({XOF:0,EUR:2}[market.currency])||plans.some(p=>!p||!Array.isArray(p.benefits))||plans.some(p=>!Number.isSafeInteger(market.prices?.[p.id]?.amount_minor)||market.prices[p.id].amount_minor<0)||market.prices.free.amount_minor!==0)throw new Error('Tarifs incomplets');
    const money=amount=>new Intl.NumberFormat('fr-FR',{minimumFractionDigits:market.minor_unit,maximumFractionDigits:market.minor_unit}).format(amount/10**market.minor_unit)+' '+market.symbol;
    const monthly=market.prices.monthly.amount_minor,annual=market.prices.annual.amount_minor;
    const yearlyMonthly=monthly*12,saving=yearlyMonthly-annual;
    if(!Number.isSafeInteger(yearlyMonthly))throw new Error('Tarifs invalides');
    const savingText=saving>0?'Économise '+money(saving)+' par an par rapport à 12 mensualités ('+money(yearlyMonthly)+').':'';
    const currency=node('p',market.country+' · '+market.currency+' — '+market.currency_name,'small muted');box.append(currency);
    const g=grid();g.classList.add('pricing-grid');
    for(const plan of plans){
      const featured=plan.id==='annual',el=node('article',undefined,'route-card pricing-card'+(featured?' featured':''));el.dataset.plan=plan.id;
      if(featured)el.append(node('span','Formule annuelle','pricing-badge'));
      el.append(node('h2',plan.name));const price=node('p',plan.id==='free'?'Gratuit':money(market.prices[plan.id].amount_minor),'plan-price');price.dataset.currency=market.currency;price.dataset.amountMinor=market.prices[plan.id].amount_minor;
      el.append(price,node('p',plan.period_label,'plan-period'));
      if(featured&&saving>0){el.append(node('p',saving===monthly*2?'2 mois économisés':'Économie annuelle','saving-label'),node('p',savingText,'small'));}
      const list=node('ul');plan.benefits.forEach(value=>list.append(node('li',String(value))));el.append(list);
      if(plan.id==='free'){el.append(node('p','Sans renouvellement payant. Aucune résiliation d’abonnement nécessaire.','small muted'),link('Continuer gratuitement','./programmes.html','btn ghost'));}
      else{
        const terms=node('div',undefined,'plan-terms');terms.append(node('strong','Renouvellement'),node('p',config.terms.renewal),node('strong','Résiliation'),node('p',config.terms.cancellation));el.append(terms);
        // Aucune configuration JSON ne peut activer un paiement dans ce client statique.
        const button=node('button','Paiement indisponible','btn');button.type='button';button.disabled=true;button.setAttribute('aria-describedby','paymentAvailability');el.append(button);
      }
      g.append(el);
    }
    box.append(node('p','Aucun achat ni abonnement payant ne peut être effectué sur cette page.','small muted'));box.lastElementChild.id='paymentAvailability';
    const wrapper=node('div',undefined,'table-scroll'),table=node('table',undefined,'offer-table');wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','Tableau comparatif des formules');box.append(node('p','Sur petit écran, fais défiler le tableau horizontalement pour comparer les formules.','small muted pricing-table-hint'));table.append(node('caption','Comparaison des formules — '+market.country+' ('+market.currency+')'));
    const head=node('tr');head.append(node('th','Formule'));plans.forEach(p=>head.append(node('th',p.name)));const thead=node('thead');thead.append(head);table.append(thead);const body=node('tbody');
    const rows=[['Tarif proposé',...plans.map(p=>p.id==='free'?'Gratuit':money(market.prices[p.id].amount_minor))],['Périodicité',...plans.map(p=>p.period_label)],['Ressources gratuites disponibles','Accessibles','Accessibles sans abonnement','Accessibles sans abonnement'],['Avantages premium','Non inclus','À définir et à valider','À définir et à valider'],['Économie sur 12 mensualités','Sans objet','Sans objet',saving>0?money(saving):'Aucune'],['Souscription payante','Sans abonnement','Non ouverte','Non ouverte']];
    for(const values of rows){const tr=node('tr');values.forEach((value,i)=>{const cell=node(i===0?'th':'td',value);if(i===0)cell.scope='row';tr.append(cell);});body.append(tr);}table.append(body);wrapper.append(table);box.append(wrapper);
    const conditions=node('section',undefined,'pricing-conditions');conditions.append(node('h2','Avant toute souscription'),node('p',config.terms.taxes),node('p',config.guardian_notice),node('p','Le prix final et sa devise devront être annoncés avant la validation du paiement. Les tarifs sont configurés par marché, sans conversion automatique.'));box.append(conditions);
  }
  $('libraryBack').onclick=()=>{try{if(history.length>1&&document.referrer&&new URL(document.referrer).origin===location.origin){history.back();return;}}catch{}location.assign(parentUrl);};
  $('libraryMenuLink').onclick=event=>{event.preventDefault();const menu=document.querySelector('[data-main-menu]');menu.open=true;(matchMedia('(min-width: 901px)').matches?menu.querySelector('a'):menu.querySelector('summary')).focus({preventScroll:true});};
  (async()=>{
    try{
      if(mode==='pass'){await pass();return;}
      if(mode==='about'){header('Découvrir StudyBeam','Un peu chaque jour. Un progrès à la fois.');box.append(node('p','Cours, fiches, lecture vocale, quiz et recherche vidéo : les premières activités sont disponibles, et les démonstrations restent séparées des ressources reliées au référentiel.'));const g=grid();for(const kind of ['course','revision_sheet','audio','quiz','videos'])card(g,labels[kind],'Découvrir les ressources disponibles','./'+files[kind]);return;}
      data=await window.studybeamCatalogue;await window.studybeamSchool.ready;
      if(mode==='programmes')programmePage();else if(mode==='videos')await videos();else {const kind=mode==='resource'?params.get('kind'):mode;if(!['course','revision_sheet','audio','quiz','exercise','assessment','assistant_explanation'].includes(kind))throw new Error('Format inconnu');if(params.has('lesson'))await detail(kind);else if(files[kind])resourceList(kind);else throw new Error('Chapitre requis');}
    }catch{header('Cette ressource ne peut pas être affichée','Le lien est incomplet, la ressource n’existe pas ou son chargement a échoué.');empty('Aucun contenu de remplacement non vérifié n’est affiché.');box.append(link('Revenir aux programmes','./programmes.html','btn ghost'));const retry=node('button','Réessayer','btn ghost');retry.onclick=()=>location.reload();box.append(retry);}
  })();
})();
