# STUDYBEAM — PASSATION DU PROJET

Dernière mise à jour : 30 octobre 2026.

## Règle de suivi obligatoire
Après **chaque modification du projet**, actualiser ce fichier avec la date, la branche, les fichiers touchés, les tests effectués, la publication et les éléments non terminés. Vérifier systématiquement l'état réel du dépôt et de Supabase au début d'un nouveau chat.

## Identifiants et accès
- Dépôt GitHub : https://github.com/sigroupeimmo4-ux/UNKNOW
- Site : https://sigroupeimmo4-ux.github.io/UNKNOW/
- Branche principale : `main`
- Supabase StudyBeam : projet `yjhwlflbgywxepjhwssl`, distinct du projet Moi Demain.
- Pages applicatives : `app.html`, `programmes.html`, `cours.html`, `fiches.html`, `audio.html`, `quiz.html`, `videos.html`, `learning-pass.html`.
- Générateur : `scripts/build_navigation_pages.py`. Hébergement GitHub Pages via GitHub Actions.

## Vision et contraintes
StudyBeam est une plateforme éducative CP à Terminale basée sur les programmes français disponibles et vérifiés, avec Beam, un dragon lavande, comme mascotte et futur assistant IA. Préserver toutes les données pédagogiques, la mascotte officielle (`assets/studybeam-logo.webp`), les comptes, les routes applicatives, le modèle freemium et les tarifs existants.

### Palette Pastel Dream
Bleu ciel `#BBDCF2`, menthe `#C5E9D9`, pêche `#F8DCCE`, jaune `#F7E9AC`, rose `#F2DCE8`, crème `#FAF9F5`, bleu ardoise `#527F99`, gris profond `#34434A`, blanc `#FFFFFF`. Le violet est réservé à Beam.

