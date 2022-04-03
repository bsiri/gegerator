
insert into movie(id, title, duration) values
    (1, 'Decapitron', 'PT1H36M'),
    (2, 'The Mist', 'PT2H6M'),
    (3, 'Fortress', 'PT1H35M'),
    (4, 'Bernie', 'PT1H27M');


insert into movie_session(id, movie_id, theater, start_time) values
    (1, 1, 'ESPACE_LAC', '2022-03-26 10:50:00'),
    (2, 3, 'PARADISO', '2022-03-27 17:35:00'),
    (3, 1, 'CASINO', '2022-03-26 13:00:00');