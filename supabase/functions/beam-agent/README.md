# Beam : assistant propulsé par Claude

Edge Function Supabase (Deno) qui appelle l'API Messages d'Anthropic (SDK `@anthropic-ai/sdk`).
Déployée dans le projet Supabase `unknow`, avec vérification JWT activée.

## Secrets (côté serveur uniquement)
- `ANTHROPIC_API_KEY` : clé API Anthropic. Ne jamais l'ajouter aux fichiers publics ni au chat.
- `BEAM_ALLOWED_ORIGINS` : origines autorisées, séparées par des virgules (sans chemin).
- `BEAM_AI_MODEL` (optionnel) : modèle, `claude-opus-5-5` par défaut. `claude-sonnet-5-5` ou `claude-haiku-5-5` coûtent moins cher.
- `BEAM_DAILY_LIMIT` (30 par défaut) et `BEAM_GLOBAL_DAILY_LIMIT` (2000 par défaut) : quotas par jour (UTC).
Les variables `SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` sont injectées par Supabase.

## Base de données
`supabase/beam_usage.sql` crée la table `beam_usage` et la fonction `beam_register_use` (compteur atomique par utilisateur et global, accessible uniquement au rôle `service_role`).

## Comportement
Le client envoie `message`, un historique limité et `context` (classe, matière, chapitre). La fonction vérifie l'origine, la session (`/auth/v1/user`), le quota, puis appelle Claude avec l'outil `open_activity` (liste fermée de pages). Elle répond `{reply, actions}` ; le navigateur revalide les actions avant de les appliquer.
Une réponse refusée par les classificateurs de sécurité (`stop_reason: refusal`) renvoie un message neutre. Le repli serveur (`fallbacks: "default"`) est activé.

## Limites connues
Les réponses sont générées : elles peuvent contenir des erreurs. La fonction n'a pas accès au corpus officiel : elle ne doit pas être présentée comme alignée sur les programmes. Le chemin complet avec un compte connecté doit être testé par un utilisateur (création de compte non faite ici).
