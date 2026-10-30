# StudyBeam — Audit technique, fonctionnel et sécurité
**Date : 30 octobre 2026** · Dépôt : `sigroupeimmo4-ux/UNKNOW`

## Portée et méthode
Audit des sources publiques (HTML/CSS/JS, générateur, CI/déploiement, `curriculum/catalogue.json`, configuration Learning Pass), inspection du projet Supabase `yjhwlflbgywxepjhwssl`, analyseurs Supabase et historiques GitHub Actions. **Limite majeure :** l'ouverture directe des URL publiques via l'outil de vérification a échoué. Les interactions et rendus graphiques réels n'ont donc pas été vérifiés dans un navigateur. Ne pas assimiler un déploiement GitHub Actions « success » à un test utilisateur complet.

## Constats vérifiés

| Domaine | Constat | Gravité |
|---|---|---|
| GitHub Pages / 404 | `index.html`, `calendrier.html` et `mes-notes.html` existent dans `main` et les derniers workflows ont réussi. La disponibilité publique ne pouvait pas être confirmée via l'outil de consultation ; des 404 avaient été signalées par l'utilisateur. | P0 à vérifier en production |
| Tests / livraison | L'ancien CI validait surtout `node --check` et la régénération de pages ; aucune validation de liens locaux ou vérification HTTP post-publication. | P0 |
| Navigation | Le menu latéral utilisait des indices fixes `(0,7,11)` pour ses sections, erronés après l'ajout de calendrier/notes. | P1 |
| Beam | `beam-live.js` fournit un dragon procédural Three.js articulé, mais n'est pas un modèle GLB artistique complet. `assets/beam-rigged.glb` absent : le lecteur GLB tentait néanmoins un chargement avec risque de requête HTTP 404 à chaque affichage. | P1 |
| IA et voix | `agent-config.js` a un endpoint nul et **aucune Edge Function n'est déployée** dans le projet Supabase ; l'assistance IA reste inactive. Voix de démonstration = synthèse vocale locale, non visèmes précis. | P0 avant annonce commerciale IA |
| Vidéos | Deux tables publiques existent avec RLS, mais 0 vidéo et 0 entrée cache. Sans administration, aucune recommandation approuvée. | P1 |
| Calendrier et notes | `localStorage` uniquement, aucune liaison à un compte / synchronisation multi-appareils, et contenu potentiellement lisible par d'autres personnes utilisant le même navigateur. Rappels uniquement sur page ouverte. | P1 confidentialité/fonctionnalité |
| Programmes | `curriculum/catalogue.json` indique explicitement `status: partial` pour 2026–2027. Ne pas annoncer une couverture intégrale. | P1 contenu |
| Learning Pass | `data/learning-pass.json` : `status: proposed`, paiements désactivés et avantages/tarifs non validés. | P0 avant vente |
| Supabase / sécurité | Deux tables dans `public` avec RLS ; les politiques de modification utilisent `app_metadata.studybeam_role` et les visiteurs ne voient que `status='approved'`. Analyseur de sécurité : **0 alerte** au moment du contrôle. | Conforme sur cette portée |
| Supabase / performance | 3 avis non bloquants : FK `studybeam_videos.reviewed_by` sans index, index de recherche inutilisé (table vide), politiques SELECT permissives multiples. | P2 |
| Accessibilité / mobile | Des styles mobiles, libellés et préférences de mouvement existent ; pas de test complet lecteur d'écran, contraste ou clavier réalisé. | À tester |
| Dépendances | Imports frontend externes (Three.js / Supabase JS) ; aucune vérification d'intégrité complète de leurs ressources n'a été démontrée. | P2 |

**Références des avis Supabase :**
- [Clés étrangères non indexées](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)
- [Index inutilisés](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)
- [Politiques permissives multiples](https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies)

