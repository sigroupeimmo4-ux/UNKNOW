"""Pages statiques GitHub Pages : générées depuis l'application existante, sans framework.
python3 scripts/build_navigation_pages.py
"""
from pathlib import Path
import re
import sys
ROOT=Path(__file__).resolve().parents[1]
CHECK='--check' in sys.argv
errors=[]
def save(path,contents):
 if CHECK:
  if not path.exists() or path.read_text()!=contents:errors.append(str(path.relative_to(ROOT)))
 else:path.write_text(contents)
LINKS=[('index.html','Accueil'),('programmes.html','Programmes'),('cours.html','Cours'),('fiches.html','Fiches'),('audio.html','Audio'),('quiz.html','Quiz'),('videos.html','Vidéos'),('learning-pass.html','Learning Pass'),('app.html','Mon espace'),('app.html#demo','Démonstrations'),('app.html#tutor','Beam'),('app.html#progress','Progression'),('login.html','Connexion'),('signup.html','Inscription')]
def menu():
 return '<details class="route-menu" id="mainMenu" data-main-menu open><summary>Menu principal</summary><nav class="app-nav" aria-label="Menu principal">'+''.join(f'<a href="./{href}">{title}</a>' for href,title in LINKS)+'</nav></details>'
def update_menu(s):
 # Accept both the original single nav and a previously generated menu.
 s=re.sub(r'<details class="route-menu".*?</details>',lambda m:menu(),s,flags=re.S)
 s=re.sub(r'<nav class="app-nav" aria-label="Navigation de l’espace">.*?</nav>',lambda m:menu(),s,flags=re.S)
 if 'navigation.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./navigation.css?v=mission15"></head>',1)
 nav_script='<script defer src="./navigation.js?v=mission15"></script>'
 s=s.replace(nav_script,'')
 marker='<script defer src="./storage.js'
 if marker not in s:marker='<script defer src="https://cdn.jsdelivr.net'
 if marker in s:s=s.replace(marker,nav_script+marker,1)
 else:s=s.replace('</body>',nav_script+'</body>',1)
 return s
app=update_menu((ROOT/'app.html').read_text()).replace('./app.js?v=mission1\"','./app.js?v=mission15\"').replace('./curriculum.js?v=mission1\"','./curriculum.js?v=mission15\"')
save(ROOT/'app.html',app)
for file in ['index.html','login.html','signup.html','forgot-password.html','reset-password.html','auth-callback.html']:
 p=ROOT/file;s=p.read_text()
 if 'data-main-menu' not in s:s=s.replace('</header>','</header>'+menu(),1)
 else:s=update_menu(s)
 s=update_menu(s)
 # The presentation links now have real destinations, including questions/about.
 s=re.sub(r'<div class="nav-links">.*?</div>','',s,flags=re.S)
 for old,new in [('app.html#curriculum','programmes.html'),('app.html#course','cours.html'),('app.html#sheets','fiches.html'),('app.html#audio','audio.html'),('app.html#quiz','quiz.html'),('app.html#videos','videos.html')]:s=s.replace(old,new)
 s=s.replace('href="#decouvrir"','href="./a-propos.html"')
 save(p,s)
pages={'programmes.html':('programmes','Programmes scolaires'),'cours.html':('course','Cours'),'fiches.html':('revision_sheet','Fiches de révision'),'audio.html':('audio','Ressources audio'),'quiz.html':('quiz','Quiz'),'videos.html':('videos','Vidéos pédagogiques'),'learning-pass.html':('pass','Learning Pass'),'ressource.html':('resource','Ressource pédagogique'),'a-propos.html':('about','Découvrir StudyBeam')}
for filename,(kind,title) in pages.items():
 s=app.replace('<body data-auth-page="app">',f'<body data-auth-page="app" data-library="{kind}">',1)
 s=s.replace('id="home" class="page active"','id="home" class="page"',1)
 s=re.sub(r'<title>.*?</title>',f'<title>{title} — StudyBeam</title>',s,count=1)
 marker='<p id="storageStatus" class="alert" role="status" hidden></p>'
 content='<section id="library" class="page active"><div class="pagebox"><nav aria-label="Fil d’Ariane"><ol class="breadcrumbs" id="libraryBreadcrumbs"></ol></nav><div class="library-header"><h1 id="libraryTitle">'+title+'</h1><p id="libraryIntro"></p></div><p id="libraryStatus" class="library-status" role="status">Chargement…</p><div id="libraryContent"></div><div class="route-actions"><a class="route-back" href="./index.html">← Accueil</a><button class="btn ghost" id="libraryBack" type="button">Page précédente</button><a href="#mainMenu" class="route-back" id="libraryMenuLink">Menu principal</a></div></div></section>'
 # Chaque fichier dispose uniquement de son contenu, sans les anciennes vues masquées.
 before=s[:s.index('<main class="app"')]
 bridge='<div id="curriculumBridge" hidden><select id="curriculumGrade"></select><select id="curriculumPathway"></select><select id="curriculumVariant"></select><div id="curriculumVariantField"></div><select id="curriculumType"><option value="commun">Commun</option><option value="specialite">Spécialité</option><option value="option">Option</option></select><select id="curriculumSubject"></select><select id="curriculumDomain"></select><select id="curriculumChapter"></select><p id="curriculumSummary"></p><p id="curriculumStatus"></p><div id="curriculumCalendar"></div><div id="curriculumReferences"></div><div id="curriculumActivity"></div></div>'
 footer='<footer class="footer">StudyBeam · Les contenus disponibles et leurs sources sont indiqués dans chaque parcours.</footer>'
 launcher='<a class="beam-launcher" href="./app.html#tutor" aria-label="Ouvrir Beam, mon assistant dragon"><img src="./assets/studybeam-logo.webp?v=dragon-1" alt="" width="64" height="64"><span>Beam</span></a>'
 scripts=''.join('<script defer src="./'+name+'?v=mission15"></script>' for name in ['navigation.js','storage.js','school-data.js','library-shell.js','curriculum.js','library.js'])
 s=before+'<main class="app" id="mainContent" tabindex="-1">'+marker+content+bridge+footer+'</main>'+launcher+scripts+'</body></html>\n'
 save(ROOT/filename,s)
if __name__=='__main__':
 if errors:print('Pages à régénérer : '+', '.join(errors));raise SystemExit(1)
 print('Pages et menus cohérents.' if CHECK else '9 pages et menus générés.')
