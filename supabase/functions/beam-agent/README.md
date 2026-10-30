# Beam : connexion IA à effectuer ultérieurement

Cette fonction est un point de départ serveur, **non déployé et non connecté**. Elle utilise l’API OpenAI Chat Completions comme fournisseur proposé ; le fournisseur et le modèle restent à choisir et à configurer.

Avant activation :

1. Définir les secrets de la fonction `BEAM_AI_API_KEY`, `BEAM_AI_MODEL` et `BEAM_ALLOWED_ORIGIN` (pour le site actuel : `https://sigroupeimmo4-ux.github.io`, sans chemin). Ne jamais ajouter une clé IA aux fichiers publics ou au chat.
2. Vérifier la disponibilité du modèle choisi et définir quotas utilisateur, limites de débit et budget avant une ouverture publique. Ces contrôles de consommation ne sont pas encore implémentés.
3. Déployer `beam-agent` dans le projet Supabase existant, avec vérification JWT activée. La fonction revérifie aussi la session via `/auth/v1/user`. Elle emploie les variables Supabase injectées côté fonction ; aucune clé `service_role` n’est nécessaire.
4. Remplacer `null` dans `agent-config.js` par l’URL HTTPS de la fonction déployée, sur le même projet Supabase, puis republier le site.
5. Tester avec un compte : réponse réelle, action autorisée, session expirée, CORS, erreur et coût. Le code serveur n’a pas été exécuté ni validé dans un runtime Deno pendant cette préparation.

Le client envoie message, historique limité et classe/matière/chapitre. Les réponses contiennent `reply` et `actions` (au plus trois actions `open_activity`). Le navigateur vérifie les actions avant de les appliquer ; aucune URL ou instruction JavaScript libre n’est exécutée. Les actions ouvrent uniquement des vues publiques de révision ; elles ne modifient pas de données privées.

Le corpus officiel n’est pas encore récupéré par cette fonction. Elle ne doit donc pas se présenter comme un assistant intégralement aligné sur les programmes. Une récupération de passages vérifiés et leurs citations reste à développer avant cette affirmation.

Sans endpoint configuré, Beam ne génère aucune réponse IA : seuls ses raccourcis et commandes de navigation locales fonctionnent. Cette préparation ne constitue pas une connexion effective à un modèle.
