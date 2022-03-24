CREATE TABLE movie (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    duration VARCHAR(10)
    -- note : the INTERVAL HOUR TO MINUTE native h2 format
    -- is simply not supported and I give up on configuring
    -- which converter in what conversion service.
    -- VARCHAR is just fine for my purposes.
);

