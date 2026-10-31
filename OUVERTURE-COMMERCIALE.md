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
