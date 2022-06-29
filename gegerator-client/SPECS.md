============== TODO 2.0 ====================

1. Routeur et barre de navigation

La barre de navigation permet d'accéder aux espaces suivants :
 
- Films
- Grille
- Résumé

Il propose en plus le bouton charger/sauver de l'AppState.


2. Page Films

La page Films est juste une table qui propose comme colonnes :

- Titre 
- Durée
- Notation

Elle doit proposer le tri et le filtre. Pas the pagination 
nécessaire pour l'instant.

Niveau UX, la saisie doit être rapide comme sur une feuille 
Excel. Quelques idées pour arriver à ce résultats :

- suport de Tab et Shift-Tab
- Tab doit créer automatiquement une nouvelle ligne si la ligne
  en cours d'édition est la dernière
- navigation avec les flèches du clavier possible

Niveau icônes, peut-être remplacer les icônes par des étoiles ? 

Une cellule a deux mode de fonctionnement : Affichage et Edition.
Une cellule passe en mode Edition quand elle est accédée et passe
en mode Affichage quand elle est quittée. Lorsque la cellule est
quittée, la modification n'est sauvegardée que si elle est
valide. 

TODO : trouver un mécanisme pour afficher les erreurs de validation.


3. Page Grille

La page Grille est la grille de film d'avant, mais en plus 
compacte de sorte de pouvoir repérer d'un seul coup d'oeil toute
la grille pour au moins une journée, et si possible plusieurs. 

Cela veux dire que les swimlane-items doivent être revus pour
être plus compacts aussi.

Elle présente des boutons "Créer Séance" et "Créer un événement"
qui invoqueront les Dialogues de création idoines. Ces Dialogues 
pourront aussi être appelés via une touche raccourcie, indiquée
clairement sur les boutons.


4. Dialogue Edition des Séances / Evenements.

Comme avant le dialogue est utilisé soit pour créer, soit pour 
éditer. Les raccourcis mentionnés ci-dessus appellent le dialogue 
en mode Création. Un double-click sur un swimlane-item appelle 
le dialogue en mode Edition.

La création d'events doit être aussi fluide que possible, pour 
cela on mettra l'accent sur un meilleur enchaînement des champs 
et l'usage de raccourcis claviers.

Pour les Séances, le Dialogue montre les champs suivants :
- Jour
- Cinéma
- Titre Film
- Heure début

Pour les autres événements, les champs sont:
- Jour
- Description
- Heure début
- Heure fin

Quand le Dialogue est ouvert en mode Création, la valeur des
champs Jour et Cinéma seront les mêmes que lors de sa dernière
fermeture. Cependant le premier champ sera bien sélectionné
(tab-order normal en gros).

La validation est la même que d'habitude : ce Dialogue peut être
largement récupéré de l'existant.

Niveau UX :
- le Titre du Film est un champ plain text + autocomplete, qui 
  par défaut ne montre rien et ne s'active que si un film commence 
  a être saisi
- Le raccourci pour OK est la touche Entrée, et n'est activé que si 
  l'événement est valide (normal donc)
- Le raccourci pour Annuler est Echap.


4. Page Résumé

TODO : specs
