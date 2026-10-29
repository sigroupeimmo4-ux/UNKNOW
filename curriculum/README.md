# Référentiel français 2026-2027 — StudyBeam / StudyWink

## État vérifié le 29 octobre 2026

**Intégration partielle, non terminée.** Le réseau donne désormais accès au ministère et à Éduscol. Le refus 403 constaté lors de la première préparation n’est plus le blocage actuel.

| Élément | État |
| --- | --- |
| Périmètres classe/voie | 17 recensés, du CP à la Terminale |
| Entrées classe/matière/type/variante | 296 références identifiées, sans présumer leur exhaustivité |
| Références avec date d’application contrôlée | 72 |
| Sources archivées avec empreinte SHA-256 | 96, dont 21 PDF |
| Chapitres avec activités reliées à une source | 3, en mathématiques au CP |
| Formats de contenu associés | 21 : 7 formats par chapitre |
| Programmes entièrement intégrés | **0** |

Ces chiffres ne signifient pas que toutes les matières sont couvertes. Les entrées peuvent désigner un groupe de matières ou une même référence reprise dans plusieurs classes. L’inventaire détaillé des langues, séries, options et diplômes professionnels reste à compléter et à vérifier.

Le dépôt et l’interface portent encore le nom StudyWink. La demande utilise StudyBeam ; aucun changement de marque n’est appliqué dans ce chantier.

## Accès dans l’application

Depuis la landing page, cliquer sur **Explorer le référentiel**, ou depuis `app.html` sur **Programmes français 2026-2027**. Le parcours permet de choisir classe, voie, type d’enseignement, série technologique, matière, domaine et chapitre lorsque des contenus sont disponibles.

Les trois chapitres actuellement disponibles :

- CP → Commun → Mathématiques → Nombres, calcul et résolution de problèmes → Comprendre les dizaines et les unités.
- Même parcours → Comparer et ranger les nombres.
- Même parcours → Placer des nombres sur une droite graduée.

Chaque chapitre propose cours, fiche, quiz corrigé, exercices, auto-évaluation, transcription lue par le navigateur et explication guidée. L’explication est préparée et relue ; aucune IA générative n’est connectée. Le quiz du référentiel ne synchronise pas encore ses résultats avec un compte ou le score du quiz de démonstration.

Les autres sélections présentent les références identifiées et indiquent explicitement les dates ou contenus manquants. Aucune leçon de dérivation de démonstration n’est utilisée comme remplacement d’un cours officiel absent. Les activités historiques de l’accueil restent une démonstration distincte.

## Sources et version de référence

Points d’entrée consultés :

- https://www.education.gouv.fr/programmes-scolaires-41483
- https://eduscol.education.gouv.fr/4332/niveaux

Les tableaux Éduscol des cycles 2, 3 et 4 sont explicitement intitulés « à la rentrée de l’année scolaire 2026-2027 ». Ils distinguent les références par classe. Les pages du lycée identifient les enseignements communs, spécialités, options et séries ; leurs rubriques doivent être confrontées aux actualités et aux arrêtés, certaines listes présentant encore des références antérieures.

`sources/index.json`, `sources/lycee-index.json` et `sources/legal-index.json` conservent URL, date de consultation, SHA-256 et chemin de la copie consultée. Les HTML sont archivés avec l’extension `.html.txt` ; les PDF originaux et leurs extractions paginées sont conservés. Une extraction peut dégrader un tableau ou une formule : vérifier le PDF original pour une nouvelle utilisation pédagogique. Les téléchargements ayant échoué sont enregistrés séparément, sans fausse empreinte ni contenu inventé.

Les trois chapitres CP sont reliés à l’annexe 4 du programme de mathématiques du cycle 2 (BO n° 41 du 31 octobre 2024), pages 3–4, section « Cours préparatoire / Les nombres entiers ». Leur application depuis la rentrée 2025 est contrôlée à l’article 3 de l’arrêté du 22 octobre 2024, NOR MENE2415135A. Les connaissances reformulées et les chapitres éditoriaux sont distincts des intitulés et objectifs officiels.

## Calendrier vérifié : points sensibles

Les références des arrêtés et leurs extraits sont dans `sources/legal-index.json` et les arrêtés déjà référencés dans `sources/index.json`. Le registre `transitions` conserve les phases par classe.

