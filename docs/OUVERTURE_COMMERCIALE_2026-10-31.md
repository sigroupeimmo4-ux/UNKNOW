# StudyBeam — Dossier de décision d’ouverture commerciale
**Préparé le 31 octobre 2026. Décision : NO-GO pour toute vente ou ouverture aux mineurs.**

Ce document est un outil d’exécution, pas une attestation de conformité ni un avis juridique. Le site gratuit de démonstration reste accessible.

## Ce qui est fonctionnel
- Hébergement GitHub Pages et navigation publique ; contenu de maths CP limité à trois chapitres vérifiés, activités et quiz.
- Beam en aide guidée non générative, pas de modèle IA serveur activé.
- Outils de calendrier, notes et objectifs en stockage local du navigateur ; export et import JSON.
- Liens externes Lumni ; leurs trois pages sont classées CE1 par Lumni, réutilisées comme compléments sur des notions de CP. Pas de relecture intégrale par enseignant.
- Prix Learning Pass uniquement envisagés : Sénégal 2 500 FCFA mensuel / 25 000 FCFA annuel ; France 3,99 € mensuel / 39,90 € annuel. **Aucun n'est approuvé comme montant TTC final et aucune vente n’est possible.**

## Dossier administratif et contractuel à fournir par l’exploitant
1. **Identification** : identité du vendeur ou société exploitante, forme légale, pays, adresse complète, téléphone et adresse de support, numéro RCCM/NINEA le cas échéant, immatriculation et fiscalité applicables. Ne pas substituer un nom de profil GitHub à une identité juridique.
2. **Marchés** : confirmer si l’ouverture vise le Sénégal uniquement ou aussi des clients en France/UE ; faire revoir la fiscalité, le droit de la consommation, les transferts de données et les droits des mineurs par un professionnel adapté.
3. **Offres** : décrire précisément les fonctionnalités payantes différentes de la version gratuite, prix TTC, durée, renouvellement, conditions de fin, rétractation et remboursement, SAV, réclamations et médiation si applicable. Les textes publics actuels sont **provisoires**.
4. **Paiement** : compte marchand validé auprès d'un fournisseur choisi, clés et webhooks stockés exclusivement en secrets serveur, contrat commercial signé, factures, procédures de fraude/remboursement et tests réel + échec + double notification. Aucune clé secrète côté GitHub Pages.
5. **Données/mineurs** : nom du responsable du traitement, contact dédié, bases légales, registre et formalités CDP applicables, durées de conservation, hébergement/transferts, exercice des droits, procédure de suppression et de sauvegarde. Pour l’UE/France, vérifier les règles RGPD, notamment le consentement pour les enfants de moins de 15 ans lorsque le traitement repose sur cette base. Le parcours parental doit être effectivement conçu et testé, pas simplement annoncé.
6. **Qualité pédagogique** : compléter les ressources promises ou commercialiser seulement le périmètre explicitement offert et relu, vérifier les réponses quiz et les droits des ressources externes.
7. **Tests de sécurité et UX** : deux comptes distincts pour prouver la séparation RLS des données, tests d'inscription/confirmation/récupération et suppression réelle, navigateurs/mobiles, contrôle écran et clavier, politique de sécurité incidents.
8. **IA** : si incluse dans l’offre, un fournisseur et des secrets serveur, une modération adaptée aux mineurs, quotas, budget, politique des conversations, évaluations pédagogiques et tests de confidentialité. La version actuelle de Beam n'est pas une IA générative.

## Contrôles techniques ajoutés au projet
- `data/commercial-status.json` : état public « prelaunch », aucune identité commerciale prétendue ni paiement actif.
- `scripts/audit_commercial.py` : contrôle automatisé exécuté en CI et avant déploiement ; un basculement prématuré vers le mode commercial fait échouer le contrôle.
- `python3 scripts/audit_commercial.py --launch` : commande de vérification de préparation à l'ouverture (échoue **normalement** tant que les champs restent non vérifiés).
- Quatre pages publiques préparatoires : `mentions-legales.html`, `conditions-utilisation.html`, `confidentialite.html`, `conditions-vente.html` ; tableau de transparence `statut-ouverture.html`.
- Tests mobiles automatisés Chromium en CI, sans créer de compte ni envoyer d'argent.

## Conditions d’une décision « GO »
- Identité vérifiée et coordonnées réelles sur les pages publiques.
- Validation juridique du service, politique de données et parcours parental si mineurs.
- Offre et facturation/checkout serveur réellement fonctionnels et testés (pas seulement un bouton).
- Contrôles de sécurité, UX et pédagogie documentés, et validation personnelle du responsable de l’exploitation.

### Sources officielles à faire examiner
- [Commission de Protection des Données Personnelles du Sénégal — textes législatifs](https://www.cdp.sn/legislation/textes-legislatifs) (loi 2008-12).
- [Loi sénégalaise n° 2008-08 sur les transactions électroniques](https://www.wipo.int/wipolex/fr/legislation/details/10283), notamment l'article 10 concernant les informations sur le vendeur.
- [Décret n° 2008-718 relatif au commerce électronique](https://senegalnumeriquesa.sn/sites/default/files/lois/De%CC%81cret_2008_718_Commerce_Electronique_Application_Loi_2008_08_Transactions_Electroniques.pdf), informations au consommateur et rétractation à confirmer selon le service.
- [CNIL : consentement, notamment des mineurs](https://www.cnil.fr/fr/les-bases-legales/consentement) pour tout ciblage France.
- [Supabase : Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
