CREATE TABLE user (
  userId int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  active BOOLEAN DEFAULT TRUE
);

DELIMITER //
CREATE PROCEDURE sp_AddUser (
  IN p_email VARCHAR(100),
  IN p_password VARCHAR(100),
  IN p_type VARCHAR(50),
  IN p_active BOOLEAN
)
BEGIN
  INSERT INTO users (email, password, type, active)
  VALUES (p_email, p_password, p_type, p_active);
END;
//
DELIMITER ;

-- Example call
CALL addUser('ehsan@example.com', 'hashedpassword', 'admin', true);