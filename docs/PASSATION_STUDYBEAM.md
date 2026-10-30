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
