# StudyBeam — Mission 2 (préparation sur branche)

Cette PR propose des profils par compte et des historiques de chapitres ouverts, avec RLS owner-only et suppression en cascade du compte. **La migration SQL n'a pas été appliquée à la base active** ; l'application reste fonctionnelle en stockage local avant son déploiement.

## Validation avant fusion
- Appliquer la migration d'abord sur une base Supabase de staging, pas la production.
- Tester avec deux comptes distincts : aucun compte ne lit, modifie, ni supprime les données de l'autre (SELECT/INSERT/UPDATE/DELETE).
- Vérifier un compte déconnecté, une session expirée, une panne réseau et les données locales conservées.
- Vérifier la redirection e-mail, l'inscription et la connexion réelles ; ne pas créer de compte enfant sans politique de consentement.
- La progression mémorise les chapitres **ouverts**, et non une fin de chapitre ou une note de quiz ; les scores de démonstration restent locaux.
- La synchronisation fusionne 20 chapitres récents par date ; elle ne doit pas être présentée comme un suivi pédagogique complet.

## Confidentialité
Les identifiants utilisateur proviennent de Supabase Auth. Les politiques RLS filtrent avec auth.uid(), sans métadonnées utilisateur modifiables. Aucun secret de service n'est intégré au navigateur.
