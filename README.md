# StudyBeam — Site statique et authentification Supabase

StudyBeam propose une vitrine publique Pastel Dream, un espace de révision et des pages d’authentification par e-mail. Le catalogue scolaire est partiel, la plupart des outils restent utilisables en démonstration et l'assistant IA serveur n'est pas encore connecté. Le site fonctionne sans compilation et peut être hébergé sur GitHub Pages.

## Pages

| Page | Rôle |
| --- | --- |
| `index.html` | Landing page publique Pastel Dream avec le compagnon dragon Beam. |
| `calendrier.html` | Calendrier local, récurrence hebdomadaire, édition et export/import JSON validé. |
| `mes-notes.html` | Suivi et édition locale des notes, graphique, export/import JSON validé. |
| `beam-3d-apercu.html` | Information sur le futur modèle 3D ; l’ancien prototype géométrique rejeté n’est plus présenté comme le modèle final. |
| `app.html` | Espace de révision existant : activités disponibles selon le parcours, espace de démonstration, Beam et référentiel. |
| `programmes.html` | Référentiel français : niveau → classe → matière → chapitre, chaque étape avec sa propre URL. |
| `cours.html`, `fiches.html`, `audio.html`, `quiz.html` | Listes filtrables et activités individuelles avec `?lesson=identifiant`. |
| `ressource.html` | Exercices, évaluations et explications associés, avec `?kind=format&lesson=identifiant`. |
| `videos.html` | Filtres et recherche externe ; sélection vidéo encore à configurer. |
| `learning-pass.html` | Grille proposée Sénégal XOF / France EUR, mensuel et annuel ; paiements désactivés. |
| `a-propos.html` | Présentation des activités, FAQ et informations sur les données. |
| `app.html#tutor` | Chat Beam et raccourcis d’orientation. L’ancienne page `#dragon` est retirée (ancien lien redirigé vers Beam). |
| `login.html` | Connexion par e-mail et mot de passe. |
| `signup.html` | Inscription et demande de confirmation d’adresse. |
| `forgot-password.html` | Demande de lien de récupération. |
| `reset-password.html` | Modification du mot de passe avec une session authentifiée. |
| `auth-callback.html` | Traitement du retour de confirmation d’e-mail. |

## Vérifier le site avant publication

```sh
python3 scripts/build_navigation_pages.py
python3 scripts/audit_site.py
python3 scripts/build_navigation_pages.py --check
```

Le workflow GitHub Pages contrôle également les pages publiques essentielles après le déploiement. Le succès de ces tests techniques ne remplace pas une vérification visuelle en navigateur.

## Démarrer en local

```sh
cd /workspace/UNKNOW
python3 -m http.server 3000 --bind 127.0.0.1
```

Ouvrir le site dans un navigateur avec le serveur HTTP. Les fichiers ouverts directement en `file://` ne permettent pas de vérifier les parcours de session et de redirection.

L’application reste publique en démonstration : la connexion n’est pas une protection d’accès à des données privées. Les préférences, objectifs, notes, événements et scores restent dans le stockage du navigateur, sans synchronisation par compte. Les exports JSON des notes et du calendrier peuvent être réimportés localement, après validation et confirmation de remplacement. Les résultats affichés concernent uniquement le quiz de démonstration. Les cartes de l’accueil ouvrent les activités du référentiel lorsqu’elles existent ; les exemples historiques restent dans `app.html#demo`. Beam, le compagnon dragon, ouvre les activités avec ses raccourcis et commandes locales. Son service IA n’est pas encore connecté. Voir `supabase/functions/beam-agent/README.md` pour la préparation serveur et les étapes d’activation.

## Nouveautés utiles — 30 octobre 2026

