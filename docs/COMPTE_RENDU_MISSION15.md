# StudyBeam — Mission 1.5 : navigation

Travail effectué le 30 octobre 2026 sur la branche `mission-1-5-navigation`, à partir de `9fe5873`. Le site existant est conservé, sans nouveau framework ni serveur applicatif.

## Pages et routes

Les dix destinations principales possèdent un fichier HTML accessible directement :

| Destination | Route |
| --- | --- |
| Accueil | `index.html` |
| Programmes | `programmes.html` |
| Cours | `cours.html` |
| Fiches | `fiches.html` |
| Audio | `audio.html` |
| Quiz | `quiz.html` |
| Vidéos | `videos.html` |
| Learning Pass | `learning-pass.html` |
| Connexion | `login.html` |
| Inscription | `signup.html` |

Neuf pages ont été ajoutées : les sept pages Programmes/Cours/Fiches/Audio/Quiz/Vidéos/Learning Pass, `ressource.html` pour les autres activités associées et `a-propos.html` pour le bouton de présentation de l’accueil. Chaque nouveau fichier contient une seule page visible, sans copie des anciennes sections masquées de l’application.

Exemples de liens directs, compatibles avec le préfixe GitHub Pages `/UNKNOW/` :

- `programmes.html?level=college`
- `programmes.html?level=college&grade=5e`
- `programmes.html?level=college&grade=5e&subjectId=mathematiques-commun`
- `programmes.html?level=primaire&grade=CP&subjectId=mathematiques-commun&chapterId=cp-dizaines-unites`
- `cours.html?grade=CP&pathway=commun&subjectId=mathematiques-commun&q=comparer`
- `cours.html?lesson=cp-dizaines-unites`
- `fiches.html?lesson=cp-dizaines-unites`
- `audio.html?lesson=cp-dizaines-unites`
- `quiz.html?lesson=cp-dizaines-unites`
- `ressource.html?kind=exercise&lesson=cp-dizaines-unites`

Les paramètres définissent la vue, les filtres et le contenu ; le rechargement ne dépend pas d’un état en mémoire. Les boutons précédent/suivant restent ceux du navigateur. Un quiz rechargé retrouve son chapitre et recommence sa tentative : la sauvegarde des réponses en cours n’existait pas et n’a pas été ajoutée.

## Organisation et comportement

- Menu partagé sur les pages publiques, les formulaires et l’application, avec ouverture/repli sur mobile. Les dix destinations demandées sont des liens vers des fichiers, sans ancre de section.
- Programmes : cinq niveaux, puis classe, matière, chapitre. La seconde générale et technologique reste commune ; les séries technologiques et les types d’enseignement recensés restent distingués. Les références et calendriers vérifiés sont consultables.
- Cours, fiches, audio et quiz : recherche, classe, voie, enseignement, série quand applicable, matière et chapitre ; ressource individuelle avec sa propre URL et liens vers ses formats associés.
- Fil d’Ariane, titre, accueil, page précédente et accès au menu sur chaque nouvelle page. Sans historique interne, le bouton précédent revient au parent logique.
- Les anciennes URL `app.html#course`, `#sheets`, `#audio`, `#quiz`, `#videos` et `#curriculum` sont redirigées vers les pages correspondantes. Les démonstrations, réglages, progression et Beam restent accessibles dans l’application existante.
- Suppression du défilement automatique vers les anciennes sections pour la navigation principale. Le lien d’évitement « Aller au contenu » reste disponible pour l’accessibilité.

## Audio, vidéos et offres

L’audio existant est une synthèse vocale du texte du chapitre, pas un fichier enregistré. Le lecteur expose lecture, pause, reprise, arrêt, volume et vitesse pour la prochaine lecture. La progression utilise les événements de position du navigateur ; sans ces événements, elle reste indéterminée. La sortie de page arrête la voix. Sans API vocale, les commandes sont désactivées et la transcription reste lisible. La présence de l’API ne garantit pas qu’une voix soit effectivement disponible sur chaque appareil.

`data/videos.json` ne contient encore aucune vidéo sélectionnée. La page propose les filtres et une recherche YouTube explicitement externe et non validée. Les entrées configurées pourront afficher titre, source et présentation, avec ouverture HTTPS sur la plateforme d’origine.

`data/learning-pass.json` ne contient aucune offre. Aucun tarif, avantage payant ou paiement n’est inventé. Le rendu des formules et du tableau comparatif est prévu et testé avec une configuration simulée, absente des données de production.

La difficulté des quiz n’est pas renseignée dans le catalogue : aucun niveau artificiel n’est ajouté.

## Préservation

Vérification par comparaison avec `9fe5873` : logo, dragon, `app.css`, `site.css`, catalogue, leçons, sources, scripts de données scolaires, démonstrations, stockage, authentification, configurations Supabase et IA, et fonctions serveur inchangés. `navigation.css` organise le menu et les vues en réutilisant les couleurs et polices existantes ; les préférences visuelles sauvegardées sont lues.

Aucune migration ni suppression de données locales. Les préférences et scores existants sont conservés. Aucun compte ni e-mail n’a été créé. L’IA n’a pas été activée et les limites de vérification des e-mails Supabase décrites dans le README restent applicables.

La couverture scolaire reste partielle : seuls les trois chapitres CP de mathématiques existants disposent d’activités vérifiées. Une matière sans chapitre disponible affiche cet état, sans remplacement par une démonstration. La mission ne complète pas les programmes scolaires.

## Fichiers techniques

- `navigation.js`, `navigation.css` : menu partagé et organisation responsive.
- `library.js` : vues, liens, filtres, listes et consultation des activités existantes.
- `library-shell.js` : lecture des préférences sans écriture et adaptation au moteur existant.
- `curriculum.js` : réutilisation des règles d’applicabilité et commandes de lecture vocale.
- `app.js`, pages publiques/authentification : destinations et compatibilité des anciens liens.
- `scripts/build_navigation_pages.py` : génération reproductible des neuf pages et menus. Après modification du gabarit, lancer `python3 scripts/build_navigation_pages.py`. Le mode `--check` compare sans écrire ; le déploiement Pages le lance avant publication.
- `tests/test_navigation.py` : quatorze tests de navigation supplémentaires ; les tests existants suivent maintenant les nouvelles destinations.

## Vérifications

- **56 tests Python réussis**, incluant les 14 nouveaux tests de navigation et les régressions d’authentification, stockage, Beam, démonstrations et référentiel.
- **2 tests JavaScript réussis** : règles de calendrier et concordance de version/chapitre.
- Liens directs et rechargement sous `/UNKNOW/`, retour/suivant, parcours Programmes, filtres, liens associés, erreur de ressource inconnue, menu mobile et absence de défilement principal testés dans Chromium.
- Commandes audio et progression vérifiées avec API vocale simulée ; l’émission sonore réelle sur tous les appareils n’est pas certifiée.
- Configuration Learning Pass simulée vérifiée ; données réelles toujours vides. Aucun paiement testé ou ajouté.
- **476 liens/ressources locaux contrôlés**, aucun identifiant HTML dupliqué. **78 contrôles d’affichage** à 1440, 1024, 768, 390 et 320 px, dont 390 px avec police de 22 px : aucun débordement horizontal ni erreur JavaScript. Captures des programmes, listes et lecteur vocal inspectées sur ordinateur et mobile.
- Syntaxe des scripts modifiés, cohérence des pages générées et absence d’erreurs d’espacement Git contrôlées.

Les tests ne prouvent pas une couverture officielle complète des programmes ni la livraison réelle des e-mails.
