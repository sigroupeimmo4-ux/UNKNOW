# StudyBeam — Mission 1 : audit et correction des fondations

Date : 30 octobre 2026. Branche de travail : `mission-1-fondations`.
Point de départ conservé dans l’historique : `de0edd18b99b1f710ec5148a8a36f0470bf1cfa2`.

## Périmètre examiné avant correction

Site statique sans framework ni compilation : landing, application à vues, pages d’authentification, styles, logo, stockage local, référentiel et trois fichiers d’activités, assistant, fonction serveur IA préparée et workflow Pages. La branche a été créée avant modification. La suite initiale comportait 32 tests Python, tous réussis ; ce résultat ne couvrait pas les défauts décrits ci-dessous.

Les archives officielles sont conservées telles quelles et vérifiées par l’audit existant ; cette mission ne constitue pas une nouvelle validation juridique ou pédagogique des programmes.

## Constats et corrections

| Constat initial | Correction effective |
| --- | --- |
| Même liste de quatre matières pour toutes les classes sur l’accueil | Choix liés au catalogue existant : classe, voie, type, série et matière. Les chapitres ne sont proposés que lorsqu’ils existent dans une référence applicable. |
| Cours, fiches, audio et quiz de l’accueil dirigés vers l’exemple de dérivation | Les cartes ouvrent le format correspondant dans le référentiel, selon la sélection. Une sélection sans contenu ne reçoit pas de démonstration de remplacement. |
| Exemples utiles mélangés au parcours scolaire | Espace `#demo` dédié ; cours, fiche, audio et quiz historiques conservés avec badge et contexte de démonstration. |
| Audio d’exemple toujours consacré à la dérivation, commandes non protégées si l’API vocale manque | Dérivation cantonnée à la démonstration ; boutons pause/reprise/arrêt protégés. Les audios des programmes utilisent toujours leurs transcriptions propres. |
| Scores lus directement depuis le stockage et interpolés en HTML | Validation des scores entiers de 0 à 3, rendu texte et conservation des valeurs invalides sans réécriture automatique. Aucun résultat fictif ajouté. |
| Accès au stockage susceptibles d’interrompre le démarrage | Accès protégés, repli temporaire en mémoire et message indiquant l’absence de persistance. |
| Profil enregistré réécrit au démarrage | Lecture seule de l’ancien `sw-profile`. Nouveau `sw-school-profile` enregistré seulement lors d’un choix explicite ; les chapitres libres anciens ne sont pas transformés en chapitres officiels. |
| Suppression des scores sans confirmation | Confirmation avant suppression des seules clés des résultats de démonstration. Aucun effacement de compte ou de données serveur. |
| Navigation sans historique exploitable et liens directs limités | Routes par fragment, retour navigateur, rechargement des vues, état courant et focus de titre. Navigation accessible et persistante sous l’en-tête sur mobile. |
| Lien « Aller au contenu » susceptible de changer la vue | Lien d’évitement dédié au focus du contenu, sans changement de parcours. |
| Sélecteurs de préférences sans libellé associé | Labels explicites pour taille du texte et préférence de costume. |
| Choix de costumes sans résultat visuel, présenté comme une personnalisation réelle | Sélecteur et valeur conservés, avec mention de démonstration sans changement du dragon. La personnalisation avancée n’est pas développée. |
| Landing présentant trois groupes génériques | Cinq catégories conservées et reliées à des destinations : Cours, Fiches, Audio, Quiz, Vidéos. |
| JavaScript et styles de l’application dans un bloc compact | Extraction en fichiers, en conservant les vues, règles visuelles et fonctions d’exemple existantes. Pas de reconstruction ni ajout de framework. |
| Démarrage des vues lié au chargement du SDK d’authentification | Initialisation et raccourcis locaux avant le SDK externe. Un échec du catalogue laisse les démonstrations accessibles. |
| Présentation et parcours d’essai parfois désignés indistinctement « démonstration » | Destinations et textes clarifiés, notamment les liens d’authentification et le texte sans JavaScript. |

## Fonctionnalités réellement vérifiées

