# StudyBeam — critères d'ouverture commerciale

Statut au 31 octobre 2026 : **NON AUTORISÉE**. Ce fichier est un registre de mise en production, pas une approbation juridique, de sécurité ou de paiement.

## Contrôles techniques
- [ ] Audit statique GitHub Actions vert (`python check-site.py`) ; vérifier manuellement les liens injectés par JavaScript.
- [ ] Navigation et affichage testés sur mobile, tablette et ordinateur, y compris clavier et lecteur d'écran.
- [ ] Parcours de connexion, récupération de compte, déconnexion, suppression et export des données testés.
- [ ] Vérification de sécurité sur le backend : permissions par utilisateur, RLS, politiques de stockage, secrets jamais intégrés au JavaScript public.
- [ ] Journalisation d'erreurs, sauvegardes, procédure d'incident et restauration testées.
- [ ] Domaine, HTTPS, indexation, performances et disponibilité vérifiés.

## Obligations opérationnelles et juridiques
- [ ] Nom légal de l'exploitant, adresse, contact professionnel et enregistrement applicables complétés.
- [ ] CGU, CGV, politique de confidentialité, durée de conservation et droits utilisateurs validés selon les marchés desservis.
- [ ] Mesures de protection des mineurs, autorisations parentales adaptées, modération et signalements opérationnels **avant tout compte enfant**.
- [ ] Droits d'exploitation commerciale des contenus et médias vérifiés.
- [ ] Support client et traitement des plaintes, remboursements et suppressions de compte documentés.

## Paiements et abonnements
- [ ] Produits, prix TTC, devise, pays autorisés et fonctionnalités réellement livrées validés.
- [ ] Compte prestataire marchand vérifié ; intégration serveur sécurisée en place.
- [ ] Notifications de paiement signées vérifiées côté serveur ; gestion des doublons et erreurs.
- [ ] Essais de paiements, échecs, remboursements, annulations et renouvellements effectués en environnement de test.
- [ ] Droits premium contrôlés côté serveur ; aucune activation premium fondée sur le seul navigateur.
- [ ] Souscription activée uniquement après décision explicite de l'exploitant et validation de tous les contrôles.

## État fonctionnel actuellement déclaré par le site
- Démonstrations gratuites et certains contenus CP : disponibles.
- IA générative de Beam, catalogue complet, comptes élèves mineurs, synchronisation multi-appareils, facturation : non disponibles ou non déployés.
- Le site doit continuer à l'indiquer honnêtement. Ne pas modifier les messages de pré-lancement tant que les fonctions correspondantes ne sont pas réellement testées.

## Décision de lancement
Date : __________
Responsable : __________
Résultat des tests : __________
Validation juridique/protection des mineurs : __________
Validation paiement et facturation : __________
Décision écrite : **GO / NO GO** __________

**Règle :** aucune vente et aucune ouverture de comptes mineurs tant que les points bloquants correspondants ne sont pas fermés.


## Marchés ciblés : Sénégal ET France (31 octobre 2026)
Le site peut cibler les deux marchés mais cela ne prouve **pas** qu'une société est immatriculée dans les deux pays. Avant publication des CGV définitives, consigner la ou les entités vendeuses et leur pays d'établissement.

- **Sénégal** : vérifier les obligations de la loi n° 2008-08 sur les transactions électroniques, ainsi que la réglementation applicable aux données personnelles, la fiscalité et les obligations de l'éditeur local.
- **France / consommateurs français** : prévoir les mentions obligatoires, la présentation claire des offres et prix, CGV, modalités de résiliation, rétractation selon les règles applicables, et la conformité RGPD lorsque le traitement relève de son champ. Vérifier la fonctionnalité de rétractation en ligne applicable aux contrats conclus en ligne depuis juin 2026.
- **Mineurs** : ne pas autoriser les comptes d'enfants avant revue du consentement et des mesures de sécurité. En France, pour certains traitements basés sur le consentement liés aux services de la société de l'information, le seuil est de 15 ans ; en dessous, consentement conjoint applicable.
- **Paiement** : envisager un prestataire disponible dans le pays réel d'immatriculation et apte à facturer des clients dans les deux marchés. Ne promettre ni opérateur ni méthodes de paiement avant validation de l'éligibilité et des contrats.
- **Affichage** : prix et devise en euros / francs CFA selon l'offre et le marché, avec règles de taxe vérifiées. Ne jamais présenter une conversion indicative comme prix final contractuel.
- **Documents** : décrire le responsable de traitement réel, ses sous-traitants, les éventuels transferts transfrontaliers et un canal fonctionnel pour les demandes de données.

Sources de référence :
- https://www.vie-publique.sn/documents/8429/loi-n-2008-08-du-25-janvier-2008-sur-les-transactions-electroniques-au-senegal
- https://entreprendre.service-public.gouv.fr/vosdroits/F23455
- https://entreprendre.service-public.gouv.fr/vosdroits/F33527
- https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000037823135

**Décision manquante** : l'entreprise qui facturera est-elle juridiquement établie au Sénégal, en France, ou via deux entités distinctes ?


## Décision utilisateur du 31 octobre 2026 — entreprise non encore immatriculée
**Situation déclarée :** aucune entreprise actuellement immatriculée. **Marchés envisagés :** Sénégal et France. **Pays futur d'immatriculation : non décidé.** Ne pas présenter l'exploitant comme une société existante, ni inventer RCCM, NINEA, SIREN ou adresse.

### Feuille de route
1. Choisir le pays du siège social et la forme juridique selon les associés, la résidence et la fiscalité; un lancement sur deux marchés ne requiert pas automatiquement deux entreprises.
2. Si implantation sénégalaise : consulter le Bureau de Création d'Entreprise (BCE) de l'APIX pour la forme et les formalités pertinentes, notamment RCCM et NINEA. Source : https://investinsenegal.sn/services/creation-dentreprise/
3. Si implantation française : examiner le guichet unique de création d'entreprise et le registre approprié avant de publier les mentions légales définitives.
4. Pour les clients en France : vérifier la réglementation de vente à distance, les obligations de TVA selon la qualification exacte du service et le lieu d'établissement; le régime OSS non-UE peut être pertinent pour certains services. Sources : https://entreprendre.service-public.gouv.fr/vosdroits/F23455 ; https://www.impots.gouv.fr/professionnel/je-minscris-au-service-du-guichet-unique-de-tva
5. Mettre à jour les pages légales avec l'identité **réelle** après immatriculation et revue juridique. Tester les paiements et politiques de protection des mineurs avant lancement.

**Blocage impératif :** ne pas autoriser de ventes, facturation ni abonnement actif tant que l'entité vendeuse, les prix, les déclarations et le parcours de paiement ne sont pas opérationnels et validés.
