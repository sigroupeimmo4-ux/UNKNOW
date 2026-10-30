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
