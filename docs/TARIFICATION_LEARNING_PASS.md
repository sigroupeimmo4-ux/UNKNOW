# StudyBeam Learning Pass — Grille commerciale proposée

Mise en place le 30 octobre 2026, sur la branche `learning-pass-regional-pricing`, depuis `350f1e3`. Source des montants : grille transmise par le porteur du projet. Il s’agit d’une proposition commerciale, sans activation des paiements.

## Tarifs affichés

| Pays de facturation | Devise | StudyBeam Free | Mensuel | Annuel | Économie annuelle sur 12 mensualités |
| --- | --- | --- | --- | --- | --- |
| Sénégal | XOF | Gratuit | 2 500 FCFA / mois | 25 000 FCFA / an | 5 000 FCFA, soit deux mois, comparé à 30 000 FCFA |
| France | EUR | Gratuit | 3,99 € / mois | 39,90 € / an | 7,98 €, soit deux mois, comparé à 47,88 € |

Le pays est choisi explicitement, sans détection géographique ni devise déduite du navigateur. Les liens directs `learning-pass.html?country=SN` et `learning-pass.html?country=FR` conservent ce choix au rechargement et avec précédent/suivant. Un pays inconnu n’affiche pas les prix d’un autre marché.

L’annuel est mis en évidence. La différence avec douze mensualités est calculée en unités monétaires entières. Le libellé « 2 mois économisés » n’apparaît que lorsque la différence correspond effectivement à deux mensualités. Il n’y a ni conversion de devises ni taux de change.

## Configuration centralisée

Le fichier `data/learning-pass.json` contient la version de la grille, les marchés, les formules, les prix, les textes commerciaux et les conditions provisoires. La page le charge avec `cache: no-store`. Modifier cette configuration puis la publier suffit ; aucun tarif n’est inscrit dans le HTML et aucune reconstruction des pages n’est nécessaire.

Les montants sont des entiers `amount_minor` : XOF sans décimale (`2500`, `25000`) ; EUR en centimes (`399`, `3990`). La devise, son unité et le montant sont vérifiés avant présentation. Un tarif invalide ou manquant n’est pas remplacé par une valeur inventée.

Les formules possèdent des identifiants stables : `free`, `monthly`, `annual`, avec intervalles `null`, `month`, `year`. Les avantages premium ne sont pas définis dans la demande : l’interface le signale. Les ressources gratuites existantes restent accessibles sans abonnement et ne sont pas placées derrière un accès payant.

Le renouvellement, la résiliation et les taxes n’étant pas validés, leurs conditions sont indiquées comme à confirmer. Aucun renouvellement automatique, remboursement, délai de résiliation, montant TTC ou supplément fiscal n’est inventé.

## Paiements et mineurs

- `payments.enabled` reste `false`, sans prestataire configuré.
- Les validations des prix, conditions commerciales, taxes, prestataire, avantages premium et parcours parental restent toutes `false`.
- Les deux boutons de souscription payante sont désactivés. Même une modification isolée de ces indicateurs dans le JSON ne peut pas lancer un paiement : ce client ne contient aucune intégration de paiement ni transaction simulée.
- Aucun formulaire bancaire, iframe de paiement, collecte de numéro de carte, création d’abonnement ni appel de paiement n’est ajouté.
- La page précise que les abonnements payants des mineurs devront suivre un parcours adapté avec intervention du parent ou représentant légal lorsque nécessaire. Aucune case de consentement ne prétend aujourd’hui réaliser ce parcours, qui reste à intégrer avant ouverture.

Lors d’une future intégration autorisée, le serveur devra utiliser cette grille comme référence unique et résoudre le marché et la formule sans accepter un montant fourni par le navigateur. Il devra présenter une offre finale avec montant, devise, période, taxes et conditions, puis créer le paiement avec exactement ce montant accepté. En cas de changement de grille, présenter à nouveau le prix avant confirmation. Un prestataire ne devra jamais appliquer une conversion automatique à la place des prix régionaux annoncés.

Le contrôle serveur du parcours parental, les modalités commerciales validées, les fonctionnalités premium réellement disponibles, les sessions de paiement et les notifications du prestataire restent hors de cette livraison. Aucun service de paiement n’a été choisi ou activé.

## Fichiers et préservation

- `data/learning-pass.json` : grille régionale, formules, conditions et état non activé.
- `library.js` : sélection du pays, prix, économie annuelle, comparatif et mentions.
- `design.css` : présentation compacte des offres et mise en avant de l’annuel.
- `scripts/build_navigation_pages.py` et pages HTML : versions des ressources renouvelées pour le cache ; gabarits conservés.
- `tests/test_pricing.py` et `tests/test_navigation.py` : vérifications de la grille, des URL et de l’absence de paiement.

Le logo, le dragon, les programmes, les leçons, les données utilisateur, les réglages Supabase et le code d’authentification restent inchangés. Aucun compte ni e-mail n’est créé pendant les tests.

## Vérifications

Les tests supplémentaires couvrent les montants et centimes exacts, les économies, le pays initial non déduit, les liens directs, le rechargement, l’historique, les configurations modifiées ou invalides, le maintien des paiements désactivés et l’affichage des deux marchés à 320, 390, 768 et 1440 px avec du texte agrandi. Des captures Sénégal/France sur ordinateur et France sur téléphone sont également inspectées.

76 tests Python et 2 tests JavaScript réussis. 611 liens/ressources locaux et 156 ancres vérifiés. Les tests ne constituent pas une validation juridique, fiscale ou une homologation d’un prestataire de paiement.
