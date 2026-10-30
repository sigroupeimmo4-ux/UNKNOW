# Suivi des changements — StudyBeam

Ce fichier centralise les changements du projet. Il sera mis à jour à chaque modification avec son objectif, les fichiers concernés et les vérifications effectuées.

Les éléments prévus ci-dessous sont des propositions issues de l’analyse initiale. Leur état est indiqué dans le tableau.

## Changements réalisés

### 2026-10-30 — Mission 1 : audit et correction des fondations

- **Préservation :** branche `mission-1-fondations` créée au commit `de0edd1` avant modification. Logo, mascotte, catalogue, contenus CP, sources et configuration Supabase conservés.
- **Corrections :** parcours scolaire dépendant du catalogue, cinq catégories reliées aux contenus disponibles, espace de démonstration dédié, historique et navigation clavier/mobile, stockage protégé et scores rendus en texte, confirmation avant effacement des seuls scores de démonstration, labels et audio indisponible traités, préférences de costume honnêtement signalées sans apparence inventée.
- **Organisation :** styles et fonctions de l’application existante séparés en fichiers ; aucune reconstruction ni nouveau framework. Anciens choix de parcours lus sans réécriture automatique. Beam et l’authentification sont conservés ; aucune connexion IA, personnalisation avancée ou Learning Pass ajouté.
- **Vérifications :** 42 tests Python et 2 tests JavaScript réussis, 119 liens/ressources locaux contrôlés, 109 contrôles d’affichage sans erreur JavaScript ni débordement. SDK réel chargé et paramètres publics Supabase vérifiés ; aucun compte ni e-mail créé. L’audit strict des programmes reste en échec attendu car la couverture est incomplète.
- **Compte rendu :** `docs/AUDIT_MISSION1.md` décrit les fichiers concernés, les corrections, les preuves et les limites. Les e-mails réels, les programmes complets et les autres missions restent à traiter séparément.

### 2026-10-30 — Beam dans la plateforme et préparation de l’API IA

- **Changement :** dragon visible dans le chat et bouton flottant Beam sur les pages de l’application. Suppression des anciennes réponses prédéfinies du chat et des éléments graphiques inutilisés du robot. Beam ouvre déjà quiz, fiches, cours, programmes et progression via des raccourcis et commandes locales.
- **Préparation IA :** point de connexion désactivé par défaut dans `agent-config.js`, client authentifié avec session Supabase, actions de navigation limitées à une liste autorisée. Une réponse invalide n’exécute aucune action. Modèle de fonction serveur `supabase/functions/beam-agent/` ajouté ; non déployé, sans clé ni modèle configurés, et sans validation dans Deno. Quotas et récupération du corpus officiel restent à implémenter avant activation publique.
- **Supabase :** le service réel répond et confirme connexion e-mail active, inscriptions actives et confirmation d’adresse obligatoire. Les retours e-mail et mots de passe doivent encore être vérifiés avec un vrai compte ; aucun compte ni e-mail créé pendant les tests.
- **Validation :** 32 tests Python réussis, dont actions locales du dragon, réponse IA simulée avec navigation et rejet d’une action inconnue. Contrôle de syntaxe du client JavaScript ; fonction TypeScript non exécutée dans Deno. Le service IA ne doit pas être déclaré connecté avant configuration et vérification réelles.

### 2026-10-29 — Intégration du logo au petit dragon

- **Changement :** utilisation de l’image transparente fournie par lien partagé, conservée sans retouche dans `assets/studybeam-logo.webp` (512 × 512). Le logo est affiché dans les en-têtes et la landing page, et le dragon remplace le robot de démonstration. Les pages d’authentification reprennent la mascotte et les couleurs violet, bleu et doré.
- **Fichiers concernés :** pages HTML, `site.css`, `assets/studybeam-logo.webp`, `CHANGEMENTS.md`.
- **Validation :** 30 tests Python réussis, contrôle visuel de l’accueil et chargement du logo vérifié sur accueil, connexion et application. Aucun débordement à 390 px. Publication par le workflow GitHub Pages.

