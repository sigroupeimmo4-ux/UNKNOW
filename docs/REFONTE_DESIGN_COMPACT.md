# StudyBeam — Refonte Modern & Compact

Mission du 30 octobre 2026. Branche de travail : `mission-design-compact`, créée avant modification depuis `0465788` (mission navigation). Le projet statique et ses fonctionnalités sont réutilisés ; aucun framework ni nouveau service n’est ajouté.

## Interface

- Barre latérale fixe avec logo officiel, icônes SVG cohérentes, groupes Apprendre / Mon espace / Explorer et page active mise en évidence. Réduction en colonne d’icônes sur ordinateur, préférence locale conservée. Le menu défile intérieurement sur les écrans courts.
- Sur téléphone et tablette étroite, menu ouvert par une icône, fermeture par navigation, arrière-plan ou Échap. Le contenu occupe toute la largeur. La hauteur de la barre supérieure est mesurée pour placer le menu en dessous, y compris avec du texte agrandi.
- Barre supérieure compacte : fil d’Ariane, recherche de cours qui utilise les filtres réels, profil et paramètres du compte. Aucune notification fictive : le service n’étant pas configuré, son icône n’apparaît pas.
- Nouvelle palette par défaut demandée : fond `#F8F8FC`, violet `#7659C8`, bleu `#6599D6`, lavande `#EFEAFA`, texte `#292638`, bordures `#E9E7EF`, blanc `#FFFFFF`. Le bleu est utilisé pour des fonds et accents, avec un texte plus sombre pour la lisibilité. Les thèmes et tailles de texte déjà enregistrés restent disponibles ; leurs données ne sont pas réinitialisées.
- Typographie système lisible, cartes plus compactes, angles modérés, ombres légères, suppression des grands aplats décoratifs et des dégradés sur les vues refondues. Prise en compte de la réduction des animations.

## Accueil et données réelles

`index.html` devient le tableau de bord : accueil, dragon de taille modérée, reprise d’apprentissage, six accès rapides et progression. Les filtres scolaires existants restent dans « Mon espace » (`app.html`). La FAQ et les informations sur les données restent accessibles dans « Comment ça marche ? » ; les liens des formulaires vers ces informations ont été adaptés.

Le prénom est facultatif, renseigné dans les paramètres et enregistré uniquement sur cet appareil. Sans prénom connu, le titre affiche « Bonjour ! ».

Pour rendre la reprise réelle, une consultation réussie d’un cours du référentiel ajoute son identifiant et sa date à un historique local de vingt cours au maximum. Aucun historique n’est créé à partir d’une simple ouverture de l’accueil, d’un lien invalide ou d’un cours impossible à charger. Les identifiants sont vérifiés contre le catalogue avant affichage du lien de reprise. L’historique commence avec cette version ; les visites antérieures n’ont pas été reconstruites.

La progression indique le nombre de cours effectivement enregistrés et le dernier score de démonstration si celui-ci existe. Les chapitres terminés ne sont pas suivis : aucun pourcentage ni statut de réussite n’est déduit d’une consultation. Les notions à revoir et objectifs personnels indiquent explicitement l’absence de données enregistrées. Les résultats des quiz du référentiel restent hors du suivi existant ; aucun résultat fictif n’est ajouté.

Les ajouts techniques de stockage sont limités à trois nouvelles clés locales : `sw-sidebar-collapsed`, `sw-display-name`, `sw-learning-history`. Les autres clés restent intactes, sans migration. Ces informations ne sont pas synchronisées au compte et aucune nouvelle connexion d’API n’est créée.

## Routes et pages

| Rubrique | Destination |
| --- | --- |
| Accueil | `index.html` |
| Programmes | `programmes.html`, puis paramètres niveau, classe, voie représentée par le niveau du lycée, série, matière et chapitre |
| Cours | `cours.html` et `?lesson=identifiant` |
| Fiches de révision | `fiches.html` et `?lesson=identifiant` |
| Audio | `audio.html` et `?lesson=identifiant` |
| Quiz | `quiz.html` et `?lesson=identifiant` |
| Vidéos | `videos.html` |
| Learning Pass | `learning-pass.html` |
| Mon dragon | **Nouvelle route** `app.html#dragon` |
| Progression | `app.html#progress` |
| Paramètres et profil | `app.html#settings` |

