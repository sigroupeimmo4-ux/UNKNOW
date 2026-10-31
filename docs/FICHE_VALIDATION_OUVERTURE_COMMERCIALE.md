# StudyBeam — Fiche de validation pour ouverture commerciale
**Préparé le 31 octobre 2026.** Dossier à compléter et signer par l'exploitant et ses conseils. Ne contient aucune identité, approbation ou vérification supposée.

## 1. Exploitant et marchés
| Champ | À compléter avec justificatif |
|---|---|
| Raison sociale ou nom légal | À fournir |
| Pays et adresse professionnelle complète | À fournir |
| Adresse e-mail de support commerciale | À fournir |
| Téléphone public | À fournir |
| RCCM / NINEA ou autre référence d’immatriculation applicable | À fournir |
| Statut fiscal, TVA et traitement du prix TTC | À confirmer par professionnel |
| Responsable des données personnelles et canal d'exercice des droits | À fournir |
| Marché de lancement initial : Sénégal, France ou les deux | Décision de l'exploitant |

**Contrôle :** mettre à jour les mentions légales et le fichier `data/commercial-status.json` uniquement une fois ces informations vérifiées ; ne jamais créer une fausse identité ou utiliser le nom GitHub comme preuve.

## 2. Produit réellement vendu
| Décision à documenter | Résultat attendu |
|---|---|
| Public acheteur : adultes uniquement ou responsables légaux | Règles d'éligibilité et contrôle du parcours |
| Services payants effectivement livrés | Liste précise et testée, distincte des ressources gratuites |
| Montant Sénégal mensuel / annuel | Prix final, taxes et dates d'application validés |
| Montant France mensuel / annuel | Prix final, taxes et dates d'application validés |
| Renouvellement automatique / résiliation | Informations précontractuelles et confirmation explicite |
| Rétractation, remboursements, preuve de la commande | Conditions rédigées et vérifiées |
| Accès après paiement / suspension / fin d'abonnement | Règles appliquées au serveur, pas seulement dans le navigateur |

Les montants affichés dans `data/learning-pass.json` sont **des propositions**, non une autorisation d'encaisser. Ne pas vendre une IA, des déguisements 3D ou un programme complet qui ne sont pas actifs.

## 3. Intégration de paiement — critères techniques obligatoires
- Choisir et contractualiser un prestataire marchand agréé/compatible avec chaque marché et moyen de paiement (cartes, mobile money selon contrat et disponibilité). Vérifier l'identité de l'exploitant dans le compte marchand.
- Créer le checkout **sur serveur authentifié**. Le serveur retrouve le prix de référence dans une configuration validée, jamais dans un montant arbitraire fourni par le navigateur.
- Utiliser une clé secrète stockée côté fournisseur / serveur, jamais dans GitHub Pages, le dépôt public ou le code client.
- Vérifier la signature des webhooks, leur protection contre le rejeu et l'idempotence ; ne délivrer aucun droit premium depuis la seule page « paiement réussi ».
- Associer la transaction au compte acheteur/adulte, conserver seulement les éléments nécessaires de facturation et offrir un reçu ainsi qu'une voie de support et de remboursement.
- Tester : paiement réussi, refus, annulation, double callback, webhook tardif, remboursement, renouvellement, fin d'abonnement, session expirée et compte d'un autre utilisateur.
- Ne basculer `payments.enabled` et `commercial_open` qu'après preuve de ces essais et de toutes les validations du contrôle `python3 scripts/audit_commercial.py --launch`.

## 4. Élèves mineurs et données personnelles
- Faire vérifier la base légale et le rôle de l'exploitant, ainsi que les formalités auprès de l'autorité compétente selon les marchés de lancement.
- Définir les catégories d'âge, le contrôle du titulaire adulte et le consentement/autorisation lorsqu'il est nécessaire ; **une case « je suis majeur » n'est pas une vérification d'âge**.
- Définir conservation, suppression, export, assistance et notification d'incident, notamment pour les données scolaires.
- Tester l'isolation Supabase : aucun utilisateur A ne doit lire ou modifier les données de B ; aucune table sensible ne doit être accessible à `anon`.
- Prévoir une politique de modération/sécurité particulière si l'IA générative devient accessible aux mineurs. Les questions d'élèves ne doivent pas être envoyées par défaut à un modèle externe sans cadrage.

## 5. Preuves de tests à déposer
| Test | Preuve requise |
|---|---|
| Connexion / e-mail / mot de passe / récupération | Journal de test réel sur deux comptes dédiés |
| Cloisonnement des données utilisateur | Requêtes autorisées/interdites documentées et contrôlées |
| Paiement complet et remboursement | Identifiants de transactions de test non sensibles et résultat du webhook |
| Commande et accès à la prestation payante | Capture ou journal attestant droit premium côté serveur |
| Mobile et accessibilité | Tests de navigation clavier/lecteur d'écran et tailles 375/768/1440 px |
| Relecture pédagogique | Liste de chapitres, version et validation de contenu |
| CGU, CGV, confidentialité et contact | Version datée et approuvée pour les marchés concernés |

## 6. Décision de publication
Tant que ces informations sont absentes, **maintenir le mode `prelaunch`, ne pas ouvrir les paiements, ne pas commercialiser les comptes enfants**. Les démonstrations gratuites restent disponibles.

Références utiles :
- Sénégal : [Loi n° 2008-08 sur les transactions électroniques](https://www.archives.sn/docs/lois/loi-n-2008-08-du-25-janvier-2008-sur-les-transactions-electroniques) et [loi n° 2008-12 de protection des données](https://www.cdp.sn/legislation/textes-legislatifs). Ces références ne remplacent pas une vérification professionnelle.
- Supabase : [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) et [sécurité de l'API](https://supabase.com/docs/guides/api/securing-your-api).

La validation juridique et marchande ne peut pas être présumée à partir d'un test automatisé.
