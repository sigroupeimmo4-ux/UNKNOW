# StudyWink — GitHub Pages + Supabase Auth

## Fonctionnalités disponibles

Le site est statique et adapté à GitHub Pages. Cours, fiche imprimable, quiz, audio navigateur, recherche YouTube, thèmes et préférences Wink sont locaux. Le chat reste en démonstration. L'inscription/connexion email via Supabase devient réelle après configuration ci-dessous. Aucun compte ni résultat d'élève n'est encore stocké dans la base.

## Publier via GitHub

1. Crée un dépôt GitHub nommé `studywink` (choisis privé ou public selon ton besoin).
2. Ajoute tous les fichiers de ce dossier à la racine du dépôt.
3. Dans **Settings → Pages**, sélectionne le déploiement depuis la branche `main`, dossier `/ (root)`.
4. Attends le lien fourni dans l'écran Pages, puis ouvre-le pour confirmer que le site est publié.

Git et GitHub CLI n'étaient pas disponibles dans l'environnement au moment de la préparation. Depuis un PC où Git est installé, les commandes sont :

```powershell
cd 'C:\Users\SIGROUPE\Desktop\TRAVAIL\STUDYWINK\capsavoir'
git init
git add .
git commit -m "Créer StudyWink MVP"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/studywink.git
git push -u origin main
```

Remplace `TON-COMPTE` par ton nom GitHub. Le fichier `.gitignore` exclut `.env`; n'ajoute jamais de jeton GitHub ni de clé serveur au dépôt.

## Configurer Supabase Auth

1. Crée un projet Supabase et ouvre **Project Settings → API**.
2. Dans `supabase-config.js`, renseigne l'URL du projet et la clé publique `publishable` ou `anon`.
3. N'utilise jamais la clé `service_role` dans le navigateur. La clé publique est visible par conception dans les sites web; protège les données avec RLS si tu ajoutes des tables.
4. Sous Supabase **Authentication → URL Configuration**, ajoute l'URL GitHub Pages exacte dans **Site URL** et **Redirect URLs**. Pour les tests, ajoute aussi `http://127.0.0.1:3000/**`.
5. Active l'inscription par email. Les confirmations email dépendent des réglages de ton projet Supabase.
6. Enregistre puis pousse le changement de configuration sur GitHub.

Le formulaire gère l'inscription, la connexion et la déconnexion. L'authentification n'est pas encore activée tant que le projet Supabase n'est pas configuré.

## Avant d'ouvrir aux élèves

StudyWink vise des mineurs. L'inscription publique ne doit pas être ouverte avant d'avoir décidé les règles de consentement et confidentialité applicables. Avant d'enregistrer des profils ou résultats, crée des tables avec politiques Row Level Security et vérifie qu'un élève ne peut lire/modifier que ses propres données. Les fonctions de profil, progression en base et espace admin restent à développer.