### 2026-10-29 — Correction du nom en StudyBeam

- **Changement :** remplacement du nom du produit par StudyBeam dans la landing page, l’application, toutes les pages d’authentification, les métadonnées, les textes accessibles, le logo SVG, le référentiel et la documentation courante. Le compagnon est désormais nommé Beam. Le workflow Pages porte également le nouveau nom.
- **Compatibilité :** renommage cohérent des variables publiques de configuration Supabase dans la configuration et le client. Les données locales et le projet Supabase existant sont conservés.
- **Historique :** les anciennes entrées de ce journal conservent les noms utilisés à leur date de rédaction. Les documents officiels archivés ne sont pas modifiés.
- **Validation :** 30 tests Python et 2 tests JavaScript réussis. Vérification de l’absence de l’ancien nom dans les pages et ressources actives. Les URL des ressources portent une version `studybeam` pour renouveler le cache du logo et des scripts. Publication par le workflow GitHub Pages.

### 2026-10-29 — Préparation de la publication GitHub Pages

- **Demande :** fournir un lien GitHub vers la version actuelle du site.
- **Changement :** préparation de la landing page, des pages d’authentification et des évolutions précédentes pour le workflow GitHub Pages existant sur `main`.
- **Vérifications :** site Pages existant accessible, branche distante au même commit de départ, autorisation d’écriture confirmée et absence d’erreur de format dans le diff. Les 30 tests Python et 2 tests JavaScript ont passé lors de la validation précédente.
- **Publication confirmée :** commit `739cb76` envoyé sur `main`, workflow GitHub Pages `40884425338` réussi. Le site https://sigroupeimmo4-ux.github.io/UNKNOW/ sert la nouvelle version : accueil, connexion, inscription, application et fichier d’activité contrôlés en HTTP 200.
- **Limites :** les URL de retour Supabase et les parcours e-mail réels restent à vérifier ; le référentiel scolaire reste partiel.

### 2026-10-29 — Landing page et pages d’authentification

- **Changements :** création d’une landing page dans `index.html` (présentation, démonstration, référentiel, questions et informations sur les données). L’application existante est conservée dans `app.html` avec ses activités et le lien direct `#curriculum`. Identité visuelle StudyWink conservée, affichage adapté au mobile.
- **Authentification :** pages séparées de connexion, inscription, demande de récupération, changement du mot de passe et retour de confirmation. Intégration au projet Supabase existant avec SDK fixé à `2.118.0`, PKCE, persistance de session, déconnexion locale, gestion des erreurs et des liens expirés, confirmation du mot de passe et protection contre les demandes simultanées. Le formulaire ne devient utilisable qu’après initialisation. Une session ancienne invalide ne bloque pas une nouvelle connexion.
- **Fichiers concernés :** `index.html`, `app.html`, `site.css`, `login.html`, `signup.html`, `forgot-password.html`, `reset-password.html`, `auth-callback.html`, `auth.js`, `tests/test_auth.py`, `tests/test_browser.py`, `README.md`, `curriculum/README.md`, `CHANGEMENTS.md`.
- **Vérifications :** 30 tests Python et 2 tests JavaScript réussis. Les parcours positifs d’authentification sont testés avec un SDK simulé, sous un préfixe de déploiement. Vérification complémentaire avec le SDK réel : formulaires initialisés, récupération sans session refusée, absence d’erreur JavaScript et de débordement à 390 px. Le service Supabase réel confirme l’e-mail activé et la confirmation obligatoire ; il refuse les identifiants de test inexistants avec `400 invalid_credentials`.
- **Limites et suite :** vérifier les deux URL de retour dans les réglages Supabase, puis tester confirmation et récupération avec un vrai compte. Aucun compte réel créé et aucun e-mail envoyé pendant les vérifications. Les préférences et scores ne sont pas synchronisés aux comptes. Les règles d’ouverture aux élèves et les futures tables/RLS restent à définir. Changements locaux, non publiés.

