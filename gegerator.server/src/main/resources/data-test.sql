insert into movie(id, title, duration, rating) values
    (1, 'Decapitron', 'PT1H36M', 'HIGH'),
    (2, 'Fortress', 'PT1H35M', 'DEFAULT');


insert into movie_session(id, movie_id, theater, day_name, start_time, rating) values
    (1, 1, 'ESPACE_LAC', 'THURSDAY', '10:50:00', 'NEVER'),
    (2, 2, 'PARADISO', 'SATURDAY', '17:35:00', 'MANDATORY'),
    (3, 1, 'CASINO', 'FRIDAY', '13:00:00', 'DEFAULT'),
    (4, 2, 'MCL', 'THURSDAY', '08:25:00', 'DEFAULT');

insert into other_activity(id, day_name, start_time, end_time, description, rating) values
    (1, 'THURSDAY', '12:00:00', '14:00:00', 'Géromoise', 'MANDATORY'),
    (2, 'FRIDAY', '19:30:00', '21:30:00', 'Clé des Champs', 'DEFAULT');