| Réforme | Application vérifiée |
| --- | --- |
| Français et mathématiques du cycle 2 — MENE2415135A, article 3 | CP, CE1, CE2 : rentrée 2025 |
| Français et mathématiques du cycle 3 — MENE2504620A, article 3 | CM1 et 6e : 2025 ; CM2 : 2026 |
| Français et mathématiques du cycle 4 — MENE2602912A, article 3 | 5e : 2026 ; 4e : 2027 ; 3e : 2028 |
| EPS et histoire-géographie des cycles 2 et 3 — MENE2608631A, article 3 | CP et CM1 : 2026 ; CE1, CE2, CM2 et 6e : 2027 |
| Langues étrangères et régionales à l’école élémentaire — MENE2602911A, article 3 | CP et CM1 : 2026 ; CE1, CE2 et CM2 : 2027 |
| Langues étrangères au collège et lycée GT — MENE2504621A, article 4 | 6e et seconde GT : 2025 ; 5e, première GT et terminale GT : 2026 ; 4e : 2027 ; 3e : 2028 |
| Langues régionales au collège et lycée GT — MENE2602909A, article 4 | 6e, 5e et seconde GT : 2026 ; 4e et première GT : 2027 ; 3e et terminale GT : 2028 |
| Nouvelles mathématiques de seconde GT et première GT — BO du 2 avril 2026, arrêtés MENE2602914A, MENE2602916A, MENE2602917A, MENE2602918A, article 2 | Rentrée 2026, pour les enseignements désignés dans chaque texte |
| Nouvelles mathématiques de terminale : spécialité générale, option complémentaires, commun technologique — MENE2602919A, MENE2902920A, MENE2602921A, article 2 | Rentrée **2027**, donc pas les références à appliquer aux élèves de terminale en 2026-2027 |

Cette table n’est pas une liste exhaustive des réformes. Les sciences, l’EMC, l’EVAR/EVARS et les autres enseignements restent à vérifier intégralement. Ne pas extrapoler le calendrier d’une matière ou d’une langue à une autre.

Les dates ISO de rentrée sont normalisées au 1er septembre pour comparer les années scolaires ; elles ne fixent pas le jour de reprise des élèves. Le texte source reste la référence.

## Modèle de données et statuts

`catalogue.json` contient :

- `scopes` : classe, cycle, voie, matières et variantes, références et manques de couverture.
- `programs` : classe/matière/type/variante, version, source, référence juridique, période d’application, domaines, notions, connaissances et compétences.
- `contents` : chapitre, format, version du programme, objectifs, compétences visées, localisateurs dans la source et fichier de contenu.
- `transitions` : phases d’application vérifiées, par classe, avec article de référence.

`reference_status: identified` signifie qu’une référence est recensée mais que l’ensemble des dates et références nécessaires n’est pas confirmé. `reference_status: verified` signifie que les références et l’application en 2026-2027 ont été contrôlées ; cela ne valide pas tous les contenus du programme. `coverage_status: partial` désigne un sous-ensemble pédagogique ; `not_integrated` indique l’absence de contenus détaillés. Aucun programme n’a le statut `complete`.

Les contenus `review_status: verified` ont fait l’objet d’une comparaison avec les objectifs cités et d’une revue initiale des explications et corrections. Il ne s’agit pas d’une certification institutionnelle ni d’une revue indépendante par un enseignant. Les identifiants et versions restent liés à chaque activité.

Un titre de chapitre proposé par l’application est marqué `title_type: editorial` et relié à une section officielle. Ne pas le présenter comme un intitulé imposé par le ministère.

## Limites de couverture à résoudre

- Revue exhaustive de toutes les matières, langues et options de chaque classe.
- Domaines, notions, connaissances et compétences encore absents pour la majorité des références.
- Séries technologiques et leurs déclinaisons ; seconde spécifique STHR. STAV relève du ministère chargé de l’agriculture et nécessite une vérification dédiée.
- Référentiels et groupements selon chaque spécialité de baccalauréat professionnel. Les matières générales recensées ne sont pas automatiquement applicables à tous les diplômes.
- Le CAP, s’il est ajouté, doit disposer d’un périmètre dédié ; ses années ne sont pas assimilées à seconde/première/terminale.
- Production, correction et vérification des cours, fiches, exercices, évaluations et transcriptions pour le reste du périmètre.
- Connexion éventuelle d’un assistant IA à un corpus vérifié, avec sources et signalement des informations absentes. Un prompt seul ne remplace pas ce travail.

## Vérification et mises à jour

```sh
python3 scripts/audit_curriculum.py
python3 scripts/audit_curriculum.py --require-complete
python3 scripts/audit_curriculum.py --json > curriculum/coverage.json
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -v
node tests/test_curriculum_engine.cjs
```

Les tests navigateur démarrent leur propre serveur HTTP temporaire et nécessitent Playwright Python et Chromium, présents dans l’environnement cloud. L’application statique ne nécessite aucune nouvelle dépendance.

L’audit vérifie les empreintes des sources locales, les références, les dates, les identifiants, les versions, les compétences liées et les fichiers de contenu. Il exige tous les formats pour chaque chapitre déclaré et signale les programmes et inventaires incomplets. Le mode strict échoue **volontairement dans l’état actuel**. Le rapport `coverage.json` décrit les manques.

Lors d’une nouvelle publication officielle : conserver l’ancienne version, archiver le nouveau texte avec son empreinte, contrôler les phases par classe et variante, créer une nouvelle version et réexaminer tous les contenus liés. Ne pas remplacer silencieusement une empreinte ou appliquer un texte futur à l’année courante. Une transition en cours d’année nécessite des périodes explicites et une adaptation des contrôles, pas une modification arbitraire des dates.

Même lorsque les contrôles techniques passeront, une revue documentaire et pédagogique complète restera nécessaire avant de déclarer l’intégration terminée.
