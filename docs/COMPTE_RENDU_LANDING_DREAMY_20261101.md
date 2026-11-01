# StudyBeam — compte rendu de la landing Dreamy Pastel

Date : 1er novembre 2026. Dépôt : `sigroupeimmo4-ux/UNKNOW`.

## Préservation / sauvegarde
- Branche de sauvegarde : `backup-before-dreamy-pastel-20261101`, créée depuis `main` **avant tout changement**.
- Branche de travail : `studybeam-dreamy-pastel-20261101`.
- Les anciennes pages, le tableau de bord, le référentiel, l'authentification, les tarifs et les ressources pédagogiques **ne sont pas modifiés**.
- La mascotte utilise toujours le fichier officiel existant `assets/studybeam-logo.webp`. Aucun modèle 3D ou déguisement non validé n'a été inventé.

## Fichiers
- `index.html` : navigation par vraies pages, hero, CTA, présentation Beam, badges, offres et footer.
- `landing-dreamy.css` (nouveau) : palette Dreamy Pastel et adaptations desktop/tablette/mobile isolées de l'application.
- `fonctionnalites.html` (nouveau) : page autonome qui renvoie vers les outils réels.
- `contact.html` (nouveau) : destination publique sans inventer un e-mail ou formulaire ; le canal officiel reste à ouvrir.
- `tests/test_dreamy_landing.py` (nouveau) : contrôles automatisés des routes, contenus et protections.
- `.github/workflows/deploy.yml` : exécute les tests Dreamy avant publication et vérifie les deux nouvelles URL après déploiement.

## Routes principales
| Label | Destination |
| --- | --- |
| Découvrir | `a-propos.html` |
| Programmes | `programmes.html` |
| Fonctionnalités | `fonctionnalites.html` |
| Tarifs et Learning Pass | `learning-pass.html` |
| Se connecter | `login.html` |
| Créer mon compte | `signup.html` |
| Contact | `contact.html` |
| Cours / Fiches / Audio / Quiz / Vidéos | pages respectives existantes |

Tous les chemins sont relatifs pour fonctionner sous le sous-dossier GitHub Pages `/UNKNOW/`.

## Vérifications et limites
- Vérifier les destinations et le comptage des cinq cartes ; vérifier la palette et les règles mobile.
- Exécuter `python3 -m unittest discover -s tests -v`, `python3 scripts/audit_site.py` et `python3 scripts/build_navigation_pages.py --check`.
- Effectuer un contrôle visuel manuel de l'accueil aux largeurs 390, 768 et 1440 px et suivre la connexion/test adulte.
- Les comptes mineurs, le paiement, la personnalisation du dragon et l'IA générative restent non ouverts ou non opérationnels ; la nouvelle landing l'indique clairement.
- La grille Learning Pass reste dans `data/learning-pass.json` et demeure **proposée, non validée** ; aucun prix n'est affiché comme une offre active.