### 2026-10-29 — Sources accessibles et premiers parcours reliés aux programmes

- **Changements :** reprise après rétablissement du réseau. Archivage de 96 sources officielles, dont 21 PDF, avec URL, date de consultation et SHA-256. Recensement de 296 entrées classe/matière/type/variante sur 17 périmètres ; 72 références disposent d’un calendrier contrôlé. Conservation des réformes par phase, notamment 5e en 2026 / 4e en 2027 / 3e en 2028 et mathématiques de terminale à partir de 2027.
- **Interface :** ajout de la page « Programmes français 2026-2027 », accessible depuis l’accueil, avec classe, voie, type d’enseignement, série technologique, matière, domaine et chapitre. Les références et contenus manquants sont signalés ; les programmes futurs et les versions incohérentes ne fournissent pas d’activité.
- **Pédagogie :** trois chapitres CP sur les dizaines/unités, la comparaison des nombres et la droite graduée. Chaque chapitre comprend cours, fiche, quiz corrigé, exercices, auto-évaluation, transcription audio lue par le navigateur et explication guidée préparée. Les objectifs sont reliés aux pages 3–4 de l’annexe 4 du programme de mathématiques du cycle 2. Pas d’IA générative connectée ni de certification institutionnelle.
- **Fichiers concernés :** `index.html`, `curriculum.js`, `curriculum/catalogue.json`, `curriculum/lessons/`, `curriculum/sources/`, `curriculum/coverage.json`, `curriculum/README.md`, `scripts/audit_curriculum.py`, `tests/`, `README.md`, `CHANGEMENTS.md`.
- **Vérifications :** 15 tests Python réussis, dont 7 parcours navigateur et 8 contrôles du registre ; 2 tests JavaScript réussis. Contrôle visuel et largeur mobile de 390 px sans débordement sur le parcours CP. Les tests navigateur démarrent et arrêtent désormais leur propre serveur temporaire. L’audio utilise le chapitre sélectionné et s’arrête aux changements de classe, de chapitre ou de page.
- **Audit :** empreintes, références et 21 formats des trois chapitres contrôlés. L’audit strict reste en échec, comme attendu : aucun programme entièrement intégré, des inventaires et contenus incomplets. Une référence identifiée ne vaut pas intégration pédagogique.
- **Limites et suite :** poursuivre la vérification des matières, options, langues, séries et diplômes professionnels, puis produire et relire leurs contenus. Les activités historiques restent une démonstration distincte. Les résultats des nouveaux quiz ne sont pas encore synchronisés au compte ou au score de démonstration. Changements locaux, non publiés.

### 2026-10-29 — Préparation du référentiel français 2026-2027 (incomplète)

- **Demande :** aligner les contenus du CP à la Terminale sur les textes officiels, leurs versions et leurs dates d’application ; distinguer les voies du lycée.
- **Changements :** création d’un registre de 17 périmètres classe/voie, tous marqués non vérifiés, sans inventaire de matières ni compétence officielle inventés. Documentation du modèle des programmes, contenus, références et versions. Ajout d’un audit qui signale les manques et refuse notamment les dates futures, les sources non officielles et les versions de contenu incohérentes. Clarification de l’avertissement dans l’accueil.
- **Fichiers concernés :** `curriculum/catalogue.json`, `curriculum/README.md`, `scripts/audit_curriculum.py`, `tests/test_curriculum.py`, `index.html`, `CHANGEMENTS.md`.
- **Vérifications :** 7 tests réussis au total : 4 tests unitaires du registre et 3 tests navigateur de non-régression. L’audit strict échoue comme attendu : 0 programme officiel vérifié, 0 contenu validé et 17 inventaires à vérifier. Cet échec empêche de présenter la structure comme une intégration achevée.
- **Blocage :** les deux sources demandées sont refusées par le proxy HTTPS (403). Les domaines du ministère et d’Éduscol ont été ajoutés au brouillon réseau en préservant le domaine Supabase ; les changements ne sont pas encore appliqués ni publiés.
- **Suite obligatoire :** rétablir l’accès, consulter les textes et annexes, vérifier les matières et variantes du lycée, renseigner les dates, produire et relire les contenus puis connecter le corpus validé aux activités. Les exemples actuels restent hors du corpus officiel.