- Beam propose une **aide guidée sans IA générative** pour les trois chapitres de mathématiques CP vérifiés : explications préparées, fiches, exercices et quiz. Le module `beam-study-guide.js` lit uniquement les JSON locaux approuvés ; `agent-config.js` reste à `null` pour l’IA serveur.
- La vidéothèque affiche trois liens externes Lumni / Réseau Canopé liés aux chapitres CP. Le site éditeur conserve l’hébergement de ses vidéos. Les liens et leurs métadonnées ont été vérifiés à partir des pages publiques, sans prétendre à une relecture intégrale par un enseignant.
- La création de comptes est encore réservée aux **tests adultes** ; la case à cocher est une simple déclaration, non une vérification de l’âge ni un consentement parental. Les comptes d’élèves mineurs ne sont pas encore ouverts.
- Les sauvegardes du calendrier et des notes restent locales ; pas de synchronisation Supabase. Aucun Learning Pass payant n’est actif. Consulte [les conditions avant lancement](docs/FINALISATION_AVANT_LANCEMENT.md).

## Authentification Supabase

`supabase-config.js` contient l’URL du projet et sa clé publique `publishable`. Cette clé est visible par conception dans un site web. Ne jamais utiliser une clé `service_role` ou un autre secret serveur dans le navigateur.

Le 29 octobre 2026, la lecture des paramètres du projet a confirmé que l’authentification par e-mail et les inscriptions sont activées et que la confirmation d’adresse est requise. La connexion à l’API avec des identifiants de test inexistants a renvoyé `400 invalid_credentials`, sans ouverture de session.

Le SDK JavaScript Supabase est chargé depuis jsDelivr et fixé à la version `2.118.0`. `auth.js` utilise PKCE, persiste la session via le SDK et traite les erreurs, les demandes simultanées, les liens invalides et les sessions expirées. La déconnexion utilise le scope `local`, pour le navigateur courant.

### URL de redirection à vérifier avant utilisation réelle

Dans Supabase → **Authentication → URL Configuration**, définir **Site URL** avec l’adresse réelle du site et autoriser les deux pages de retour. Pour le déploiement GitHub Pages attendu de ce dépôt, les valeurs sont :

```text
Site URL : https://sigroupeimmo4-ux.github.io/UNKNOW/
Redirect URL : https://sigroupeimmo4-ux.github.io/UNKNOW/auth-callback.html
Redirect URL : https://sigroupeimmo4-ux.github.io/UNKNOW/reset-password.html
```

Pour les essais locaux sur le port 3000 :

```text
http://127.0.0.1:3000/auth-callback.html
http://127.0.0.1:3000/reset-password.html
```

Ces valeurs sont des instructions de configuration, pas une preuve que le site est publié ou que les URL sont déjà autorisées. Les réglages administratifs de redirection ne sont pas lisibles avec la clé publique. Les chemins sont calculés relativement à la page courante et prennent en charge un préfixe de déploiement comme `/UNKNOW/`.

Ouvrir les liens de confirmation et de récupération dans le navigateur ayant effectué la demande : le vérificateur PKCE y est conservé. Un lien expiré ou ouvert dans un autre navigateur peut échouer ; l’interface propose de se connecter ou de demander un nouveau lien.

L’envoi et la réception réels des e-mails, les confirmations et la récupération avec un vrai compte restent à vérifier après configuration. Aucun compte réel n’a été créé et aucun e-mail n’a été envoyé pendant les tests automatisés. Les tests positifs des opérations utilisent un SDK simulé.

