use project_database;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE user;
TRUNCATE basket;
TRUNCATE basket_line;
TRUNCATE book;
SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE user AUTO_INCREMENT = 1;
ALTER TABLE basket AUTO_INCREMENT = 1;
ALTER TABLE basket_line AUTO_INCREMENT = 1;
ALTER TABLE book AUTO_INCREMENT = 1;

insert into user(name, lastname, login, password, profil) VALUES 
("Ignacio", "Planas Thiriet", "admin1","$2b$10$N/3VE9KKSMYY7Mv/hPPCVujbnQ.ngSb3Gq8nWItyQAZZYuPzcxZJe","administrator"),  -- password : 1234
("Pierre", "Benjamin", "admin2","$2b$10$vrnSDrJv.n2JgWeZHQjjc.vPIp.Nae8xuZFSJAHJs1WSOh32hQEFu","administrator"),  -- password : 12345
("Sten", "Tchande", "admin3","$2b$10$QfnQ2ixKb2BS.ZpG5IBX5eqPegST4zr7MaERGm5QHxHPyKVgO5jei","administrator"),  -- password : 123456
("name_user1", "lastname_user1", "user1","$2b$10$xdLiiZka.EQNXKOPMN4gguU6eKJ3T7Qu5TVcdpzMLnt4ULzGL6tl2","student"), -- password : password1
("name_user2", "lastname_user2", "user2","$2b$10$he7rFgWxCw2R3LPoR4qI3Ocvs.Rj7RGuhnXM5SAb7L8n3v30BAKBK","student"); -- password : password2

insert into book(name,stock,url) values ("Harry Potter 1", 30, "https://img.chasse-aux-livres.fr/v7/_am1_/515iJ1-+IvL.jpg?w=600&h=500&func=bound&org_if_sml=1"),
("Harry Potter 2",30, "https://images-na.ssl-images-amazon.com/images/I/91OINeHnJGL.jpg"),
("Harry Potter 3", 30, "https://images-na.ssl-images-amazon.com/images/I/81lAPl9Fl0L.jpg"),
("The lord of the rings single volume", 10,"https://upload.wikimedia.org/wikipedia/en/e/e9/First_Single_Volume_Edition_of_The_Lord_of_the_Rings.gif"),
("The hobbit ilustrated version",5 , "https://images-na.ssl-images-amazon.com/images/I/91pUiM36U3L.jpg");

insert into basket(user_id,creation_date) Values(1,NOW()),(2,NOW()),(3,NOW()),(4,NOW()); -- user 5 does not initially have a basket
insert into basket_line(basket_id, book_id, qte) values (1,1,1),(1,2,2),(1,3,2),(2,1,1),(2,2,1),(2,4,1),(2,5,1),(3,4,1),(3,5,1),(4,4,1),(4,5,1);