## Corrections apportées dans la branche `audit-corrections-20261030`
1. `scripts/audit_site.py` : contrôle automatisé des routes et fichiers utilisés, références dangereuses et existence des pages indispensables.
2. `.github/workflows/beam-ci.yml` et `deploy.yml` : exécution de cet audit après génération des pages ; contrôle HTTP explicite des pages critiques **après** le déploiement pour détecter les 404 publics.
3. `scripts/build_navigation_pages.py` : regroupement sémantique des rubriques au lieu d'indices fragiles ; rechargement de la navigation par version mise à jour.
4. `navigation.js`, `index.html` : suppression du chargement systématique du GLB inexistant ; le runtime Three.js procédural reste chargé, et le lecteur GLB demeure activable uniquement quand un vrai rig sera fourni.
5. `404.html` : page d'erreur utile avec liens vers les principales ressources.
6. `school-tools.js`, `school-tools.css`, `calendrier.html`, `mes-notes.html` : export JSON des données scolaires locales, effacement global après confirmation, information explicite concernant les appareils partagés, retour du compagnon Beam sur ces pages et cache navigateur actualisé.
7. Actualisation de la documentation de projet et de la présente passation.

## Vérifications à compléter
- Exécuter les workflows de la PR puis vérifier les résultats de l'audit des liens ; corriger tout fichier introuvable identifié.
- Après fusion, **vérifier le smoke test HTTP du déploiement**. En cas d'échec, contrôler `Settings → Pages → Source: GitHub Actions` et l'URL effective `https://sigroupeimmo4-ux.github.io/UNKNOW/`.
- Tests navigateur réels (375, 768, 1440 px) : clics, clavier, saisie/suppression/export du calendrier et des notes, prise de parole Beam, menu mobile, authentification réelle.
- Tests de sécurité approfondis avec comptes distincts : Auth, RLS en contexte utilisateur, accès administrateur, protection des mineurs, suppression des conversations.
- Revoir les CGU et la politique de confidentialité avec les informations juridiques vérifiées et un processus de contact réel.

## Décisions à ne pas prendre sans travail complémentaire
- Ne pas ajouter de faux prix, de paiement ou d'abonnement.
- Ne pas promettre une IA fonctionnelle, un véritable GLB studio ou une synchronisation de données sans les activer et les tester.
- Ne pas supprimer/modifier les tables utilisateurs ni lancer une migration de données prématurée.
- Les avertissements performance Supabase ne justifient pas à eux seuls une migration risquée sur des tables vides.

## Feuille de route recommandée
- **P0 :** prouver l'accessibilité HTTP publique et fiabiliser le déploiement ; tester connexion/inscription/récupération de mot de passe ; décider du périmètre IA/vidéos/payments avant commercialisation.
- **P1 :** synchronisation sécurisée des données élèves (RLS propriétaire), éditeur des notes, notifications opt-in, page d'administration vidéo alimentée ; parcours mineurs.
- **P2 :** tests navigateur/visuels automatisés et accessibilité WCAG, optimisation Three.js et mesurage des performances réelles, indexation/performance Supabase lorsque le volume le justifie.

**Ne pas déclarer cet audit entièrement validé côté utilisateurs** tant que les vérifications navigateur et les parcours Auth/Supabase ne sont pas réalisés.

## Validation après fusion — 30 octobre 2026
- Pull request de corrections : [#19](https://github.com/sigroupeimmo4-ux/UNKNOW/pull/19), fusionnée dans `main`.
- Contrôles automatiques de la PR : **réussite**, y compris `node --check`, génération + contrôle du générateur, analyse `scripts/audit_site.py` des liens et assets locaux.
- Publication GitHub Pages : **réussie**, run [41084707883](https://github.com/sigroupeimmo4-ux/UNKNOW/actions/runs/41084707883).
- Smoke tests HTTP GitHub Actions après déploiement : **réussite** pour `index.html`, `calendrier.html`, `mes-notes.html` et `beam-3d-apercu.html`. Cela atteste une réponse HTTP valide obtenue par le runner à ce moment, mais pas une validation de rendu sur les appareils des utilisateurs.
- Restent à valider : parcours utilisateurs en navigateur, authentification réelle, responsive 375/768/1440 px, interactions complètes, modèle GLB et IA non disponibles.