## Historique des changements
- **PR #1** : Mission profils/progression encore non fusionnée lors du dernier contrôle ; ne pas la déployer implicitement.
- **PR #2 à #5** : design Pastel Dream, corrections de navigation et de publication, fusionnées.
- **PR #6** : première interface flottante Beam et aperçu de personnalisation. IA non connectée (`agent-config.js` = endpoint null), pas de dragon 3D articulé.
- **PR #7** : tables Supabase de vidéos, modération et préparation de la recherche YouTube ; catalogue initialement vide, API YouTube non déployée.
- **PR #8** : compagnon Beam flottant sur davantage de pages et raccourcis, fusionnée.
- **PR #9** : correction de visibilité, création automatique du bouton Beam quand il manque, fusionnée.
- **Mission landing page — 30/10/2026** : développement sur la branche `landing-pastel-dream-20261030`, sauvegarde `backup-before-landing-20261030`.
  - Fichiers modifiés : `index.html` (remplacement de l'accueil par vitrine publique), `scripts/build_navigation_pages.py` (ne plus transformer `index.html`), `landing.css` (nouvelle feuille de style propre à la landing).
  - Composition : barre horizontale, hero dragon officiel, 5 cartes de fonctionnalités, section Beam, 5 filières scolaires, offres Free/Learning Pass présentées sans tarifs non validés, CTA d'inscription, footer.
  - Destinations : `login.html`, `signup.html`, `a-propos.html`, `programmes.html`, `cours.html`, `fiches.html`, `audio.html`, `quiz.html`, `videos.html`, `learning-pass.html`, `app.html#dragon`.
  - État du service : Beam IA et paiement non actifs ; le site ne les annonce pas comme fonctionnels. Couverture scolaire partielle.
  - Vérifications effectuées : inspection des fichiers, structure des sections et liens, conservation du générateur ; tests visuels sur 375/768/1440 px à réaliser avant d'affirmer une validation responsive.
  - Les mentions « contact », « conditions » et « politique » pointent vers les sections d'information existantes de `a-propos.html` et ne représentent **pas de nouvelles pages juridiques validées**. Une politique et des CGU juridiquement complètes restent à rédiger.
  - Publication : statut à consigner après réussite éventuelle des Actions GitHub Pages.

## Références complémentaires
- `docs/RAPPORT_PASTEL_DREAM_FINAL.md`
- `docs/RAPPORT_MISSION_BEAM.md`
- `docs/RAPPORT_RECOMMANDATIONS_VIDEOS.md`
- Business Plan StudyBeam transmis par l'utilisateur : prix envisagés, non commercialement validés.

## Prochaines étapes
1. Vérifier le rendu réel de la landing dans un navigateur, sur ordinateur et téléphone, et les destinations des liens.
2. Configurer IA Beam et personnalisation réellement animée ; ne pas prétendre le faire sans backend/API.
3. Finaliser validation pédagogique, comptes élèves, confidentialité des mineurs, documents juridiques et paiements avant commercialisation.
4. Après **chaque modification**, compléter cette passation.

## Message de reprise dans un nouveau chat
« Reprends StudyBeam depuis https://github.com/sigroupeimmo4-ux/UNKNOW. Lis `docs/PASSATION_STUDYBEAM.md`, vérifie GitHub Pages, Supabase et les PR, puis poursuis la prochaine mission sans casser le site. Mets à jour ce fichier après toute modification. »

## 30 octobre 2026 — Beam : socle d'animation GLB déployable
- Branche `beam-3d-runtime-20261030` ; fichiers : `beam-3d.js`, `navigation.js`, `design.css`, `index.html`, `scripts/build_navigation_pages.py`.
- Le runtime Three.js charge uniquement `assets/beam-rigged.glb` SI un vrai modèle existe. Transitions entre animations GLB nommées `idle`, `greet`, `think`, `talk`, `happy`, `rest`, `fly` ; événement `studybeam:beam-state`. Aucun modèle 3D n'a été ajouté.
- En l'absence de GLB, l'image officielle reste affichée. Respect du mode réduction des animations et du mode discret ; rendu suspendu hors écran. Ces dispositions nécessitent encore des tests sur appareils.
- Le compagnon peut aussi être chargé depuis la landing publique ; les autres pages réutilisent le lanceur existant.
- **Non opérationnel à ce stade :** modèle 3D riggé original, ailes/yeux/bouche articulés, rig facial et visèmes, voix TTS, costumes réellement intégrés au squelette, connexion de Beam IA. Ne pas annoncer Beam comme « 3D vivant » avant un GLB officiel et des tests.
- Après fusion : confirmer GitHub Actions, GitHub Pages et inspecter l'affichage en navigateur. Ajouter le lien et l'état de la PR dans la présente section.

## 30 octobre 2026 — Événements contextuels pour les animations de Beam
- Branche : `beam-animation-context-20261030`.
- `beam-assistant.js` : déclenche `studybeam:beam-state` pour salutation à l'ouverture, réflexion pendant l'appel IA réel, parole après réponse IA validée, retour au repos et joie après score parfait d'un quiz de démonstration validé.
- `beam-global.js` : salutation et retour au repos à l'ouverture/fermeture de son panneau.
- Ces événements sont destinés à un **vrai modèle riggé** et restent sans effet 3D en l'absence de `assets/beam-rigged.glb`. Les animations ne sont pas encore visibles : ne pas les annoncer comme achevées.
- Pas de voix/TTS, pas de lipsync, pas de rig facial, pas de modèle GLB original. La version fonctionnelle conserve l'image officielle.
- Vérifier les tests CI et le déploiement avant de présenter la modification comme publiée. Les tests d'animations 3D réelles sont bloqués par l'absence du modèle.

## 30 octobre 2026 — Publication calendrier et notes
- Branche de publication : `calendar-release-20261030`, reconstruite sur `main` afin d'éviter les conflits avec Beam ; branche préparatoire `calendar-grades-20261030` et sauvegarde `backup-before-calendar-progress-20261030`.
- Nouveaux fichiers : `school-tools.js`, `school-tools.css`, `calendrier.html`, `mes-notes.html`.
- Générateur de navigation modifié pour accéder au calendrier et aux notes depuis la barre latérale. CI étendue à la vérification JavaScript.
- Calendrier : vues mois/semaine/liste, ajout/édition/suppression confirmée, récurrence hebdomadaire, marquage terminé ; rappels affichés uniquement lorsque la page est ouverte.
- Notes : ajout/suppression, moyenne indicative sur 20, filtre par matière et tracé SVG ; stockage uniquement sur l'appareil (`localStorage`).
- Non disponibles : synchronisation entre appareils, rappels hors navigateur, notification système, glisser-déposer des dates, édition des notes.
- Tests à confirmer : Actions GitHub, Pages, parcours des formulaires en navigateur, responsive sur appareils physiques.

## 30 octobre 2026 — Beam directement cliquable, sans bulle
- Branche : `beam-character-launcher-20261030` ; sauvegarde : `backup-before-beam-character-launcher-20261030`.
- Fichiers : `beam-global.js`, `app.html`, `design.css`, `scripts/build_navigation_pages.py`, `navigation.js`, `index.html`.
- Le déclencheur flottant affiche uniquement le dragon officiel ; fond, bordure, libellé et pilule supprimés. Le clic ouvre le chat existant. Responsive mobile et focus clavier préservés.
- La version GLB, si un modèle réel est ajouté ultérieurement, reste prise en charge par `beam-3d.js`. Aucun modèle `assets/beam-rigged.glb` n'est actuellement disponible : le dragon reste une illustration WebP et ses membres/visage ne sont **pas encore articulés**. Ne pas déclarer la mission d'animation 3D achevée.
- Tests CI et état de publication à confirmer. Inspection visuelle du site et essais en conditions réelles encore nécessaires.

## 30 octobre 2026 — Première version Beam 3D animé en direct
- Branche `beam-live-3d-20261030`; fichiers `beam-live.js`, `beam-3d-apercu.html`, `navigation.js`, `index.html`, `app.html`, `design.css`, `scripts/build_navigation_pages.py` et CI.
- Nouveau dragon WebGL procédural composé de volumes 3D (tête, yeux/paupières, bouche/mâchoire, ailes et queue articulées), couleurs lavande/bleu/crème/doré, animation à chaque frame, salutation et joie. Il est distinct d'une image 2D CSS.
- Démonstration prévue : `/beam-3d-apercu.html` avec bouton de parole par synthèse vocale du navigateur, arrêt de la voix et animations. La bouche suit approximativement un mouvement de parole, PAS des visèmes ni une analyse phonémique.
- Le lanceur flottant des pages peut afficher cette version 3D ; si chargement Three.js échoue, l'image de Beam reste visible.
- Limites : pas de modèle GLB riggé d'artiste, rendu stylisé et non qualité cinéma, fidélité visuelle à valider par l'utilisateur, pas de voix IA côté serveur, ni synchronisation labiale phonème-par-phonème. Tests sur navigateur/appareil réels encore nécessaires.
- Après merge : confirmer succès GitHub Actions et GitHub Pages avant d'annoncer la publication, et tester visuellement la présence du WebGL.

## 30 octobre 2026 — Beam agrandi, souriant et plus visible
- Branche `beam-cute-visible-20261030`, sauvegarde `backup-before-beam-cute-20261030`.
- `beam-live.js` : caméra rapprochée, visage rond agrandi, yeux plus larges, joues roses, sourire plus visible ; animations 3D précédentes conservées.
- `design.css` : lanceur dragon flottant 154 px ordinateur, 110 px mobile, sans pilule ; assets rafraîchis dans `navigation.js`, `index.html`, `scripts/build_navigation_pages.py`, `beam-3d-apercu.html`.
- Important : rendu WebGL procédural et animation simplifiée, ni modèle cinéma ni lip-sync précis ; l'image officielle reste affichée si l'import 3D échoue.
- Tests syntaxiques et génération de pages à vérifier en CI ; rendu navigateur réel non encore validé.

## 30 octobre 2026 — Nouveau Beam vert pomme, yeux marron, mains libres
- Demande utilisateur : prendre pour référence le dragon au visage rond et souriant (ancienne image turquoise/violette), **retirer la fiole**, changer les yeux en **marron** et le corps en **vert pomme**, réintégrer toutes les animations existantes.
- Branche : `beam-apple-green-animations-20261030`. Sauvegarde : `backup-before-beam-apple-green-20261030`.
- `beam-live.js` : peau vert pomme `#9ADB38`, reflets verts clairs, iris bruns `#8B4B2B`, cornes et épines mauves, doigts violets, joues et sourire conservés. Aucune fiole, baguette ou objet dans les mains. Personnage en WebGL/Three.js, rendu procédural articulé.
- Les états existants `idle` (respiration/flottement/clignement), `greet` (salutation), `think` (réflexion), `talk` (mâchoire pendant la voix), `happy` (joie), `rest` (paupières fermées), `fly` (vol/ailes/queue) sont conservés et affinés. États complémentaires `listen`, `surprised`, `dance`. Repos après inactivité prolongée.
- `beam-3d-apercu.html` : commandes de démonstration pour ces expressions et mouvements, déclenchement vocal volontaire par synthèse vocale du navigateur (synchronisation labiale APPROXIMATIVE).
- `navigation.js`, `index.html`, `scripts/build_navigation_pages.py` : mise à jour des versions de l'asset pour empêcher la mise en cache de l'ancien Beam.
- L'illustration générée en conversation sert de référence visuelle et n'est PAS un modèle 3D / GLB. Les fichiers du site restent ceux du dépôt ; le logo officiel n'est pas remplacé.
- Limites : rendu 3D encore stylisé et construit par code, non qualité cinéma, aucune visémie précise ou voix IA serveur ; dépend du chargement de Three.js et de WebGL. Si WebGL indisponible, l'ancienne image officielle reste en secours. Contrôle visuel réel sur mobile/ordinateur à faire.
- Ne déclarer la nouvelle version **publiée** qu'après réussite de GitHub Actions et déploiement GitHub Pages. Enregistrer la PR et le résultat des tests dans une prochaine entrée.

## 30 octobre 2026 — Audit global et corrections de fiabilité
- Branche de travail : `audit-corrections-20261030` ; sauvegarde GitHub : `backup-before-audit-20261030`.
- Rapport de référence : `docs/AUDIT_COMPLET_STUDYBEAM_2026-10-30.md`.
- Diagnostic contrôlé : le site possède une landing, des cours et parcours scolaires PARTIELS, un calendrier et des notes locales. Backend Supabase : deux tables vidéo (RLS actif, 0 entrée), **aucune Edge Function déployée**, endpoint Beam IA nul, paiements Learning Pass désactivés. 0 alerte Supabase Security Advisor ; 3 avis performance non bloquants. Contrôle en navigateur public non abouti, malgré les Actions de déploiement réussies.
- Corrections : `scripts/audit_site.py` contrôle les fichiers/URL internes et les pages essentielles ; `.github/workflows/beam-ci.yml` vérifie les liens ; `.github/workflows/deploy.yml` teste HTTP 200 pour accueil/calendrier/notes/aperçu après déploiement ; `scripts/build_navigation_pages.py` répare le classement dynamique des sections ; `navigation.js`/`index.html` arrêtent les appels GLB 404 tant qu'aucun modèle réel n'est fourni ; `404.html` aide à retrouver le site ; `school-tools.js` propose export JSON/effacement confirmé et rappelle la confidentialité sur appareils partagés ; `calendrier.html`/`mes-notes.html` ajoutent Beam flottant et actualisent les scripts ; `school-tools.css` et `README.md` sont mis à jour.
- Tests à exécuter en PR : `python3 scripts/build_navigation_pages.py`, `python3 scripts/audit_site.py`, `node --check school-tools.js`, plus les tests CI existants. Vérifier puis corriger toute erreur retournée.
- **À ne pas déclarer achevés** : tests réels mobile et accessibilité, IA, paiement, vraie synchronisation inter-appareils, contenus vidéo approuvés, toutes les sources de programmes et qualité cinéma Beam.
- Après fusion, relever le statut du smoke test public GitHub Pages. Si ce test échoue, contrôler la source de déploiement dans GitHub Settings → Pages et l'URL réelle du site.

## Vérification des corrections d'audit — 30 octobre 2026
- PR de corrections : [#19](https://github.com/sigroupeimmo4-ux/UNKNOW/pull/19), fusionnée dans `main`.
- CI de la PR : **succès**, y compris le contrôle des références HTML/CSS/JS locales.
- Publication : GitHub Pages **succès**, [Actions 41084707883](https://github.com/sigroupeimmo4-ux/UNKNOW/actions/runs/41084707883).
- Les contrôles HTTP après publication ont réussi pour l'accueil, le calendrier, les notes et `beam-3d-apercu.html`.
- Les parcours réels en navigateur, l'accessibilité, la synchronisation Supabase, la voix/IA et la qualité du contenu restent non validés / partiels comme indiqué dans le rapport d'audit.

## 30 octobre 2026 — Correctif après rejet du modèle de Beam
- Retour utilisateur : **« la mascotte BEAM est horrible »**. Le dragon fabriqué en formes géométriques `beam-live.js` ne répond pas à la direction visuelle souhaitée et ne doit plus être présenté comme un modèle 3D final.
- Sauvegarde `backup-before-beam-visual-repair-20261030` ; branche de correction `beam-visual-repair-20261030`.
- Retrait de l'import `beam-live.js` des pages principales (navigation partagée, index, calendrier, notes). Le module de démonstration reste dans le dépôt pour l'historique technique, mais n'est plus chargé automatiquement pour les élèves.
- Le lanceur du chat revient provisoirement au dragon officiel WebP, sans fausse animation de respiration CSS. Le chat, les cours, comptes et données restent inchangés.
- `scripts/build_navigation_pages.py` actualise la version de `navigation.js` pour empêcher l'ancienne mise en cache. `scripts/audit_site.py` interdit désormais de recharger le prototype rejeté dans les pages publiques.
- Nouvelle référence : `docs/DIRECTION_ARTISTIQUE_BEAM_3D.md` (dragon de qualité film, vert pomme, iris marron, sans fiole, expressions et véritables animations riggées).
- **À faire** : un vrai modèle GLB sculpté et riggé, validé visuellement par l'utilisateur, avec visèmes et tests smartphone. Les maquettes générées sont des images, non des fichiers 3D. Ne pas annoncer « Beam 3D achevé ».
- Fusion et publication : à renseigner après réussite des tests GitHub Actions et des URL publiques.

## 30 octobre 2026 — Correction de la page d'aperçu Beam
- Branche `beam-preview-honest-20261030`.
- La page `beam-3d-apercu.html` n'affiche plus le prototype WebGL géométrique rejeté ; elle présente une information claire et l'illustration officielle provisoire, avec liens fonctionnels vers l'accueil et le chat.
- Elle ne contient plus de contrôles d'animation trompeurs ; un vrai GLB riggé, son apparence vert pomme/yeux marron et ses animations restent des objectifs, non des fonctionnalités terminées.
- Contrôle CI et publication à valider. Le rollback du prototype sur les pages principales a été publié via PR #21, GitHub Pages run 41128560380, avec vérification HTTP des routes réussie.

## 30 octobre 2026 — Tableau de bord scolaire : organisation et progression réelles
- Demande : appliquer les améliorations StudyBeam proposées après l'audit, en commençant par le tableau de bord, l'organisation des révisions et les notes, sans casser Pastel Dream ou les fonctionnalités de Beam.
- Sauvegarde avant modification : `backup-before-student-dashboard-20261030`. Branche de travail : `student-dashboard-improvements-20261030`.
- Nouveau `planner-data.js` : fonctions pures, sans accès serveur, pour calculer les événements du calendrier (dont les révisions hebdomadaires), les contrôles en retard, la moyenne indicative sur 20 et les objectifs. Aucune valeur scolaire simulée. Valeurs invalides/JSON mal formés rejetés.
- Nouveau `planner-dashboard.js` : sur `app.html#home`, panneau « Mes révisions et mes devoirs » montrant les événements du jour, les échéances à 7 jours, un agenda compact, la moyenne réelle des notes locales, les résultats par matière et une liste d'objectifs personnels éditables (ajouter, cocher, supprimer) ; liens directs vers calendrier et notes.
- Nouveau `planner-dashboard.css` : cartes Pastel Dream, affichage adaptatif, boutons utilisables au clavier et lisibilité mobile.
- `dashboard.js` : les anciennes mentions « aucune notion à revoir » ou « aucun objectif » sont remplacées par les véritables nombres d'objectifs, de révisions et de matières suivies, si présents.
- `school-tools.js` : modification d'une note déjà enregistrée sans la supprimer ni la dupliquer, avec commande Annuler la modification.
- Fichiers de raccordement : `app.html`, `calendrier.html`, `mes-notes.html`, `scripts/build_navigation_pages.py` (versions d'assets) ; `.github/workflows/beam-ci.yml` (contrôle syntaxique + tests Node du calculateur) ; `tests/test-planner.js`.
- Les données calendrier, notes et objectifs sont stockées **sur cet appareil** (localStorage) ; pas de synchronisation Supabase. Protéger le navigateur sur ordinateur partagé. Pas de rappels hors page ouverte.
- À vérifier avant d'annoncer publication : génération des pages + `--check`, contrôle des liens, tests unitaires Node, CI, smoke HTTP après déploiement. Tests interactifs réels sur ordinateurs/téléphones restent à effectuer.
- Les autres améliorations proposées (IA Beam serveur, enrichissement du programme, contenu vidéo validé, paiement sécurisé, protection des mineurs, tests Auth et accessibilité avancés) restent des chantiers séparés : ne pas les annoncer comme terminés.

## Validation du tableau de bord — 30 octobre 2026
- PR [#23](https://github.com/sigroupeimmo4-ux/UNKNOW/pull/23) fusionnée : `student-dashboard-improvements-20261030` → `main`.
- CI [41133111196](https://github.com/sigroupeimmo4-ux/UNKNOW/actions/runs/41133111196) : **succès** pour `node --check`, tests `tests/test-planner.js` (dates, récurrence, échéances, notes et objectifs), régénération des pages et audit des liens/ressources.
- Publication GitHub Pages [41133168611](https://github.com/sigroupeimmo4-ux/UNKNOW/actions/runs/41133168611) : **succès**. Vérification HTTP publique post-déploiement **réussie** pour accueil, calendrier, notes et aperçu Beam.
- Page utilisateur à tester : `https://sigroupeimmo4-ux.github.io/UNKNOW/app.html` (accueil élève), plus `calendrier.html` et `mes-notes.html`.
- Tests manuels navigateur et Auth pas encore réalisés : ce déploiement ne garantit pas la qualité du rendu visuel ni la synchronisation entre appareils.

## 30 octobre 2026 — Consolidation globale de l'espace élève (hors accueil)
- Après demande explicite utilisateur de finaliser le reste de StudyBeam, le périmètre a été étendu aux pages internes. Sauvegarde préalable `backup-before-platform-consolidation-20261030` ; branche `platform-consolidation-20261030`.
- L'ancien écran `app.html#dragon` et les contrôles de costume/déguisement ne décrivaient pas de vrais changements visuels : écran, menu, scripts et préférences de costume ont été retirés de l'interface. Les anciennes URL `#dragon` sont redirigées par `app.js` vers le chat `#tutor` ; aucune donnée utilisateur n'est effacée.
- Le générateur `scripts/build_navigation_pages.py` n'émet plus « Mon dragon » dans les menus des autres pages et ne réintroduit pas la personnalisation factice. Le module historique `beam-customizer.js` est conservé dans le dépôt mais n'est plus chargé par les pages élèves.
- `beam-global.js` : nouveaux raccourcis calendrier / notes, disparition de « Mon Beam » et de l'étiquette « vidéos vérifiées » trompeuse ; le service IA continue d'annoncer son indisponibilité. L'accueil et les pages scolaires actualisent leurs références de cache de Beam.
- `app.html` met les trois vrais cours de mathématiques CP vérifiés directement à portée des élèves : `cp-dizaines-unites`, `cp-comparer-nombres`, `cp-droite-graduee`. Aucun nouveau cours n'est inventé.
- `school-backup.js` (nouveau) : lecture et validation stricte de l'ancien format de sauvegarde JSON `studybeam-local-v1` pour les notes et le calendrier (dates impossibles refusées, horaires, valeurs, sections, 1 500 entrées max, 1 Mo max), sans envoi réseau. `school-tools.js` ajoute l'import avec confirmation de **remplacement** avant écriture locale ; l'export et la suppression sont conservés.
- Le calendrier conserve le statut `completedDates` pour **chaque occurrence** de révision hebdomadaire au lieu d'un seul indicateur pour toute la série. La vue Liste limite l'affichage aux 30 derniers jours + 365 prochains jours pour éviter de générer des milliers de récurrences sur un siècle. Les rappels restent visibles seulement si la page est ouverte.
- `calendrier.html` et `mes-notes.html` chargent la validation des sauvegardes avant le module scolaire. Le cache des scripts est mis à jour.
- `data/about-faq.html`, `data/about-privacy.html`, `README.md` précisent les fonctionnalités réellement actives, les comptes encore non ouverts aux mineurs, l'absence d'IA serveur et l'absence d'abonnement.
- Test de non-régression `tests/test-school-backup.cjs` ajouté à la CI `.github/workflows/beam-ci.yml` avec contrôle syntaxique JS. La régénération des pages et l'audit des liens/ressources continuent de s'exécuter avant chaque déploiement.
- Relecture Supabase (sans modification) : deux tables publiques pour vidéos avec RLS actif et 0 ligne, aucune Edge Function, aucun avertissement Security Advisor au moment du contrôle. Ne pas confondre cela avec une certification de conformité mineurs ou de sécurité des comptes.
- **Fonctions restantes bloquées** : IA générative (configuration serveur/secrets), synchronisation des données élèves par compte (conception RLS et confidentialité des mineurs), parcours parental et validation juridique, création/relecture d'un catalogue multi-niveaux vérifié, vidéos approuvées, prestataire de paiement et conditions commerciales. Il est dangereux de les présenter comme achevées.
- **À vérifier après fusion** : succès CI, fichier(s) changé(s), génération des pages, succès déploiement Pages et contrôles HTTP ; tests utilisateurs réels sur téléphone, Auth et interactions sur navigateur encore à effectuer. Ne pas supprimer les données localStorage existantes.

## 30 octobre 2026 — Tests et publication de la consolidation globale
- PR [#29](https://github.com/sigroupeimmo4-ux/UNKNOW/pull/29) fusionnée dans `main` SHA `ec9025a10598ea63a8a074dd67dae812219ca89d`.
- CI [41138847371](https://github.com/sigroupeimmo4-ux/UNKNOW/actions/runs/41138847371) : **succès** — vérification syntaxique JS, calculateur des notes et échéances, tests de sauvegarde et dates (dont le 29 février), génération des pages et audit des routes.
- Déploiement [41138924858](https://github.com/sigroupeimmo4-ux/UNKNOW/actions/runs/41138924858) : **succès**, avec contrôles HTTP des pages publiques réussis.
- Correctif de compatibilité : d'anciennes séries hebdomadaires marquées entièrement « terminées » doivent rester visuellement terminées ; pour passer au nouveau suivi par occurrence, une confirmation explicite réactive la série. Cela évite de réafficher automatiquement tous les anciens événements comme « non terminés ».
- Les tests en navigateurs réels (parcours inscriptions/e-mails, mobile, lecteur d’écran et imports interactifs) ne sont **pas** couverts par les contrôles HTTP et restent à réaliser avant ouverture aux mineurs.
