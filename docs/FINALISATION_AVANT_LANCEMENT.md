# StudyBeam — Ce qui est effectivement prêt avant ouverture aux élèves
Date du contrôle : 30 octobre 2026. Projet : sigroupeimmo4-ux/UNKNOW.

## État livré et testé sur le code
- Les trois chapitres CP vérifiés restent accessibles (dizaines/unité, comparaisons, droite graduée).
- Beam propose une **aide guidée préparée** pour ces chapitres. Les réponses proviennent exclusivement de `curriculum/lessons/cp-*.json` et ne sont **pas** des générations d'une IA. La question reste sur l'appareil et aucun fournisseur IA n'est appelé.
- Trois liens vidéo Lumni / Réseau Canopé correspondent aux chapitres de mathématiques CP. L'éditeur reste l'hébergeur ; nous ne reproduisons ni la vidéo ni son lecteur. Les URLs, titres et descriptions publics ont été vérifiés au 30/10/2026. **Pas de visionnage intégral ou validation par un enseignant**.
- Calendrier, notes, objectifs, sauvegardes JSON locales et révisions hebdomadaires restent accessibles sans collecte de données scolaires sur un serveur.
- Inscription en mode expérimental : déclaration explicite réservée aux adultes testeurs. **Il ne s'agit pas d'une vraie vérification de majorité et ne vaut pas consentement parental.**

## Dépendances externes bloquantes
1. **IA générative : non activée.** `agent-config.js` pointe toujours sur `null`. Avant de publier une fonction IA : sélectionner le modèle, fournir `BEAM_AI_API_KEY`, définir quotas, filtrage adapté aux mineurs, politique d'enregistrement des questions, supervision humaine, budget et contrat. Test de sécurité du service et de son accès requis. Ne jamais mettre de clé privée dans les JS du site.
2. **Comptes des mineurs / consentement : non ouverts.** Fixer la qualité du responsable de traitement et son contact légal, les pays de déploiement, les durées de conservation et droits d'accès/suppression. Concevoir une vérification parentale lorsque nécessaire, et tester les e-mails et liens de récupération avec deux vrais comptes avant d'inviter des enfants.
3. **Synchronisation scolaire : non activée.** Prévoir un schéma propriétaire par `user_id` sur Supabase avec RLS pour SELECT/INSERT/UPDATE/DELETE, interdiction `anon`, limites de taille, règles de conservation et tests de non-accès croisé avec **deux comptes indépendants**, puis consentement et migration opt-in. Aucune donnée actuelle n'est transférée silencieusement.
4. **Paiement Learning Pass : désactivé.** Le catalogue `data/learning-pass.json` a `payments.enabled = false`, `status = proposed`. Il faut valider les tarifs commerciaux, CGV/CGU, impôts, remboursement, résiliation, prestataire marchand et parcours responsable légal. Créer un checkout uniquement côté serveur + webhooks avec vérification des signatures, jamais avec une clé secrète dans GitHub Pages.
5. **Catalogue CP–Terminale : partiel.** Les autres niveaux exigent une rédaction, attribution de sources officielles en vigueur, relecture pédagogique et tests de quiz/corrections avant publication. Ne pas prétendre à une couverture intégrale.
6. **QA en navigateur réel : non acquittée.** Tester 375/768/1440px, création/connexion/récupération adulte, lecteur d’écran, clavier, sauvegarde import/export, liens vidéo, filtrage du catalogue et bonne lecture des leçons sur Chrome, Safari/Firefox. Les smoke tests HTTP ne prouvent pas ces interactions.

## Critères d'ouverture
N’ouvrir les comptes d’élèves, l’IA générative ou les abonnements **qu'après** signature des conditions/contrats nécessaires, tests de sécurité RLS et contrôles de confidentialité (mineurs inclus). La plateforme peut continuer à servir des démonstrations sans compte et les ressources réellement disponibles.

## Sources de trois liens vidéo
- https://www.lumni.fr/video/decomposer-les-nombres-de-10-a-99-les-fondamentaux
- https://www.lumni.fr/video/comparer-deux-nombres-a-deux-chiffres-les-fondamentaux
- https://www.lumni.fr/video/placer-un-nombre-de-10-a-99-sur-la-droite-graduee-les-fondamentaux

Références Supabase pour un futur schéma sécurisé :
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/api/securing-your-api
