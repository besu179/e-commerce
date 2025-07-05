<?php
require_once 'db.php';

// For development only
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $conn->prepare("SELECT id, name, description, image FROM banner WHERE status = 1");
    
    if ($stmt) {
        $stmt->execute();
        $result = $stmt->get_result();
        $banners = [];

        while ($row = $result->fetch_assoc()) {
            // Add full path to the image
            $row['image'] = $row['image'];
            $banners[] = $row;
        }

        $stmt->close();
        echo json_encode(['banners' => $banners]);
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