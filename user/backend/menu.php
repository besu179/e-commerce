<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");  // WARNING: Use with caution! See below.
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT name FROM category WHERE status = 1"); // Prepared statement
    if ($stmt) {
        $stmt->execute();
        $result = $stmt->get_result();  // Get the result set

        $arr = array();
        while ($row = $result->fetch_assoc()) {  // Fetch the row
            array_push($arr, $row['name']);  // Access the 'name' column of the fetched row
        }

        $stmt->close(); // Close the statement
        echo json_encode(['categories' => $arr]);
    } else {
        //Handle error with prepare statement
        echo json_encode(['error' => "Error preparing statement: " . $conn->error]);
    }

    exit();
}
$conn->close();
