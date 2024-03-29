CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(15) NOT NULL UNIQUE, 
    password TEXT NOT NULL, 
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    nick_name TEXT,
    street_name TEXT NOT NULL, 
    street_number VARCHAR(10) NOT NULL,
    city TEXT NOT NULL, 
    zip INTEGER,
    -- coordinates? 
    is_public BOOLEAN NOT NULL DEFAULT true,
    location_capacity_limit INTEGER DEFAULT 15,
    type TEXT  
);

CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    service_type TEXT NOT NULL,
    location_id INTEGER NOT NULL
        REFERENCES locations ON DELETE CASCADE,
    current_capacity INTEGER NOT NULL DEFAULT 0,
    max_capacity INTEGER DEFAULT 30 --nice to have for later 
);

CREATE TABLE reservations (
    user_id INTEGER NOT NULL REFERENCES users 
        ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events 
        ON DELETE CASCADE, 
        PRIMARY KEY(user_id, event_id)
);