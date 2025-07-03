<?php

$host     = "localhost";
$username = "root";
$password = "";
$database = "ecommerce"; 

if ($conn->connect_error) {
    die("Connection to server failed: " . $conn->connect_error);
}


$sqlCreateTableCategory = "CREATE TABLE IF NOT EXISTS category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status BOOLEAN DEFAULT 1
)";

if ($conn->query($sqlCreateTableCategory) === FALSE) {
    echo "Error creating table 'category': " . $conn->error . "<br>";
}

?>
