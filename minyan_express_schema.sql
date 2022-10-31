CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(15) NOT NULL UNIQUE, 
    password TEXT NOT NULL, 
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
);

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    nick_name VARCHAR(25),
    street TEXT NOT NULL, 
    number INTEGER NOT NULL,
    city TEXT NOT NULL, 
    zip INTEGER,
    -- coordinates 
    is_public BOOLEAN,
    location_capacity_limit INTEGER DEFAULT 15 
);