insert into movie(id, title, duration) values
    (1, 'Decapitron', 'PT1H36M'),
    (2, 'Fortress', 'PT1H35M');


insert into movie_session(id, movie_id, theater, day_name, start_time) values
    (1, 1, 'ESPACE_LAC', 'THURSDAY', '10:50:00'),
    (2, 2, 'PARADISO', 'SATURDAY', '17:35:00'),
    (3, 1, 'CASINO', 'FRIDAY', '13:00:00'),
    (4, 2, 'MCL', 'THURSDAY', '10:25:00');