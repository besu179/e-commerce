<?php
// featured.php
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
    // Fetch products with price > 100
    $stmt = $conn->prepare("
        SELECT id, name, description, price, image, stock
        FROM products 
        WHERE price > 100 AND status = 1
        ORDER BY RAND() 
        LIMIT 8
    ");
    
    if ($stmt) {
        $stmt->execute();
        $result = $stmt->get_result();
        $featured = [];

        while ($row = $result->fetch_assoc()) {
            // Add full path to the image
            $row['image'] =  $row['image'];
            $featured[] = $row;
        }

        $stmt->close();
        echo json_encode(['featured' => $featured]);
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