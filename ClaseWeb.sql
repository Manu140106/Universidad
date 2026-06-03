CREATE DATABASE claseWeb;

USE claseWeb;

CREATE TABLE score (
	id INT AUTO_INCREMENT PRIMARY KEY,
	usuario VARCHAR(100) NOT NULL,
	puntaje INT NOT NULL
);

INSERT INTO score (usuario, puntaje) VALUES ("Manuela", 10);
INSERT INTO score (usuario, puntaje) VALUES ("Sofia", 25);
INSERT INTO score (usuario, puntaje) VALUES ("Juan", 5);
INSERT INTO score (usuario, puntaje) VALUES ("Maria", 50);
INSERT INTO score (usuario, puntaje) VALUES ("Pedro", 100);

SELECT * FROM score