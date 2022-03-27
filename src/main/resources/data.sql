insert into movie(id, name, duration) values
    (1, 'Decapitron', 'PT1H36M'),
    (2, 'Fortress', 'PT1H35M');


insert into movie_session(id, movie_id, theater, start_time) values
    (1, 1, 'ESPACE_LAC', '2022-03-26 10:50:00'),
    (2, 1, 'CASINO', '2022-03-26 13:00:00'),
    (3, 2, 'PARADISO', '2022-03-07 17:35:00');