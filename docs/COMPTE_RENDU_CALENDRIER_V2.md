# StudyBeam — Amélioration du calendrier (version 2)

Date : 1er novembre 2026.

## Sauvegarde et périmètre
- Branche de sauvegarde créée avant intervention : `backup-before-calendar-upgrade-20261101`.
- Branche de développement : `studybeam-calendar-v2-20261101`.
- Page concernée : `calendrier.html` ; URL existante conservée, pas de route supplémentaire.
- Données pédagogiques, page de notes, comptes, offres et Beam **non modifiés**.
- La clé locale `studybeam-calendar-v1` ainsi que le format `studybeam-local-v1` des sauvegardes sont préservés. Pas de migration des données ni de synchronisation cloud.

## Fichiers modifiés
- `calendrier.html` : liaison du thème Dreamy Pastel, métadonnées, navigation active et accès clavier.
- `school-tools.js` : remplacement uniquement de `initCalendar()` pour améliorer le calendrier ; `initGrades()` et l'export/import existants restent inchangés.
- `calendar-v2.css` (nouveau) : styles isolés au calendrier, responsive et impression.
- `tests/test_calendar_v2.cjs` (nouveau) : analyse syntaxique, structure, récurrences, marquage terminé et protection de l'existant.
- `.github/workflows/deploy.yml` : lance le test dédié avant tout déploiement.

## Fonctionnalités
- Navigation Mois, Semaine et Liste fonctionnelle (précédent/suivant/Aujourd'hui).
- Accès direct à une date, sélection d'un jour, agenda détaillé et ajout rapide.
- Recherche par titre/matière/chapitre/description et filtre par catégorie.
- Compteurs des événements du mois, des 7 jours et des tâches du jour.
- Vue mobile avec jours compacts, points colorés et détail de la journée.
- Édition sécurisée (validation des champs, limite de 1 500 entrées), catégories et événements récurrents.
- Marquage d'une occurrence hebdomadaire sans terminer toute la série ; suppression explicite de la série entière.
- Rappels visibles uniquement à l'ouverture du calendrier ; **pas de notifications push, de SMS ni d'e-mails**.
- Export/import JSON existants conservés ; indication des risques d'usage sur appareil partagé.

## Contrôles
- Vérifications statiques et validation syntaxique JavaScript réalisées pendant l'intégration.
- Cas de récurrence hebdomadaire et validation des dates contrôlés séparément.
- Test automatisé Node ajouté à GitHub Actions.
- À confirmer en navigateur : interaction souris/clavier, écrans 390/768/1440 px, import/export sur une copie de données et fonctionnement du déploiement GitHub Pages.

## Limites connues
- Les événements sont conservés uniquement dans le navigateur et ne se synchronisent pas entre appareils.
- Les rappels s'affichent dans la page (lors du rendu) et ne s'exécutent pas quand le site est fermé.
- Les modifications d'une série récurrente s'appliquent à toute la série ; sa suppression retire toutes ses occurrences.
