<?php
require_once 'session.php';
require_once 'db.php';


// CORS for frontend on 127.0.0.1:5500
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['product_id']) || !isset($data['quantity'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing product_id or quantity']);
    exit;
}
$product_id = (int)$data['product_id'];
$quantity = (int)$data['quantity'];
if ($quantity < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid quantity']);
    exit;
}

// Check stock
$stmt = $conn->prepare('SELECT stock FROM products WHERE id = ? AND status = 1');
$stmt->bind_param('i', $product_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Product not found']);
    exit;
}
$row = $result->fetch_assoc();
if ($row['stock'] < $quantity) {
    http_response_code(409);
    echo json_encode(['error' => 'Not enough stock']);
    exit;
}

// Decrease stock
$stmt = $conn->prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
$stmt->bind_param('ii', $quantity, $product_id);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Purchase successful']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update stock']);
}
