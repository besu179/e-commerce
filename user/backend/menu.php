<?php
require_once 'db.php';

// For development only
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT name FROM category WHERE status = 1");
    
    if ($stmt) {
        $stmt->execute();
        $result = $stmt->get_result();
        $categories = [];

        while ($row = $result->fetch_assoc()) {
            $categories[] = $row['name'];
        }

        $stmt->close();
        echo json_encode(['categories' => $categories]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => "Database error: " . $conn->error]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

$conn->close();
?>