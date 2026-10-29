# StudyBeam — Site statique et authentification Supabase

StudyBeam propose une présentation publique, un espace de révision accessible sans compte et des pages d’authentification par e-mail. Le site fonctionne sans compilation et peut être hébergé sur GitHub Pages.

## Pages

| Page | Rôle |
| --- | --- |
| `index.html` | Landing page : présentation, activités disponibles, état des programmes et accès à la démonstration. |
| `app.html` | Espace de révision existant : cours, fiches, quiz, audio, chat de démonstration et référentiel. |
| `app.html#curriculum` | Accès direct au référentiel français 2026-2027. |
| `login.html` | Connexion par e-mail et mot de passe. |
| `signup.html` | Inscription et demande de confirmation d’adresse. |
| `forgot-password.html` | Demande de lien de récupération. |
| `reset-password.html` | Modification du mot de passe avec une session authentifiée. |
| `auth-callback.html` | Traitement du retour de confirmation d’e-mail. |

## Démarrer en local

```sh
cd /workspace/UNKNOW
python3 -m http.server 3000 --bind 127.0.0.1
```

Ouvrir le site dans un navigateur avec le serveur HTTP. Les fichiers ouverts directement en `file://` ne permettent pas de vérifier les parcours de session et de redirection.

L’application reste publique en démonstration : la connexion n’est pas une protection d’accès à des données privées. Les préférences et scores restent dans le stockage du navigateur, sans synchronisation par compte. Le chat reste une démonstration et aucune IA générative n’est connectée.

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
```

La suite comprend 30 tests Python et 2 tests JavaScript. Les tests navigateur utilisent Playwright Python et Chromium, disponibles dans l’environnement cloud, et démarrent leur propre serveur temporaire. Les tests d’authentification vérifient les contrats avec le SDK simulé, y compris sous un préfixe de déploiement ; ils ne prouvent pas l’acheminement des e-mails réels.

Les pages publiques et formulaires ont aussi été vérifiés avec le SDK réel, sur ordinateur et à 390 px de largeur, sans débordement ni erreur JavaScript sur ces parcours.

## Programmes français 2026-2027

L’intégration est partielle : trois chapitres de mathématiques au CP proposent des activités reliées aux sources officielles. Les autres références et calendriers recensés sont consultables, avec signalement des contenus manquants. Aucun programme complet n’est déclaré intégré.

Le [dossier du référentiel](curriculum/README.md) précise les sources, versions et limites. Le [rapport de couverture](curriculum/coverage.json) détaille les manques ; [CHANGEMENTS.md](CHANGEMENTS.md) suit les évolutions.

## Publication et ouverture aux élèves

Le workflow `.github/workflows/` prépare un déploiement GitHub Pages lors d’un push sur `main`. La version `739cb76` a été publiée avec succès le 29 octobre 2026 : https://sigroupeimmo4-ux.github.io/UNKNOW/. Les nouvelles versions sont déployées par ce workflow.

Le projet vise notamment des mineurs. Les règles de consentement et de confidentialité restent à définir avant l’ouverture publique des inscriptions aux élèves. Avant de stocker des profils ou résultats, créer les tables et leurs politiques Row Level Security et vérifier qu’un élève ne peut consulter ou modifier que ses propres données. La création des pages d’authentification ne réalise pas ces fonctions de base de données.
