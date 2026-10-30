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
# SVG simples partagés : aucune nouvelle illustration de la mascotte.
ICONS={'home':'m3 10 9-7 9 7v10H3z M9 20v-7h6v7','programmes':'M4 3h16v18H4z M8 7h8 M8 11h8 M8 15h5','course':'M12 6c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1z M12 6v15','sheet':'M6 3h9l4 4v14H6z M10 11h5 M10 15h5','audio':'M4 14v-3a8 8 0 0 1 16 0v3 M4 12h3v8H4z M17 12h3v8h-3z','quiz':'m9 5 2 2 4-4 M5 6H3v15h16V11 M7 13h7 M7 17h7','video':'M3 5h18v14H3z m7 4 5 3-5 3z','pass':'M3 7h18v12H3z M3 11h18 M7 15h3','dragon':'M12 3 8 7 4 5v9l8 7 8-7V5l-4 2z M8 11h1 M15 11h1 M9 16h6','progress':'M4 3v18h17 M8 16v-5 M13 16V7 M18 16V4','settings':'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z','user':'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M4 21v-3a8 8 0 0 1 16 0v3','search':'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6','arrow':'M4 12h16 m-6-6 6 6-6 6','collapse':'M4 4h16v16H4z M9 4v16 m7-12-3 4 3 4'}
def icon(name):
 return '<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+ICONS[name]+'"/></svg>'
LINKS=[('index.html','Accueil','home'),('programmes.html','Programmes','programmes'),('cours.html','Cours','course'),('fiches.html','Fiches de révision','sheet'),('audio.html','Audio','audio'),('quiz.html','Quiz','quiz'),('videos.html','Vidéos','video'),('learning-pass.html','Learning Pass','pass'),('app.html#dragon','Mon dragon','dragon'),('app.html#progress','Progression','progress'),('app.html#settings','Paramètres','settings'),('app.html','Mon espace','home'),('app.html#demo','Démonstrations','quiz'),('app.html#tutor','Beam','dragon'),('login.html','Connexion','user'),('signup.html','Inscription','user')]
def menu():
 links=''
 for i,(href,title,glyph) in enumerate(LINKS):
  if i in (0,7,11):links+='<p class="nav-section">'+{0:'APPRENDRE',7:'MON ESPACE',11:'EXPLORER'}[i]+'</p>'
  label=' aria-label="Fiches"' if title=='Fiches de révision' else ''
  links+=f'<a href="./{href}" title="{title}"{label}>'+icon(glyph)+f'<span class="nav-label">{title}</span></a>'
 return '<details class="route-menu" id="mainMenu" data-main-menu open><summary aria-label="Menu principal"><span aria-hidden="true">☰</span><span class="menu-caption">Menu principal</span></summary><div class="sidebar-content"><div class="sidebar-brand"><a href="./index.html" aria-label="StudyBeam, accueil"><img src="./assets/studybeam-logo.webp?v=dragon-1" alt="StudyBeam" width="64" height="64"><span class="brand-word">Study<span>Beam</span></span></a><button type="button" id="sidebarCollapse" aria-label="Réduire la barre latérale" aria-expanded="true">'+icon('collapse')+'</button></div><nav class="app-nav" aria-label="Menu principal">'+links+'</nav><div class="sidebar-note"><span class="availability-dot"></span><span>À ton rythme, chaque jour.</span></div></div></details>'
def topbar():
 return '<header class="topbar design-topbar"><nav class="topnav" aria-label="Navigation principale"><nav class="top-breadcrumb" aria-label="Vous êtes ici"><a href="./index.html">Mon espace</a><span aria-hidden="true">/</span><span id="topPageName">Accueil</span></nav><form class="global-search" action="./cours.html" method="get" role="search"><label class="sr-only" for="globalSearch">Rechercher un cours</label>'+icon('search')+'<input id="globalSearch" name="q" type="search" placeholder="Rechercher un cours…" maxlength="100"><button type="submit" aria-label="Lancer la recherche">↵</button></form><div class="top-account"><a class="account-settings" href="./app.html#settings" aria-label="Paramètres du compte" title="Paramètres du compte">'+icon('settings')+'</a><a class="profile-link" href="./app.html#settings" aria-label="Mon profil" title="Mon profil"><span class="profile-avatar">'+icon('user')+'</span><span class="profile-label">Mon profil</span></a></div></nav></header>'
def update_menu(s):
 s=s.replace('./index.html#confidentialite','./a-propos.html#confidentialite')
 s=re.sub(r'<details class="route-menu".*?</details>',lambda m:menu(),s,flags=re.S)
 s=re.sub(r'<header class="(?:topbar[^"]*|site-header)">.*?</header>',lambda m:topbar(),s,count=1,flags=re.S)
 if 'navigation.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./navigation.css?v=mission15"></head>',1)
 if 'design.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./design.css?v=compact1"></head>',1)
 s=re.sub(r'<script defer src="./navigation.js[^"]*"></script>','',s)
 nav_script='<script defer src="./navigation.js?v=compact1"></script>'
 marker='<script defer src="./storage.js'
 if marker not in s:marker='<script defer src="https://cdn.jsdelivr.net'
 if marker in s:s=s.replace(marker,nav_script+marker,1)
 else:s=s.replace('</body>',nav_script+'</body>',1)
 return s
app=update_menu((ROOT/'app.html').read_text()).replace('./app.js?v=mission1\"','./app.js?v=mission15\"').replace('./curriculum.js?v=mission1\"','./curriculum.js?v=mission15\"')

app=re.sub(r'<script defer src="./dashboard.js[^\"]*"></script>','',app)
app=app.replace('<script defer src="./supabase-config.js','<script defer src="./dashboard.js?v=compact1"></script><script defer src="./supabase-config.js',1)
app=re.sub(r'./app.js\?v=[^\"]*','./app.js?v=compact1',app)
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
 if filename=='a-propos.html':content+='<div class="about-details">'+(ROOT/'data/about-faq.html').read_text()+(ROOT/'data/about-privacy.html').read_text()+'</div>'
 bridge='<div id="curriculumBridge" hidden><select id="curriculumGrade"></select><select id="curriculumPathway"></select><select id="curriculumVariant"></select><div id="curriculumVariantField"></div><select id="curriculumType"><option value="commun">Commun</option><option value="specialite">Spécialité</option><option value="option">Option</option></select><select id="curriculumSubject"></select><select id="curriculumDomain"></select><select id="curriculumChapter"></select><p id="curriculumSummary"></p><p id="curriculumStatus"></p><div id="curriculumCalendar"></div><div id="curriculumReferences"></div><div id="curriculumActivity"></div></div>'
 footer='<footer class="footer">StudyBeam · Les contenus disponibles et leurs sources sont indiqués dans chaque parcours.</footer>'
 launcher='<a class="beam-launcher" href="./app.html#tutor" aria-label="Ouvrir Beam, mon assistant dragon"><img src="./assets/studybeam-logo.webp?v=dragon-1" alt="" width="64" height="64"><span>Beam</span></a>'
 scripts=''.join('<script defer src="./'+name+'?v=compact1"></script>' for name in ['navigation.js','storage.js','school-data.js','library-shell.js','curriculum.js','library.js','dashboard.js'])
 s=before+'<main class="app" id="mainContent" tabindex="-1">'+marker+content+bridge+footer+'</main>'+launcher+scripts+'</body></html>\n'
 save(ROOT/filename,s)
if __name__=='__main__':
 if errors:print('Pages à régénérer : '+', '.join(errors));raise SystemExit(1)
 print('Pages et menus cohérents.' if CHECK else '9 pages et menus générés.')
