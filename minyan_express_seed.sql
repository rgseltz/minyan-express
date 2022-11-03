-- "test user has the encrypted password of 'password'"

INSERT INTO users (username, password, first_name, last_name, email) 
VALUES ('testuser', '$2y$04$JI7wHgnq4qEAboSFThgLCeqt2vaNZZbGjOejCHUDnPaPZKiMyeanu', 'test', 'user', 'testuser@email.com');

-- needs country, make street number optional, add column for notes about location, maybe also room? floor? details
INSERT INTO locations (nick_name, street, number, city, zip, is_public, location_capacity_limit) 
VALUES ('airport synagogue', 'Ben Gurion Airport', 1, 'Tel Aviv', 7015001, 'true', 35), 
('kinar galilee hotel synagogue', 'צפון מזרח הכנרת רמות,',1, 'Ramot', 12490, 'true', 25);

INSERT INTO events (start_time, end_time, location_id, current_capacity) 
VALUES ('9:00', '9:45', 1, 1);

INSERT INTO reservations (user_id, event_id) VALUES (1, 1);