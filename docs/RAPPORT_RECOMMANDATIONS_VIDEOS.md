# StudyBeam — Mission recommandations vidéo
30 octobre 2026

## Livré
- Tables Supabase `studybeam_videos`, `studybeam_video_search_cache`, avec RLS et index par année scolaire, classe, voie, matière, chapitre, statut.
- Les visiteurs ne lisent que les entrées approuvées. Seuls les administrateurs désignés dans `auth.users.raw_app_meta_data.studybeam_role='admin'` modèrent.
- Page Vidéos : lecture de recommandations validées pour le chapitre sélectionné, statut vide explicite, liens externes HTTPS (pas de téléchargement).
- Page `video-admin.html` : ajout, examen, validation, refus, modification, suppression, signalement d'indisponibilité.
- Fonction serveur SOURCE `supabase/functions/video-discovery/index.ts` : recherche YouTube Data API admin uniquement, résultats placés en attente de vérification, cache 14 jours, aucune auto-publication.
- Beam ouvre la page de vidéos vérifiées au moyen d'une action rapide, sans inventer de recommandation.
- Sauvegarde GitHub `backup-before-videos-20261030`.

## Configuration restante
1. Fournir `YOUTUBE_DATA_API_KEY`, `VIDEO_ALLOWED_ORIGIN=https://sigroupeimmo4-ux.github.io`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` dans les secrets serveur.
2. Déployer la fonction `video-discovery` et en valider les quotas, la sécurité et le fonctionnement.
3. Attribuer le rôle administrateur côté serveur (`app_metadata` et non `user_metadata`) à un compte autorisé ; aucun rôle n'est attribué par cette livraison.
4. Vérifier pédagogiquement chaque suggestion. Les métadonnées YouTube ne prouvent pas l'exactitude d'une vidéo.
5. Enrichir recherche automatique périodique, vérification de liens, durée issue de l'API vidéos, gestion détaillée des critères qualité.
6. Intégration contextuelle avancée de Beam dans les cours et fiches via le service IA : non activée tant que Beam IA n'est pas connecté.

## Tests
- Contrôles de syntaxe JavaScript : `video-recommendations.js`, `video-admin.js`, `library.js`, `beam-assistant.js` : réussis.
- RLS : politiques présentes et consultées sur la base StudyBeam.
- Aucun enregistrement fictif ajouté à la base.
- Test de lecture/écriture utilisateur et tests visuels sur téléphone/ordinateur : non effectués.
- Recherche YouTube non lancée : pas de clé API configurée.
- Les nouvelles vidéos ne seront visibles qu'après insertion et validation.
