# Beam — Direction artistique et critères d'acceptation du futur personnage 3D

30 octobre 2026 — changement de direction demandé par le propriétaire de StudyBeam après rejet du dragon WebGL procédural.

## Problème à résoudre
Le module `beam-live.js` actuellement développé assemble des sphères, cônes et éléments simples. Malgré ses animations, il ne ressemble ni au dragon de film d'animation souhaité ni à la référence utilisateur. **Ce prototype a été retiré de la production sans effacer son code**, pour éviter de montrer aux élèves une mascotte non validée.

## Référence visuelle à respecter
- Dragon bébé mignon et très expressif, **vert pomme**, yeux **marron** brillants.
- Sourire naturel et aimable, yeux larges avec paupières, petit museau, petites pattes.
- Crête et griffes violettes pastel, ventre crème, ailes bien dessinées, queue recourbée.
- Peau/écailles organiques finement texturées, formes sculptées douces et éclairage cohérent.
- **Aucun accessoire ni fiole dans les mains**. Silhouette identifiable même en petit.
- Référence de style fournie par l'utilisateur en conversation (dragon 3D de qualité film) ; ne pas confondre les images de maquettes montrant un décor UI avec un personnage 3D réel.

## Conditions pour mettre un nouveau modèle en production
1. Livrer un fichier de modèle **GLB/glTF** sculpté et riggé pour le Web, idéalement depuis Blender, avec squelette et morph targets du visage.
2. Prévoir des animations nommées et testables : `idle`, `blink`, `greet`, `think`, `listen`, `talk`, `happy`, `surprised`, `dance`, `fly`, `rest`.
3. Contrôler les formes de bouche en cours de parole (visèmes si supportés) et le contrôle de la voix (off par défaut).
4. Costumes et couleurs attachés aux bones/matériaux, non à une image flottant à côté.
5. Tester dans le chat flottant sur ordinateur/tablette/mobile, avec `prefers-reduced-motion`, faible puissance et WebGL indisponible.
6. Faire approuver **le visuel** avant de remplacer la mascotte de production. Aucun simple déplacement CSS ou personnage formé de primitives ne doit être présenté comme « qualité cinéma ».
7. Garder le bouton de discussion accessible au clavier et l'illustration officielle de secours si le chargement 3D échoue.

## État réel
- Le module `beam-3d.js` sait charger un GLB, mais aucun modèle artistique `assets/beam-rigged.glb` n'a été ajouté.
- Le service IA serveur Beam reste non déployé ; le chat ne doit pas simuler une réponse d'IA.
- Les maquettes générées dans la conversation sont des **concepts visuels statiques**, pas des modèles GLB.
- La restauration provisoire du dragon officiel préserve l'accès au chat ; elle ne remplit pas encore la mission de mascotte 3D.
