
<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');


require_once 'product_category.php';

function fetch_random_items($limit = 8) {
    global $conn;
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("
            SELECT id, name, description, price, image
            FROM products
            WHERE status = 1
            ORDER BY RAND()
            LIMIT ?
        ");
        if ($stmt) {
            $stmt->bind_param('i', $limit);
            $stmt->execute();
            $result = $stmt->get_result();
            $products = [];
            while ($row = $result->fetch_assoc()) {
                $row['image'] = $row['image'];
                $products[] = $row;
            }
            $stmt->close();
            echo json_encode(['random' => $products]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => "Database error: " . $conn->error]);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}

fetch_random_items();
$conn->close();
