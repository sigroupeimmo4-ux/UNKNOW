# StudyBeam — Mission Beam interactif (première livraison)
Date : 30 octobre 2026

## Préservation et sauvegarde
- Branche : `mission-beam-interactif-20261030`
- Sauvegarde avant modification : `backup-before-beam-20261030`
- Logo officiel et fichier `assets/studybeam-logo.webp` inchangés.
- Aucun changement aux comptes Supabase, tarifs, contenus scolaires ou règles RLS.

## Fonctionnalités intégrées
- Panneau de conversation flottant à droite, fermeture avec bouton ou Échap, sans changer de page.
- Six suggestions pédagogiques qui remplissent le champ de saisie, sans simuler de réponse IA.
- Nouvelle conversation : vide l'historique de la session.
- Mode discret et respect de `prefers-reduced-motion`.
- Petite animation d'attente et animation de joie liée au score réel du **quiz de démonstration** uniquement.
- Aperçu graphique de tenues et accessoires décoratifs superposés à l'illustration officielle; sauvegarde locale, Annuler, Réinitialiser.
- Vérification de syntaxe JavaScript réussie (3 scripts) et workflow de contrôle en PR.

## À ne pas présenter comme terminé
- Le modèle IA n'est toujours pas connecté : `agent-config.js` a un endpoint `null`. La fonction serveur prévue existe, mais nécessite secrets, budget, limites de débit et déploiement contrôlé.
- Les effets décoratifs superposés ne sont PAS un vrai modèle 3D : aucun rig, sprite articulé ni recoloration anatomique du dragon. Le dépôt ne contient qu'un fichier raster du logo.
- Pas de marche, vol articulé, clignement, atterrissage ni expression faciale réelle.
- La page `Mon dragon` demeure une section `app.html#dragon`, pas encore une page HTML indépendante.
- L'historique du chat n'est gardé que tant que l'application et le panneau restent ouverts, conformément à la session client.
- Les réactions ne concernent que la démonstration, et jamais des scores inventés.

## Vérifications / limitations
- Syntaxe JavaScript : OK (contrôle de compilation sur beam-assistant.js, beam-customizer.js, demo.js).
- Tests de navigateur desktop/mobile et de régression : pas encore effectués.
- Workflow GitHub sur pull request : à examiner avant publication.
- Ne pas fusionner avant les contrôles visuels et fonctionnels.
