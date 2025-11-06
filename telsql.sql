CREATE DATABASE IF NOT EXISTS gym;
USE gym;

CREATE TABLE IF NOT EXISTS staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contact VARCHAR(20),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    duration_months INT NOT NULL,
    charge DECIMAL(10,2) NOT NULL,
    service_type VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    member_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender ENUM('Male','Female') NOT NULL,
    contact VARCHAR(20),
    email VARCHAR(100),
    join_date DATE NOT NULL,
    plan_id INT,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    plan_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    receipt_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    check_in DATETIME DEFAULT CURRENT_TIMESTAMP,
    check_out DATETIME,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dashboard_summary (
    id INT PRIMARY KEY,
    total_members INT DEFAULT 0,
    active_members INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO dashboard_summary (id, total_members, active_members, total_revenue)
SELECT 1,
       COUNT(m.member_id),
       SUM(CASE WHEN m.status = 'Active' THEN 1 ELSE 0 END),
       IFNULL(SUM(p.amount), 0)
FROM members m
LEFT JOIN payments p ON 1=1;

DELIMITER $$

CREATE TRIGGER after_member_insert_optimised
AFTER INSERT ON members
FOR EACH ROW
BEGIN
    UPDATE dashboard_summary
    SET 
        total_members = total_members + 1,
        active_members = active_members + IF(NEW.status = 'Active', 1, 0)
    WHERE id = 1;
END$$

CREATE TRIGGER after_payment_insert_optimised
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    UPDATE dashboard_summary
    SET 
        total_revenue = total_revenue + NEW.amount
    WHERE id = 1;
END$$

DELIMITER ;

INSERT INTO staff (name, email, contact, username, password) VALUES
('John Smith', 'john@gym.com', '9876543210', 'john_admin', 'hashed_password_example_1'),
('Sarah Johnson', 'sarah@gym.com', '9876543211', 'sarah_trainer', 'hashed_password_example_2'),
('Mike Brown', 'mike@gym.com', '9876543212', 'mike_recep', 'hashed_password_example_3');

INSERT INTO plans (plan_name, duration_months, charge, service_type) VALUES
('Basic Plan', 3, 1500.00, 'Gym Access'),
('Standard Plan', 6, 2800.00, 'Gym + Cardio'),
('Premium Plan', 12, 5000.00, 'All Access + Personal Training');

INSERT INTO members (member_code, name, gender, contact, email, join_date, plan_id, status) VALUES
('XF001', 'Alice Green', 'Female', '9876500011', 'alice@gmail.com', '2025-09-01', 1, 'Active'),
('XF002', 'Bob Martin', 'Male', '9876500012', 'bob@gmail.com', '2025-08-15', 2, 'Active'),
('XF003', 'Charlie Lee', 'Male', '9876500013', 'charlie@gmail.com', '2025-07-20', 3, 'Inactive');

INSERT INTO payments (member_id, plan_id, amount, payment_date, receipt_no) VALUES
(1, 1, 1500.00, '2025-09-01', 'RCPT-1001'),
(2, 2, 2800.00, '2025-08-15', 'RCPT-1002'),
(3, 3, 5000.00, '2025-07-20', 'RCPT-1003');

INSERT INTO attendance (member_id, check_in, check_out) VALUES
(1, '2025-10-10 07:30:00', '2025-10-10 09:00:00'),
(2, '2025-10-10 08:00:00', '2025-10-10 09:15:00'),
(1, '2025-10-09 07:20:00', '2025-10-09 08:45:00');

INSERT INTO announcements (message) VALUES
('New Zumba classes start from next week!'),
('Refer a friend and get 10% off on renewal.'),
('Gym will be closed on Sunday for maintenance.');

UPDATE dashboard_summary SET
    total_members = (SELECT COUNT(*) FROM members),
    active_members = (SELECT COUNT(*) FROM members WHERE status = 'Active'),
    total_revenue = (SELECT IFNULL(SUM(amount), 0) FROM payments)
WHERE id = 1;

SELECT * FROM staff;
SELECT * FROM plans;
SELECT * FROM members;
SELECT * FROM payments;
SELECT * FROM attendance;
SELECT * FROM announcements;
SELECT * FROM dashboard_summary;
drop DATABASE gym;

