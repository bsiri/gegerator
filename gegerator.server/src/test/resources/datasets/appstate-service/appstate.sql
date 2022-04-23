insert into movie(id, title, duration) values
    (1, 'Decapitron', 'PT1H36M'),
    (2, 'Tremors', 'PT1H36M'),
    (3, 'Halloween', 'PT1H31M');


insert into movie_session(id, movie_id, theater, day_name, start_time) values
    (1, 1, 'ESPACE_LAC', 'THURSDAY', '10:00:00'),
    (2, 1, 'MCL', 'SATURDAY', '17:25:00'),
    (3, 3, 'CASINO', 'SUNDAY', '11:15:00'),
    (4, 2, 'PARADISO', 'FRIDAY', '13:30:00');

insert into other_activity(id, day_name, start_time, end_time, description) values
    (1, 'THURSDAY', '19:00:00', '21:00:00', 'Géromoise'),
    (2, 'SATURDAY', '20:00:00', '21:30:00', 'Soupe aux Choux');
