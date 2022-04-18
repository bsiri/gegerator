CREATE TABLE movie (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE NOT NULL,
    duration VARCHAR(10) NOT NULL
    -- note : the INTERVAL HOUR TO MINUTE native h2 format
    -- is simply not supported and I give up on configuring
    -- which converter in what conversion service.
    -- VARCHAR is just fine for my purposes.
);

CREATE TABLE movie_session(
    id SERIAL PRIMARY KEY,
    movie_id INTEGER NOT NULL,
    theater VARCHAR(50) NOT NULL,
    day_name VARCHAR(10) NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    foreign key (movie_id) references movie(id) on delete cascade
    -- note : cinema is a varchar here but in java
    -- it will be an enum, I hope r2dbc driver can handle
    -- the conversion
);

CREATE TABLE other_activity(
    id SERIAL PRIMARY KEY,
    day_name VARCHAR(10) NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    description VARCHAR(250) NOT NULL,
    constraint time_integrity check (end_time > start_time)
);