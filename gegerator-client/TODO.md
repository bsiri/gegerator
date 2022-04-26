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
  Voir ce qu'on peut faire avec : https://github.com/angular/components/issues/5007#issuecomment-315645280

5. Préparer les pictos et styles pour les contraintes et 
  modifier les reducers etc pour intégrer tout ça dans le rendering
  d'une séance.

6. Panel récapitulatif des contraintes

7. Implémenter l'algorithme, integrer ça au rendu des films
  (à traiter comme une contrainte supplémentaire, ou peut-être
  assigner "Je veux voir ce film à cette séance précise" qui 
  est fonctionnellement équivalent ?)

  Se rappeler que les Autres Activités sont aussi des contraintes, 
  et que les contraintes sont cumulables 
  (eg je veux vraiment voir ce film + Pas à cette séance là).

  Une Autre Activité est une sorte de séance qui a une valeur 
  très très grande en gros.

8. Export de la feuille de route générée par l'algorithme
