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
  let desiredKind='course', openedByUser=false, persistSelection=false;
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
    return refreshVariants();
  }
  function scope() {
    return catalogue.scopes.find(s => s.grade === $('curriculumGrade').value && s.pathway === $('curriculumPathway').value);
  }
  function refreshVariants() {
    const selected = scope();
    refreshTypes(selected,$('curriculumType').value);
    options($('curriculumVariant'), [{id:'',title:'Enseignements sans série sélectionnée'}, ...(selected.variants || [])]);
    $('curriculumVariantField').hidden = selected.pathway !== 'technologique';
    return refreshSubjects();
  }
  function refreshTypes(selected,preferred) {
    options($('curriculumType'),[{id:'commun',title:'Commun'},{id:'specialite',title:'Spécialité'},{id:'option',title:'Option'}].filter(t=>selected.subjects.some(s=>s.teaching_type===t.id)),preferred);
  }
  function refreshSubjects(preferred = 'mathematiques-commun') {
    const selected = scope(), variant = $('curriculumVariant').value, type = $('curriculumType').value;
    const subjects = selected.subjects.filter(s => s.teaching_type === type && (!s.variant || s.variant === variant));
    options($('curriculumSubject'), subjects.map(s => ({id:s.id,title:s.title})), typeof preferred==='string' ? preferred : 'mathematiques-commun');
    renderCalendar();
    return refreshProgram();
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
  function syncSchool() {
    if(openedByUser) window.studybeamSchool?.setSelection({grade:$('curriculumGrade').value,pathway:$('curriculumPathway').value,type:$('curriculumType').value,variant:$('curriculumVariant').value,subjectId:$('curriculumSubject').value,chapterId:$('curriculumChapter').value},persistSelection);
  }
  function refreshProgram() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    requestVersion++;
    currentProgram = null; currentChapter = null;
    $('curriculumActivity').replaceChildren(); $('curriculumReferences').replaceChildren();
    options($('curriculumDomain'), []); options($('curriculumChapter'), []);
    const selected = scope(), subject = selected.subjects.find(s => s.id === $('curriculumSubject').value);
    const status = $('curriculumStatus');
    syncSchool();
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
    return refreshChapters();
  }
  function refreshChapters(preferred = '') {
    const domain = currentProgram?.domains.find(d => d.id === $('curriculumDomain').value);
    options($('curriculumChapter'), (domain?.chapters || []).map(c => ({id:c.id,title:c.title})), typeof preferred==='string' ? preferred : '');
    return renderChapter();
  }
  async function renderChapter() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    const version = ++requestVersion;
    const program = currentProgram;
    const chapter = program?.domains.flatMap(d => d.chapters).find(c => c.id === $('curriculumChapter').value);
    currentChapter = chapter;
    syncSchool();
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
      activity.append(node('h3', lesson.title), node('p','Découpage pédagogique StudyBeam, relié au programme officiel ; il ne s’agit pas d’un intitulé imposé par le ministère.','small muted'));
      list(activity,'Objectifs de révision',lesson.learning_objectives);
      list(activity,'Connaissances et savoir-faire du programme',chapter.skills);
      activity.append(node('p', 'Source : ' + chapter.source_locator, 'small muted'));
      const tabs = node('div',undefined,'row'); tabs.setAttribute('aria-label','Formats de révision');
      const body = node('div'); body.id='curriculumLessonBody';

      const kinds = [['course','Cours'],['revision_sheet','Fiche'],['quiz','Quiz'],['exercise','Exercices'],['assessment','Évaluation'],['audio','Audio'],['assistant_explanation','Explication guidée']];
      let modeVersion = 0;
      function render(kind) {
        modeVersion++;
        desiredKind=kind;
        if (window.speechSynthesis) speechSynthesis.cancel();
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
            if (!(window.speechSynthesis) || !(typeof window.SpeechSynthesisUtterance === 'function')) {message.textContent='La synthèse vocale n’est pas disponible dans ce navigateur.';return;}
            speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(lesson.audio_transcript);u.lang='fr-FR';speechSynthesis.speak(u);
          };
          const stop=node('button','Arrêter','btn ghost');stop.type='button';stop.onclick=()=>{if (window.speechSynthesis) speechSynthesis.cancel();};body.append(play,stop,message);
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
      activity.append(tabs,body);render(desiredKind);
    } catch {
      if (version === requestVersion) activity.replaceChildren(node('p','Ce contenu ne peut pas être chargé ou sa version ne correspond pas. Aucune activité de remplacement non vérifiée n’est affichée.','alert'));
    }
  }
  async function init() {
    try {
      catalogue=await window.studybeamCatalogue;
      if(catalogue.school_year!=='2026-2027' || !Array.isArray(catalogue.scopes))throw new Error('Année incorrecte');
      const grades=[...new Set(catalogue.scopes.map(s=>s.grade))];
      options($('curriculumGrade'),grades.map(id=>({id,title:id})));
      $('curriculumGrade').onchange=()=>{desiredKind='course';openedByUser=true;persistSelection=true;return refreshPathways();};
      $('curriculumPathway').onchange=()=>{desiredKind='course';openedByUser=true;persistSelection=true;return refreshVariants();};
      $('curriculumVariant').onchange=()=>{desiredKind='course';openedByUser=true;persistSelection=true;return refreshSubjects();};
      $('curriculumType').onchange=()=>{desiredKind='course';openedByUser=true;persistSelection=true;return refreshSubjects();};
      $('curriculumSubject').onchange=()=>{desiredKind='course';openedByUser=true;persistSelection=true;return refreshProgram();};
      $('curriculumDomain').onchange=()=>{desiredKind='course';openedByUser=true;persistSelection=true;return refreshChapters();};
      $('curriculumChapter').onchange=()=>{desiredKind='course';openedByUser=true;persistSelection=true;return renderChapter();};
      $('curriculumSummary').textContent='Références consultées le 29 octobre 2026. Intégration partielle : les références recensées ne constituent pas une validation de toutes les matières et activités.';
      await refreshPathways();
      return true;
    } catch {
      $('curriculumStatus').textContent='Le référentiel ne peut pas être chargé. Réessaie le chargement ; aucune conformité officielle n’est affirmée.';
      const retry=node('button','Réessayer le chargement','btn ghost');retry.type='button';retry.onclick=()=>location.reload();$('curriculumStatus').after(retry);
      return false;
    }
  }
  const ready=init();
  window.studybeamCurriculum={ready, async open(selection,kind='course',isCurrent=()=>true){
    if(!await ready || !isCurrent())return;
    desiredKind=['course','revision_sheet','quiz','exercise','assessment','audio','assistant_explanation'].includes(kind)?kind:'course';
    openedByUser=true;persistSelection=false;
    $('curriculumGrade').value=selection.grade;
    const selected=catalogue.scopes.find(s=>s.grade===selection.grade && s.pathway===selection.pathway);
    if(!selected)return;
    options($('curriculumPathway'),catalogue.scopes.filter(s=>s.grade===selection.grade).map(s=>({id:s.pathway,title:labels[s.pathway]})),selection.pathway);
    options($('curriculumVariant'),[{id:'',title:'Enseignements sans série sélectionnée'},...(selected.variants||[])],selection.variant);
    $('curriculumVariantField').hidden=selected.pathway!=='technologique';
    refreshTypes(selected,selection.type);
    await refreshSubjects(selection.subjectId);
    if(!isCurrent())return;
    const domain=currentProgram?.domains.find(d=>d.chapters.some(c=>c.id===selection.chapterId));
    if(domain){$('curriculumDomain').value=domain.id;await refreshChapters(selection.chapterId);}
  }};
  window.startStudybeamApp?.();
})();
