/* Référentiel versionné : les références identifiées ne valent pas validation pédagogique. */
(function () {
  'use strict';
  const YEAR_START = '2026-09-01', YEAR_END = '2027-08-31';
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
    const parsed = new Date(value + 'T00:00:00Z');
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0,10) === value;
  }
  function applicable(program) {
    return program.reference_status === 'verified' &&
      validDate(program.effective_from) &&
      program.effective_from <= YEAR_START &&
      (!program.effective_until || validDate(program.effective_until) && program.effective_until >= YEAR_END);
  }
  function eligibleContent(program, content, chapterId) {
    return applicable(program) && content.review_status === 'verified' &&
      content.program_id === program.id && content.program_version === program.version &&
      content.chapter_ids.includes(chapterId);
  }
  if (typeof module !== 'undefined') module.exports = {applicable, eligibleContent};
  if (typeof document === 'undefined') return;
  const $ = id => document.getElementById(id);
  const labels = {commun:'Enseignements communs', generale:'Voie générale', technologique:'Voie technologique', professionnelle:'Voie professionnelle', 'generale-technologique':'Seconde générale et technologique'};
  let catalogue, currentProgram, currentChapter, requestVersion = 0;
  const assetCache = new Map();
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function options(select, values, preferred) {
    select.replaceChildren(...values.map(v => new Option(v.title, v.id)));
    if (values.some(v => v.id === preferred)) select.value = preferred;
    select.disabled = !values.length;
  }
  function list(parent, title, values) {
    parent.append(node('h4', title));
    const ul = node('ul');
    for (const value of values) ul.append(node('li', typeof value === 'string' ? value : value.text));
    parent.append(ul);
  }
  function sourceLink(parent, url, title) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || !(parsed.hostname === 'education.gouv.fr' || parsed.hostname.endsWith('.education.gouv.fr'))) return;
      const link = node('a', title); link.href = parsed.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      parent.append(link, node('br'));
    } catch { /* Un lien non confirmé n'est pas proposé. */ }
  }
  function refreshPathways() {
    options($('curriculumPathway'), catalogue.scopes.filter(s => s.grade === $('curriculumGrade').value).map(s => ({id:s.pathway,title:labels[s.pathway]})));
    refreshVariants();
  }
  function scope() {
    return catalogue.scopes.find(s => s.grade === $('curriculumGrade').value && s.pathway === $('curriculumPathway').value);
  }
  function refreshVariants() {
    const selected = scope();
    options($('curriculumVariant'), [{id:'',title:'Enseignements sans série sélectionnée'}, ...(selected.variants || [])]);
    $('curriculumVariantField').hidden = selected.pathway !== 'technologique';
    refreshSubjects();
  }
  function refreshSubjects() {
    const selected = scope(), variant = $('curriculumVariant').value, type = $('curriculumType').value;
    const subjects = selected.subjects.filter(s => s.teaching_type === type && (!s.variant || s.variant === variant));
    options($('curriculumSubject'), subjects.map(s => ({id:s.id,title:s.title})), 'mathematiques-commun');
    renderCalendar();
    refreshProgram();
  }
  function renderCalendar() {
    const container = $('curriculumCalendar'); container.replaceChildren();
    const selected = scope();
    const details = node('details'); details.append(node('summary','Calendrier vérifié des réformes pour cette classe'));
    const ul = node('ul');
    for (const transition of catalogue.transitions || []) {
      const stage = transition.stages.find(s => s.scopes.includes(selected.id));
      if (!stage || transition.review_status !== 'verified') continue;
      const li = node('li',transition.title + ' : ' + (stage.effective_from > YEAR_START ? 'rentrée future ' : 'application depuis la rentrée ') + stage.effective_from.slice(0,4) + '. ');
      sourceLink(li,transition.source_url,transition.source_locator);
      ul.append(li);
    }
    if (!ul.children.length) details.append(node('p','Calendrier détaillé encore à vérifier pour cette voie et ses spécialités.'));
    else details.append(ul);
    details.append(node('p','Ce calendrier couvre les réformes vérifiées ici ; il ne remplace pas la vérification complète de toutes les matières.','small muted'));
    container.append(details);
  }
  function refreshProgram() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    requestVersion++;
    currentProgram = null; currentChapter = null;
    $('curriculumActivity').replaceChildren(); $('curriculumReferences').replaceChildren();
    options($('curriculumDomain'), []); options($('curriculumChapter'), []);
    const selected = scope(), subject = selected.subjects.find(s => s.id === $('curriculumSubject').value);
    const status = $('curriculumStatus');
    if (!subject) {
      status.textContent = selected.pathway === 'technologique' && $('curriculumType').value === 'specialite'
        ? 'Choisis une série pour consulter les spécialités référencées. Les variantes non recensées restent à vérifier.'
        : 'Aucun enseignement de cette catégorie recensé pour cette sélection. La couverture reste incomplète.';
      return;
    }
    for (const reference of subject.references) sourceLink($('curriculumReferences'), reference.url, reference.title || 'Consulter la référence officielle');
    const program = catalogue.programs.find(p => p.scope_id === selected.id && p.subject_id === subject.id);
    currentProgram = program;
    if (!program || !applicable(program)) {
      status.textContent = 'Référence officielle identifiée. Date d’application, notions et contenus détaillés non encore tous vérifiés : aucune activité alignée n’est disponible pour cette sélection.';
      if (subject.notes) status.append(node('p', subject.notes));
      return;
    }
    sourceLink($('curriculumReferences'), program.legal_source.url, program.legal_source.text_reference);
    status.textContent = `Référence applicable depuis la rentrée ${program.effective_from.slice(0,4)}. Couverture partielle : seules les notions ci-dessous ont des activités relues ; les autres parties du programme restent à intégrer.`;
    if (!program.domains.length) {
      status.textContent = `Référence applicable depuis la rentrée ${program.effective_from.slice(0,4)}. Notions, cours et activités encore à intégrer pour cette matière.`;
      return;
    }
    options($('curriculumDomain'), program.domains.map(d => ({id:d.id,title:d.title})));
    refreshChapters();
  }
  function refreshChapters() {
    const domain = currentProgram?.domains.find(d => d.id === $('curriculumDomain').value);
    options($('curriculumChapter'), (domain?.chapters || []).map(c => ({id:c.id,title:c.title})));
    renderChapter();
  }
  async function renderChapter() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    const version = ++requestVersion;
    const program = currentProgram;
    const chapter = program?.domains.flatMap(d => d.chapters).find(c => c.id === $('curriculumChapter').value);
    currentChapter = chapter;
    const activity = $('curriculumActivity'); activity.replaceChildren();
    if (!chapter) return;
    const content = catalogue.contents.find(c => c.kind === 'course' && eligibleContent(program,c,chapter.id));
    if (!content) { activity.append(node('p','Activité non encore vérifiée pour cette notion.')); return; }
    try {
      const path = content.asset_path;
      if (!/^curriculum\/lessons\/[a-z0-9-]+\.json$/.test(path)) throw new Error('Chemin de contenu invalide');
      if (!assetCache.has(path)) {
        const response = await fetch('./' + path);
        if (!response.ok) throw new Error('Chargement impossible');
        assetCache.set(path, await response.json());
      }
      if (version !== requestVersion) return;
      const lesson = assetCache.get(path);
      if (lesson.program_id !== program.id || lesson.program_version !== program.version || lesson.chapter_id !== chapter.id) throw new Error('Version incohérente');
      activity.append(node('h3', lesson.title), node('p','Découpage pédagogique StudyWink, relié au programme officiel ; il ne s’agit pas d’un intitulé imposé par le ministère.','small muted'));
      list(activity,'Objectifs de révision',lesson.learning_objectives);
      list(activity,'Connaissances et savoir-faire du programme',chapter.skills);
      activity.append(node('p', 'Source : ' + chapter.source_locator, 'small muted'));
      const tabs = node('div',undefined,'row'); tabs.setAttribute('aria-label','Formats de révision');
      const body = node('div'); body.id='curriculumLessonBody';
      const kinds = [['course','Cours'],['revision_sheet','Fiche'],['quiz','Quiz'],['exercise','Exercices'],['assessment','Évaluation'],['audio','Audio'],['assistant_explanation','Explication guidée']];
      let modeVersion = 0;
      function render(kind) {
        modeVersion++;
        if ('speechSynthesis' in window) speechSynthesis.cancel();
        body.replaceChildren();
        tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===kind)));
        if (!catalogue.contents.some(c=>c.kind===kind && eligibleContent(program,c,chapter.id))) {body.append(node('p','Ce format n’est pas encore vérifié.'));return;}
        if (kind==='course') for (const part of lesson.course) body.append(node('h4',part.title),node('p',part.text));
        if (kind==='revision_sheet') {
          list(body,'À retenir',lesson.revision_sheet);
          const print=node('button','Imprimer la fiche','btn ghost'); print.type='button';print.onclick=()=>window.print();body.append(print);
        }
        if (kind==='exercise' || kind==='assessment') {
          body.append(node('p',kind==='assessment'?'Auto-évaluation : essaie sans regarder les corrections. Aucun résultat envoyé à un serveur.':'Essaie d’abord, puis ouvre la correction.'));
          for (const [i,item] of lesson[kind==='exercise'?'exercises':'assessment'].entries()) {
            body.append(node('h4',`${i+1}. ${item.prompt}`));
            const details=node('details');details.append(node('summary','Voir la correction'),node('p',item.solution),node('p','Critère de réussite : '+item.success_criterion));body.append(details);
          }
        }
        if (kind==='audio') {
          body.append(node('p',lesson.audio_transcript));
          const play=node('button','Écouter ce chapitre','btn'); play.type='button';
          const message=node('p','Lecture vocale par le navigateur, à partir de la transcription affichée.','small muted');
          play.onclick=()=>{
            if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {message.textContent='La synthèse vocale n’est pas disponible dans ce navigateur.';return;}
            speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(lesson.audio_transcript);u.lang='fr-FR';speechSynthesis.speak(u);
          };
          const stop=node('button','Arrêter','btn ghost');stop.type='button';stop.onclick=()=>{if ('speechSynthesis' in window) speechSynthesis.cancel();};body.append(play,stop,message);
        }
        if (kind==='assistant_explanation') body.append(node('p','Explication relue et préparée pour ce chapitre. Aucune IA générative connectée.'),node('p',lesson.guided_explanation));
        if (kind==='quiz') {
          let index=0,score=0; const thisMode=modeVersion;
          const draw=()=>{
            if(thisMode!==modeVersion)return;
            body.replaceChildren();
            if(index===lesson.quiz.length){body.append(node('h4',`Quiz terminé : ${score} / ${lesson.quiz.length}`));const again=node('button','Recommencer le quiz','btn');again.type='button';again.onclick=()=>render('quiz');body.append(again);return;}
            const q=lesson.quiz[index];body.append(node('p',`Question ${index+1} sur ${lesson.quiz.length}`),node('h4',q.prompt));
            const choices=node('div');
            q.choices.forEach((choice,i)=>{
              const b=node('button',choice,'choice');b.type='button';
              b.onclick=()=>{
                choices.querySelectorAll('button').forEach(button=>button.disabled=true);
                if(i===q.correct_index)score++;
                const feedback=node('p',(i===q.correct_index?'Bonne réponse. ':'À revoir. ')+q.explanation);feedback.setAttribute('role','status');body.append(feedback);
                const next=node('button','Continuer','btn');next.type='button';next.onclick=()=>{index++;draw();};body.append(next);
              };choices.append(b);
            });body.append(choices);
          };draw();
        }
      }
      for (const [kind,title] of kinds) {const b=node('button',title,'themebtn');b.type='button';b.dataset.kind=kind;b.onclick=()=>render(kind);tabs.append(b);}
      activity.append(tabs,body);render('course');
    } catch {
      if (version === requestVersion) activity.replaceChildren(node('p','Ce contenu ne peut pas être chargé ou sa version ne correspond pas. Aucune activité de remplacement non vérifiée n’est affichée.','alert'));
    }
  }
  async function init() {
    try {
      const response=await fetch('./curriculum/catalogue.json');
      if(!response.ok)throw new Error('Catalogue indisponible');
      catalogue=await response.json();
      if(catalogue.school_year!=='2026-2027' || !Array.isArray(catalogue.scopes))throw new Error('Année incorrecte');
      const grades=[...new Set(catalogue.scopes.map(s=>s.grade))];
      options($('curriculumGrade'),grades.map(id=>({id,title:id})));
      $('curriculumGrade').onchange=refreshPathways;
      $('curriculumPathway').onchange=refreshVariants;
      $('curriculumVariant').onchange=refreshSubjects;
      $('curriculumType').onchange=refreshSubjects;
      $('curriculumSubject').onchange=refreshProgram;
      $('curriculumDomain').onchange=refreshChapters;
      $('curriculumChapter').onchange=renderChapter;
      $('curriculumSummary').textContent='Références consultées le 29 octobre 2026. Intégration partielle : les références recensées ne constituent pas une validation de toutes les matières et activités.';
      refreshPathways();
    } catch {
      $('curriculumStatus').textContent='Le référentiel ne peut pas être chargé. Vérifie la connexion au site et réessaie ; aucune conformité officielle n’est affirmée.';
    }
  }
  init();
})();
