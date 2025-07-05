<?php
require_once 'db.php';

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

function fetch_category_products($category_id, $response_key) {
    global $conn;
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $conn->prepare("
            SELECT id, name, description, price, image, stock
            FROM products 
            WHERE category_id = ? AND status = 1
            ORDER BY RAND() 
            LIMIT 8
        ");
        if ($stmt) {
            $stmt->bind_param('i', $category_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $products = [];
            while ($row = $result->fetch_assoc()) {
                $row['image'] = $row['image'];
                $products[] = $row;
            }
            $stmt->close();
            echo json_encode([$response_key => $products]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => "Database error: " . $conn->error]);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}
