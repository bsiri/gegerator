
-- SQL entries that corresponds to testinfra.TestBeans

insert into movie(id, title, duration, rating) values
    (1, 'Decapitron', 'PT1H36M', 'DEFAULT'),
    (2, 'Tremors', 'PT1H36M', 'HIGH'),
    (3, 'Halloween', 'PT1H31M', 'HIGHEST'),
    (4, 'The Mist', 'PT2H6M', 'DEFAULT'); -- Note : that one is not planned in a session


insert into movie_session(id, movie_id, theater, day_name, start_time, rating) values
    (1, 1, 'ESPACE_LAC', 'THURSDAY', '10:00:00', 'NEVER'),
    (2, 1, 'MCL', 'SATURDAY', '17:25:00', 'DEFAULT'),
    (3, 3, 'CASINO', 'SUNDAY', '11:15:00', 'DEFAULT'),
    (4, 2, 'PARADISO', 'FRIDAY', '13:30:00', 'MANDATORY');


insert into other_activity(id, day_name, start_time, end_time, description) values
    (1, 'THURSDAY', '19:00:00', '21:00:00', 'Géromoise'),
    (2, 'SATURDAY', '20:00:00', '21:30:00', 'Soupe aux Choux');
