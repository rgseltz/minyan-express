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
    nick_name TEXT,
    street TEXT NOT NULL, 
    number INTEGER NOT NULL,
    city TEXT NOT NULL, 
    zip INTEGER,
    -- coordinates? 
    is_public BOOLEAN NOT NULL DEFAULT true,
    location_capacity_limit INTEGER DEFAULT 15 
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    start_time TIME,
    end_time TIME,
    location_id INTEGER NOT NULL
        REFERENCES locations ON DELETE CASCADE,
    current_capacity INTEGER NOT NULL DEFAULT 0,
    max_capacity INTEGER --nice to have for later 
);

CREATE TABLE reservations (
    user_id INTEGER NOT NULL REFERENCES users 
        ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events 
        ON DELETE CASCADE
);