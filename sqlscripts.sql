


-- MySQL Workbench Forward Engineering
-- -----------------------------------------------------
-- Schema BMPS
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `BMPS`;
CREATE SCHEMA IF NOT EXISTS `BMPS` DEFAULT CHARACTER SET utf8 ;
USE `BMPS`;

-- -----------------------------------------------------
-- Table `BMPS`.`MEMBERS`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BMPS`.`MEMBERS` (
	`Mem_id` INT NOT NULL,
  `Mem_name` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NOT NULL,
  `PhoneNum` VARCHAR(13) NOT NULL,
  `Address` VARCHAR(200) NOT NULL,
  `country`  VARCHAR(100) NOT NULL,
  PRIMARY KEY (`Mem_id`))
ENGINE = InnoDB;
CREATE INDEX idx_Mem_id ON `BMPS`.`MEMBERS` (`Mem_id`);


-- -----------------------------------------------------
-- Table `BMPS`.`AUTHOR`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BMPS`.`AUTHOR` (
  `Author_id` INT NOT NULL AUTO_INCREMENT,
  `Aname` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`Author_id`),
  CHECK (LENGTH(`Aname`) > 0)
)

ENGINE = InnoDB;



-- -----------------------------------------------------
-- Table `BMPS`.`BOOK`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BMPS`.`BOOK` (
  `ISBN` BIGINT NOT NULL,
  `Title` VARCHAR(200) NOT NULL,
  `Publication_date` DATE NOT NULL,
  `Author_id` INT NOT NULL,
   `Genre_id` INT NOT NULL,
  PRIMARY KEY (`ISBN`),
  FOREIGN KEY (`Author_id`) REFERENCES `BMPS`.`AUTHOR` (`Author_id`) ON DELETE NO ACTION ON UPDATE NO ACTION)
ENGINE = InnoDB;



-- -----------------------------------------------------
-- Table `BMPS`.`BOOK_RESERVATION`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BMPS`.`BOOK_RESERVATION` (
  `Res_id` INT NOT NULL AUTO_INCREMENT,
  `Mem_id` INT NOT NULL,
  `ISBN` BIGINT NOT NULL,
  `Res_date` DATE NOT NULL,
  `Res_status` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`Res_id`),
  FOREIGN KEY (`Mem_id`) REFERENCES `BMPS`.`MEMBERS` (`Mem_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (`ISBN`) REFERENCES `BMPS`.`BOOK` (`ISBN`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `BMPS`.`BORROWED_BOOK`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BMPS`.`BORROWED_BOOK` (
  `Borrow_id` INT NOT NULL AUTO_INCREMENT,
  `Mem_id` INT NOT NULL,
  `ISBN` BIGINT NOT NULL,
  `Borrow_date` DATE NOT NULL,
  `Return_date` DATE NULL,
  `Status` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`Borrow_id`),
  FOREIGN KEY (`Mem_id`) REFERENCES `BMPS`.`MEMBERS` (`Mem_id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (`ISBN`) REFERENCES `BMPS`.`BOOK` (`ISBN`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE = InnoDB;



-- -----------------------------------------------------
-- Table `BMPS`.`GENRE`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BMPS`.`GENRE` (
  `Genre_id` INT NOT NULL AUTO_INCREMENT,
  `Gname` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`Genre_id`))
ENGINE = InnoDB;



-- Data insertions based on your provided data for authors, publishers, customers, etc., go here
-- -----------------------------------------------------
-- Foreign Keys and Relationships
-- -----------------------------------------------------
-- Relationships between BOOK, GENRE, and AUTHOR
ALTER TABLE `BMPS`.`BOOK` 
ADD CONSTRAINT `FK_Book_Author`
  FOREIGN KEY (`Author_id`)
  REFERENCES `BMPS`.`AUTHOR` (`Author_id`),
ADD CONSTRAINT `FK_Book_Genre`
  FOREIGN KEY (`Genre_id`)
  REFERENCES `BMPS`.`GENRE` (`Genre_id`);





-- -----------------------------------------------------
-- Indices for optimization
-- -----------------------------------------------------
CREATE INDEX `idx_Res_id_Mem` ON `BMPS`.`BOOK_RESERVATION` (`Mem_id`);
CREATE INDEX `idx_Borrow_id_Mem` ON `BMPS`.`BORROWED_BOOK` (`Mem_id`);
CREATE INDEX `idx_Res_id_ISBN` ON `BMPS`.`BOOK_RESERVATION` (`ISBN`);
CREATE INDEX `idx_Borrow_id_ISBN` ON `BMPS`.`BORROWED_BOOK` (`ISBN`);





-- -----------------------------------------------------
-- Views for automated actions
-- -----------------------------------------------------
CREATE VIEW member_info AS
SELECT Mem_id, Mem_name, Email, PhoneNum, Address
FROM MEMBERS
WHERE country = "TURKEY";



CREATE VIEW `BookDetails` AS
SELECT 
    b.ISBN,
    b.Title,
    b.Publication_date,
    a.Aname AS AuthorName,
    g.Gname AS GenreName,
    COALESCE(br.Res_status, 'Available') AS ReservationStatus
FROM
    `BMPS`.`BOOK` AS b
    LEFT JOIN `BMPS`.`AUTHOR` AS a ON b.Author_id = a.Author_id
    LEFT JOIN `BMPS`.`GENRE` AS g ON b.Genre_id = g.Genre_id
    LEFT JOIN `BMPS`.`BOOK_RESERVATION` AS br ON b.ISBN = br.ISBN;




CREATE VIEW `ReservedBooksDetails` AS
SELECT 
    br.ISBN,
    b.Title AS BookTitle,
    br.Mem_id,
    m.Mem_name AS MemberName,
    br.Res_date AS ReservationDate
FROM 
    `BMPS`.`BOOK_RESERVATION` AS br
JOIN 
    `BMPS`.`BOOK` AS b ON br.ISBN = b.ISBN
JOIN 
    `BMPS`.`MEMBERS` AS m ON br.Mem_id = m.Mem_id
WHERE 
    br.Res_status = 'Reserved';







-- -----------------------------------------------------
-- Triggers for automated actions
-- -----------------------------------------------------
DELIMITER //

CREATE TRIGGER Trigger_ReturnBook AFTER UPDATE ON BMPS.BORROWED_BOOK
FOR EACH ROW 
BEGIN
    IF NEW.Return_date IS NOT NULL THEN
        UPDATE BMPS.BORROWED_BOOK
        SET Status = 'Returned'
        WHERE Borrow_id = NEW.Borrow_id;
    END IF;
END; //

DELIMITER ;