## Vérifications

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -v
node tests/test_curriculum_engine.cjs
python3 scripts/build_navigation_pages.py --check
```

La suite comprend 76 tests Python et 2 tests JavaScript. Les tests navigateur utilisent Playwright Python et Chromium, disponibles dans l’environnement cloud, et démarrent leur propre serveur temporaire. Les tests d’authentification vérifient les contrats avec le SDK simulé, y compris sous un préfixe de déploiement ; ils ne prouvent pas l’acheminement des e-mails réels.

Les pages publiques et formulaires ont aussi été vérifiés avec le SDK réel, sur ordinateur et à 390 px de largeur, sans débordement ni erreur JavaScript sur ces parcours.

## Programmes français 2026-2027

L’intégration est partielle : trois chapitres de mathématiques au CP proposent des activités reliées aux sources officielles. Les autres références et calendriers recensés sont consultables, avec signalement des contenus manquants. Aucun programme complet n’est déclaré intégré.

Le [dossier du référentiel](curriculum/README.md) précise les sources, versions et limites. Le [rapport de couverture](curriculum/coverage.json) détaille les manques ; [CHANGEMENTS.md](CHANGEMENTS.md) suit les évolutions.

## Publication et ouverture aux élèves

Le workflow `.github/workflows/` prépare un déploiement GitHub Pages lors d’un push sur `main`. La version `739cb76` a été publiée avec succès le 29 octobre 2026 : https://sigroupeimmo4-ux.github.io/UNKNOW/. Les nouvelles versions sont déployées par ce workflow.

Le projet vise notamment des mineurs. Les règles de consentement et de confidentialité restent à définir avant l’ouverture publique des inscriptions aux élèves. Avant de stocker des profils ou résultats, créer les tables et leurs politiques Row Level Security et vérifier qu’un élève ne peut consulter ou modifier que ses propres données. La création des pages d’authentification ne réalise pas ces fonctions de base de données.

## Mission 1 — Fondations

Le [rapport d’audit et de correction](docs/AUDIT_MISSION1.md) distingue les fonctions vérifiées, les démonstrations et les fonctionnalités encore incomplètes. L’accueil utilise le catalogue existant pour filtrer classe, voie, type, série et matière ; aucun programme n’a été inventé ni ajouté.

## Mission 1.5 — Navigation

Le [compte rendu](docs/COMPTE_RENDU_MISSION15.md) décrit les pages indépendantes, les URL des vues et les vérifications. Les contenus pédagogiques et données existants sont conservés. Les vidéos restent à configurer dans `data/videos.json`. La grille commerciale proposée du Learning Pass est centralisée dans `data/learning-pass.json`, avec paiements désactivés ; la lecture audio utilise la synthèse vocale du navigateur.

Pour régénérer les neuf pages et le menu partagé après un changement du gabarit : `python3 scripts/build_navigation_pages.py`. Le contrôle `--check`, aussi exécuté avant déploiement, signale un écart sans modifier les fichiers.

## Design — Modern & Compact

Le [rapport de refonte](docs/REFONTE_DESIGN_COMPACT.md) décrit l'historique de la barre latérale, la barre supérieure et le nouvel accueil. La route de déguisements `app.html#dragon` a depuis été retirée. Le logo et les ressources scolaires sont conservés. La reprise d’un cours utilise un historique local réel ; le prénom facultatif se règle dans les paramètres. Les anciennes données restent intactes.

## Learning Pass — Tarifs régionaux proposés

Choisir le pays de facturation sur `learning-pass.html` : Sénégal en XOF (2 500 FCFA/mois ou 25 000 FCFA/an), France en EUR (3,99 €/mois ou 39,90 €/an). StudyBeam Free reste gratuit. L’annuel économise deux mensualités. Aucun paiement n’est actif : avantages premium, conditions, taxes, prestataire et parcours parental restent à valider.

Le [dossier commercial](docs/TARIFICATION_LEARNING_PASS.md) explique les montants en unités entières, les états de validation et les prérequis de l’intégration future. Modifier puis publier le JSON central suffit pour changer la grille ; la page le recharge sans reconstruire son HTML.

## Consolidation de l’espace élève — 30 octobre 2026

Les contrôles de costume ne représentant pas de vrais déguisements ont été retirés des interfaces et de la navigation, sans supprimer les anciennes données des navigateurs. L’ancien lien `app.html#dragon` est redirigé dans l’application vers le chat Beam. Les raccourcis Beam privilégient les activités disponibles, le calendrier et les notes.

Les sauvegardes JSON du calendrier et des notes peuvent maintenant être restaurées : seuls les fichiers StudyBeam de la rubrique correspondante sont acceptés ; dates, horaires, notes, limites et identifiants sont validés avant une confirmation explicite du remplacement. Pour les révisions hebdomadaires, chaque occurrence peut être marquée terminée indépendamment des autres. Ces données ne passent pas par Supabase.

**Non finalisé** : véritable IA pédagogique (endpoint nul, aucune Edge Function), synchronisation sécurisée avec compte, parcours mineurs conforme, couverture complète du programme, vidéos vérifiées et paiements. La validation visuelle et fonctionnelle sur appareils réels et les essais d’inscription par e-mail restent indispensables avant ouverture aux élèves.