### 2026-10-29 — Fiabilisation du profil et du score

- **Changement :** un profil enregistré avec un JSON invalide ou une structure incorrecte ne bloque plus le démarrage. Les classes et matières inconnues et les chapitres invalides reviennent aux valeurs par défaut ; les préférences valides sont conservées.
- **Changement :** l’accueil et la page de progression sont actualisés dès la fin du quiz. Un résultat inférieur ne remplace pas le meilleur score.
- **Fichiers concernés :** `index.html`, `tests/test_browser.py`, `CHANGEMENTS.md`.
- **Vérifications :** 3 tests automatisés réussis dans Chromium : récupération de cinq profils invalides et ouverture du quiz, conservation d’un profil valide, actualisation du score après deux quiz et persistance après rechargement. Aucune erreur JavaScript sur ces parcours.
- **Exécution :** démarrer le site sur le port 3000, puis lancer `python3 -m unittest discover -s tests -v`. Playwright Python et Chromium sont nécessaires. Ces tests couvrent les fonctions locales ; les appels externes sont bloqués volontairement.
- **Limites ou suite :** les restrictions du navigateur empêchant tout accès au stockage local et l’authentification Supabase ne sont pas couvertes par ces corrections.

### 2026-10-29 — Création du suivi

- **Changement :** création de ce journal pour suivre les prochaines évolutions.
- **Fichier concerné :** `CHANGEMENTS.md`.
- **Vérification :** documentation uniquement ; aucun changement du fonctionnement du site.

## Changements prévus

| Statut | Changement | Objectif |
| --- | --- | --- |
| Réalisé | Protéger la lecture du profil dans le stockage local | Éviter qu’un profil enregistré invalide bloque le démarrage. |
| Réalisé | Actualiser le score de l’accueil après un quiz | Afficher immédiatement la progression enregistrée. |
| À faire | Adapter la lecture audio au contenu sélectionné | Éviter de lire la dérivation pour une autre sélection. |
| Réalisé — tests réels d’e-mails à faire | Renforcer la gestion de l’authentification | Traiter les erreurs, clarifier les messages et éviter les demandes simultanées. |
| À faire | Séparer le style, la logique et les contenus | Faciliter la maintenance et l’ajout de cours. |
| En cours — 3 tests ajoutés | Ajouter des tests fonctionnels réutilisables | Vérifier les parcours principaux et prévenir les régressions. |
| À vérifier | Valider les parcours e-mail Supabase | Tester confirmation et récupération avec un vrai compte après vérification des URL de retour. |
| En cours — premières activités reliées aux sources | Intégrer les programmes officiels français 2026-2027 | Vérifier les sources et contenus pour chaque classe, matière et voie. |
| À définir | Enregistrer la progression par compte | Définir les données et les règles d’accès avant leur mise en place. |

## Format des prochaines entrées

Pour chaque changement réalisé, ajouter une entrée datée dans « Changements réalisés » avec :

- **Changement :** ce qui a été modifié et pourquoi.
- **Fichiers concernés :** les fichiers créés ou modifiés.
- **Vérifications :** les contrôles exécutés et leurs résultats.
- **Limites ou suite :** les points restant à traiter, si nécessaire.

Mettre également à jour le statut de l’élément correspondant dans le tableau. Distinguer les changements réalisés, en cours, à faire et à vérifier.
