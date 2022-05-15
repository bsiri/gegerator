================= V1 ============================
0. (trucs déjà implémentés)

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

  Note : faire un panneau à trois onglets, avec une table 
  triable/filtrable/pagineable par onglet ?
==> Done

7. RG additionnelles sur les sessions:

- Quand une séance passe à Mandatory, s'il y a lieu l'autre
  séance Mandatory pour le même film passe à Default.

- Quand une séance passe à Mandatory, les autres séances 
  pour le même film auront un rendu 'disabled' dans l'interface, 
  sans toucher pour autant à leur valeur réelle de Rating.

- Si une séance est à Mandatory, alors cette séance sera 
  rappelée et linkée dans l'onglet "Films" du panel Résumé.

==> Done

8. Premier lot remarques Thomas :
- Retravailler la barre de recherche, qu'on confond trop 
  souvent avec un outil de création de film.
- Permettre d'évaluer les Autres Activités tout comme 
  le sont les sessions.
- Retirer "Avis Film" de l'écran Session, et ne le permettre 
  que dans l'onglet films.
- N'utiliser que 'h' pour les Times et les Duration

==> Done

9. Click droit sur Movie:
- montrer Ratings, 
- montrer aussi a liste des sessions possibles, 
  par ordre chronologigue, et avec le picto associé

==> Done

10. Barre d'outils :
- charger/sauver dans un bouton menu
- export de la Roadmap dans un bouton menu

==> Done 

==> V1 Done

================= V2 ============================

1. Bouton menu "Mode"
- manuel (c'est l'existant)

2. Objet WizardConfiguration qui permet de:
- attribuer un Rank aux cinémas
- attribuer un ratio de préférence entre la valeur d'un cinéma et la
  valeur d'un film (default : neutre à 50%)
- inclure cet objet dans les download/upload de AppState

3. Configuration de l'assistant: 
- un dialog qui permet de configurer et uploader l'objet ci-dessus.
- un bouton "Configuration de l'assistant..." dans le menu "Mode"

4. Implémenter l'algorithme de l'assistant. Touver une formule pour
évaluer une session compte tenu du score  du film, de celui du cinéma,
du ratio de préférence, et se rappeler  que les OtherActivity n'ont
pas de cinéma donc il faudrait  normaliser le score entre ces deux
types d'événements.

5. Plomberie pour acheminer les prédictions: 
- faire tourner l'assistant dans un worker thread
- déclencher le calcul lorsque le modèle ou les paramètres sont 
  modifiés (et cancel du thread en cours si un calcul était déjà en
  train de tourner), SAUF dans le cas d'un Chargement de l'AppState
- câbler la sortie de l'algorithme sur un Flux ou une Web Socket, 
- côté client, écouter le flux ou la socket.

6. Switch de mode Manuel/Assistant :
- ajouter "Assistant" au menu Mode
- un selector pour la Roadmap générée par l'assistant,
- un autre selector qui combineLatest la RoadMap manuelle, celle de
l'assistant, et le mode pour déterminer quelle intance de la Roadmap
au final doit être fournie aux services.


Finitions : 

7. Ajouter des tests jasmine/protractor,
  
8. Finitions:
- packager l'appli,
- écrire la doc,
- au démarrage faire un petit message console pour dire 
- quand c'est prêt.


## Features à envisager

- Quand on place une OtherActivity, toutes les sessions
  qui chevauchent temporellement auront un rendu 'disabled'
  dans l'interface.

- Une barre de filtre (position statique) pour n'afficher
  que les films choisis.


## Remarques Thomas

- Ajouter un bouton pour créer un film à la volée depuis 
  l'interface Session.

- Réfléchir à la possibilité d'un algorithme d'optimisation 
  linéaire sous contraintes : une seule fonction objectif
  mais sortir plusieurs solutions, chacune optimale pour une 
  certaine valuation des paramètres. 
  Par exemple, pour un paramétrage "Cinema" (C) et un 
  paramétrage "Film" (F):
  sortir une solution 100C/0F, 90C/0F, 80C/20F etc

  ==> Rappeler Noelle
