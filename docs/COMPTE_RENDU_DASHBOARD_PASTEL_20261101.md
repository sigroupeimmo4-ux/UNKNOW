# StudyBeam — compte rendu refonte du tableau de bord
Date : 1er novembre 2026.

## Sauvegarde
- Sauvegarde préalable : backup-before-dashboard-redesign-20261101.
- Branche de travail : studybeam-dashboard-pastel-20261101.
- La refonte concerne le tableau de bord existant et conserve les pages métiers, les données et le dragon officiel.

## Fichiers
- app.html : accueil et parcours, objectif, indicateurs, reprises, Beam et notes séparées.
- dashboard-v2.js : données réelles, notifications de page, préférences.
- dashboard-v2.css : palette Pastel Dream et affichage mobile.
- dashboard.js : compatible avec la nouvelle reprise, historique préservé.
- planner-dashboard.js : actualise le tableau de bord après les objectifs.
- scripts/build_navigation_pages.py : navigation réelle conservée lors de la génération.
- tests/test_dashboard_v2.cjs : tests Node de non-régression.
- .github/workflows/deploy.yml : contrôle automatique au déploiement.

## Données réellement consultées
- Prénom : sw-display-name enregistré localement.
- Classe et voie : sw-school-profile (ou ancien sw-profile) uniquement si une sélection a été réellement enregistrée.
- Année scolaire : champ school_year du catalogue chargé.
- Historique récent : sw-learning-history, croisé avec les cours vérifiés du catalogue.
- Objectifs : studybeam-goals-v1 ; progression calculée comme objectifs cochés / objectifs enregistrés.
- Échéances : studybeam-calendar-v1 ; notifications visibles dans la page uniquement.
- Notes saisies manuellement : studybeam-grades-v1.
- Dernier quiz de démonstration : sw-last, séparé des notes scolaires.
- Préférences : sw-dashboard-accent-v1 et sw-dashboard-favorites-v1, locales à l'appareil.

## Limites actuelles
- Cours terminés : non suivi, donc « — » au lieu d'un nombre inventé.
- Chapitres révisés : consultation mesurée mais achèvement non suivi, donc « — ».
- Taux global de réussite aux quiz : non suivi, donc « — » ; dernier quiz de démonstration identifié séparément.
- IA générative : uniquement si une connexion serveur réelle est configurée. Aucun faux conseil IA.
- Le dragon 3D riggé n'est pas disponible : illustration officielle conservée.
- Les informations personnelles ne sont pas encore synchronisées avec les comptes.
- Les inscriptions de mineurs et les paiements ne sont pas ouverts.

## Vérifications
- python3 scripts/build_navigation_pages.py
- node tests/test_dashboard_v2.cjs
- python3 scripts/audit_site.py
- python3 scripts/build_navigation_pages.py --check
- Contrôle visuel et interactif mobile/desktop encore à confirmer.