| Fonction | État et limite de la preuve |
| --- | --- |
| Landing, cinq catégories, navigation et préférences | Parcours testés dans Chromium ; identité et slogan conservés. |
| Parcours scolaire | Les 12 classes et 17 périmètres existants restent recensés. Matières filtrées à partir des références disponibles ; inventaire officiel toujours incomplet. |
| Trois chapitres CP | Cours, fiches, quiz corrigés et transcriptions existants conservés. Changement de chapitre et format testé ; aucune nouvelle ressource créée. |
| Audio | Commandes et choix de transcription testés. La lecture audible et les voix dépendent du navigateur ; l’absence de prise en charge est traitée. |
| Exemples de dérivation | Cours, fiche, quiz et audio conservés dans l’espace de démonstration. Score du quiz calculé par réponses réellement données pendant le test. |
| Progression | Uniquement les résultats du quiz de démonstration sur l’appareil. Aucun suivi global, synchronisation ni profil de résultats en base. |
| Vidéos | Recherche YouTube externe, sans catalogue de vidéos validées. Destination et paramètres vérifiés. |
| Beam | Dragon officiel et commandes de navigation locales conservés. Endpoint IA toujours `null` ; réponses IA réelles indisponibles. Les échanges simulés ne prouvent pas une connexion IA. |
| Authentification | Contrats du SDK, formulaires, erreurs, session et redirections internes testés avec simulation. Le SDK réel charge et initialise les formulaires dans le contrôle navigateur. |
| Service Supabase | Lecture réelle des paramètres publics : e-mail activé, inscriptions non désactivées, confirmation obligatoire. Cette lecture ne prouve pas un parcours complet avec un compte. |
| Confirmation et récupération par e-mail | Toujours non vérifiées avec une boîte réelle ; URL autorisées côté Supabase à contrôler administrativement. Aucun compte créé ni e-mail envoyé pendant cette mission. |
| Fonction IA serveur | Préparation antérieure conservée, non déployée ni exécutée dans Deno dans cette mission. Aucun ajout de clé ou connexion de modèle. |

## Éléments conservés

- Nom StudyBeam, slogan, logo WebP original et dragon lavande ; aucune modification du fichier image.
- Identité violette, bleue et dorée, thèmes, tailles de texte, style des cartes et pages existantes.
- Textes et corrections des exemples pédagogiques ; trois fichiers d’activités CP et toutes les sources archivées.
- Configuration publique Supabase, clés de stockage historiques et aucune migration de données serveur.
- Authentification existante et sa politique de mots de passe ; aucun nouveau compte, prix, abonnement ou Learning Pass.

## Fichiers concernés

- `app.html` : organisation des vues et séparation des démonstrations.
- `app.css` : styles de l’application extraits et ajustements de cohérence, focus, mobile et impression.
- `app.js` : navigation, préférences, audio d’exemple, recherche vidéo et rendu protégé des scores.
- `demo.js` : fonctions historiques des exemples, conservées à part.
- `school-data.js`, `school.js` : lecture commune du catalogue et sélection scolaire dépendante.
- `storage.js` : accès local protégé, sans effacement ni migration automatique.
- `curriculum.js` : ouverture d’un format depuis l’accueil et synchronisation du parcours, sélection de types appropriés et gestion de l’audio indisponible.
- `beam-assistant.js` : utilisation du contexte scolaire partagé ; pas de connexion IA ajoutée.
- `index.html`, `site.css` : cinq catégories, destinations et cohérence des textes et espacements.
- `login.html`, `signup.html`, `forgot-password.html`, `reset-password.html` : destinations de démonstration et message sans JavaScript corrigés.
- `tests/test_browser.py` : régressions et nouveaux parcours de fondation.
- `README.md`, `CHANGEMENTS.md`, ce rapport : état réel et suivi.

## Vérifications finales

- 42 tests Python réussis (suite de 41 tests, puis test vidéo supplémentaire) : parcours navigateur de l’application et de l’authentification simulée, intégrité et cohérence du registre. La suite initiale en avait 32.
- 2 tests JavaScript du filtrage des programmes et versions réussis.
- 119 liens/ressources locaux contrôlés, sans destination ni ancre manquante (routes applicatives incluses).
- 109 combinaisons page/largeur vérifiées : 1440, 1024, 768, 390 et 320 px, avec contrôles supplémentaires en texte agrandi. Aucun débordement horizontal ni erreur JavaScript dans ce contrôle.
- Vérification réelle du chargement du SDK sur connexion, inscription et demande de récupération, sans soumission.
- Logo, catalogue, contenus, configuration Supabase et fonction serveur IA identiques au point de départ.
- Recherche de motifs de secrets courants dans les fichiers applicatifs : aucune correspondance ; la clé publique Supabase reste publique par conception. Cette recherche ne constitue pas un audit de sécurité exhaustif.
- `git diff --check` sans erreur.
- Audit strict du référentiel : **échec attendu et conservé**. Il signale 296 références, 72 dates contrôlées et trois chapitres avec activités, mais aucun programme entièrement intégré. Ce contrôle ne fait pas partie des tests déclarés réussis.

## Interventions supplémentaires

- Vérifier les URL de retour et les e-mails Supabase avec un compte de test réel, via les réglages sécurisés ; ne pas transmettre de mot de passe dans le chat.
- Compléter et vérifier les matières, variantes et contenus officiels dans une mission dédiée. Aucune conformité exhaustive 2026-2027 n’est revendiquée.
- Traiter séparément connexion IA, quotas, récupération des sources vérifiées et personnalisation visuelle du dragon.
- Définir le futur suivi de progression et les accès aux données avant toute synchronisation de résultats par compte.
- La vérification d’accessibilité ici couvre labels, clavier, focus, navigation et reflow. Elle ne constitue pas une certification WCAG complète ni un test exhaustif avec lecteurs d’écran et tous les navigateurs.
