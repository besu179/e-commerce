<?php
$host = "localhost";
$username = "root";
$password = "";
$database = "ecommerce";

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create tables
$tables = [
    "CREATE TABLE IF NOT EXISTS category (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        status BOOLEAN DEFAULT 1
    )",

    "CREATE TABLE IF NOT EXISTS banner (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        name VARCHAR(255) NOT NULL , 
        description VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        status TINYINT NOT NULL DEFAULT 0
        )"
];

foreach ($tables as $sql) {
    if (!$conn->query($sql)) {
        error_log("Table creation failed: " . $conn->error);
    }
}
