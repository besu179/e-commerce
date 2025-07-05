<?php
// featured.php
require_once 'db.php';

// For development only
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Fetch products with price > 100
    $stmt = $conn->prepare("
        SELECT id, name, description, price, image 
        FROM products 
        WHERE category_id = 1 AND status = 1
        ORDER BY RAND() 
        LIMIT 8
    ");
    
    if ($stmt) {
        $stmt->execute();
        $result = $stmt->get_result();
        $men = [];

        while ($row = $result->fetch_assoc()) {
            // Add full path to the image
            $row['image'] =  $row['image'];
            $men[] = $row;
        }

        $stmt->close();
        echo json_encode(['men' => $men]);
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