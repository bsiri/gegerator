CREATE TABLE movie (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    duration VARCHAR(10)
    -- note : the INTERVAL HOUR TO MINUTE native h2 format
    -- is simply not supported and I give up on configuring
    -- which converter in what conversion service.
    -- VARCHAR is just fine for my purposes.
);

CREATE TABLE movie_session(
    id SERIAL PRIMARY KEY,
    movie_id INTEGER,
    theater VARCHAR(50),
    start_time TIMESTAMP,
    foreign key (movie_id) references movie(id) on delete cascade
    -- note : cinema is a varchar here but in java
    -- it will be an enum, I hope r2dbc driver can handle
    -- the conversion
);