Les liens vers l’espace scolaire, les démonstrations, Beam, la connexion et l’inscription restent disponibles. La navigation reste compatible avec GitHub Pages : fichiers HTML et fragments de routes existants, sans réécriture serveur. Les sous-vues Programmes et les filtres restent dans les paramètres d’URL.

« Mon dragon » montre le dragon lavande original, sa couleur et l’état réel des costumes/accessoires. Aucun autre visuel n’étant disponible, aucun sélecteur ne prétend modifier son apparence. Les préférences de costumes de démonstration existantes restent conservées dans les paramètres, avec leur limite explicitement indiquée.

Toutes les pages de ressources, les réglages, le chat, la progression et les formulaires d’authentification utilisent la nouvelle présentation. Les champs, validations, sessions et redirections Supabase sont conservés.

## Composants réutilisés et fichiers

- Catalogue, leçons, moteur du référentiel, filtres, lecteur vocal et activités existants réutilisés.
- `design.css` : couche de présentation commune, sans réécriture des styles historiques.
- `navigation.js` : menu permanent, réduction, mobile, page active, fil supérieur et préférences visuelles partagées.
- `dashboard.js` : accueil personnalisé localement et présentation des données réellement enregistrées.
- `library.js` : un point d’enregistrement après l’affichage réussi d’un cours ; les contenus ne changent pas.
- `app.js` : route du dragon, préférences partagées et rafraîchissement du résumé après changement des scores de démonstration.
- `scripts/build_navigation_pages.py` : gabarit commun réutilisé pour l’en-tête, le menu et les neuf pages de bibliothèque. Le contrôle non destructif `--check` reste exécuté avant déploiement.
- `data/about-faq.html`, `data/about-privacy.html` : FAQ et informations sur les données de l’ancien accueil conservées dans la page de présentation, avec mention des trois nouvelles préférences/historiques locaux.

Comparaison avec la version précédente : image originale du logo/dragon, catalogue, leçons, sources, moteur `curriculum.js`, `auth.js`, configuration Supabase, connexions IA, fonctions serveur, stockage existant et démonstrations inchangés. Aucun compte, e-mail, abonnement ni paiement n’est créé par les tests.

## Vérifications et limites

Les tests couvrent les onze entrées principales, page active unique, liens directs, rechargement, précédent/suivant, navigation sans saut vers une section, menu mobile, réduction persistante, recherche, reprise réelle, absence de fausses activités, prénom rendu en texte et conservation des données existantes. La suite de régression vérifie également les formulaires Supabase avec SDK simulé, Beam, les quiz, l’audio et les règles d’applicabilité des programmes.

- **66 tests Python réussis** : 56 régressions et 10 tests de design/navigation. Les onze destinations ont aussi été contrôlées depuis le menu mobile, en plus du passage complet.
- **2 tests JavaScript réussis** pour les règles d’applicabilité et de correspondance des contenus.
- **126 contrôles responsive réussis** sur 18 vues à 1440, 1024, 768, 390 et 320 px, avec cas supplémentaires en texte de 22 px sur ordinateur et téléphone : aucun débordement horizontal ni erreur JavaScript. Captures inspectées pour l’accueil, les programmes, les ressources et le dragon.
- **24 contrôles responsive supplémentaires réussis** pour les pages de récupération et de retour d’authentification, à 320, 390, 768 et 1440 px, en texte de 16 et 22 px : aucun débordement horizontal ni erreur JavaScript. Soit **150 contrôles d’affichage** au total.
- **611 liens/ressources locaux et 156 ancres contrôlés**, sans cible manquante ni identifiant HTML dupliqué.
- Cohérence des pages générées (`--check`), syntaxe des scripts modifiés et comparaison des composants préservés contrôlées.

Les tests Supabase utilisent un SDK simulé, sans création de compte ni envoi d’e-mail. Une assertion du test de récupération attend désormais la fin réelle du nettoyage asynchrone de l’URL ; le code d’authentification reste inchangé.

Limites conservées : programmes partiellement intégrés, vidéos sélectionnées et offres Learning Pass non configurées, API IA inactive, costumes/accessoires non disponibles, progression non synchronisée, réception réelle des e-mails Supabase à vérifier avec un vrai compte. La mission design ne les déclare pas opérationnels.
