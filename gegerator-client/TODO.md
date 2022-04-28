1. CRUD pour les Autres Activités
==> Done

2. Sauver et restaurer un state complet
==> Done

3. Modéliser les contraintes:
a - appréciation film:
- Je veux vraiment voir ce film
- Je veux voir ce film si on a le temps
- Je veux bien voir ce film si on a rien d'autres à faire (défault)
- Je ne veux jamais voir ce film

b - appréciation séance
- Je veux voir ce film à cette séance précise
- Pas à cette séance là
- Laisser l'algorithme décider (défaut)
==> Done

4. Menu click-droit pour éditer les contraintes depuis les 
  sessions
==> Done

5. Préparer les pictos et styles pour les contraintes et 
  modifier les reducers etc pour intégrer tout ça dans le rendering
  d'une séance.
==> Done

6. Panel récapitulatif des contraintes.
  Les liens des contraintes, quand ça a du sens, doivent
  être cliquables, et alors la vue doit scroller jusqu'à
  l'item correspondant.


7. Implémenter l'algorithme, integrer ça au rendu des films
  (à traiter comme une contrainte supplémentaire, ou peut-être
  assigner "Je veux voir ce film à cette séance précise" qui 
  est fonctionnellement équivalent ?)

  Se rappeler que les Autres Activités sont aussi des contraintes, 
  et que les contraintes sont cumulables 
  (eg je veux vraiment voir ce film + Pas à cette séance là).

  Une Autre Activité est une sorte de séance qui a une valeur 
  très très grande en gros.

8. Barre d'outils : 
- charger/sauver dans un bouton menu
- bouton 'afficher/masquer les suggestions de l'algorithme'
- boutonmenu Export: 
  * Exporter les suggestions de l'algorithme
  * Exporter les sélections manuelles

9. Ajouter des tests jasmine/protractor,
  
10. Finitions:
- packager l'appli,
- écrire la doc,
- au démarrage faire un petit message console pour dire 
- quand c'est prêt.


## Features à envisager

- Quand on sélectionne une séance comme 'mandatory', 
  toutes les autres sont automatiquement à 'never'.
  Il s'ensuit que si au moins une repasse à 'default', 
  toutes les autres repassent à 'default.

- Quand on place une OtherActivity, toutes les sessions
  qui chevauchent temporellement sont à 'never'. 
  Penser que cela doit se combiner avec la feature du 
  dessus.

- Une barre de filtre (position statique) pour n'afficher
  que les films choisis.

- Ajouter au boutonmenu Export : Exporter

