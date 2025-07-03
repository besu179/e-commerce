<?php

$host     = "localhost"; 
$username = "root";
$password = "";         
$database = "ecommerce";    



$conn = new mysqli($host, $username, $password);

if ($conn->connect_error) {
    die("Connection to server failed: " . $conn->connect_error);
}

$sqlCreateDatabase = "CREATE DATABASE IF NOT EXISTS `$database`";
if ($conn->query($sqlCreateDatabase) === FALSE) {
    echo "Error creating database: " . $conn->error . "<br>";
    $conn->close();
    exit; 
}

if ($conn->select_db($database) === FALSE) {
    echo "Unable to select database: " . $conn->error . "<br>";
    $conn->close();
    exit; 
}


$sqlCreateTableCategory = "CREATE TABLE IF NOT EXISTS category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status BOOLEAN DEFAULT 1
)";

if ($conn->query($sqlCreateTableCategory) === FALSE) {
    echo "Error creating table 'category': " . $conn->error . "<br>";
} 


$conn->close();

?>

