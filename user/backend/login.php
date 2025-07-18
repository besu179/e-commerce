<?php

require_once 'session.php';
require_once 'db.php';

// Enable CORS with proper headers

// CORS for frontend on 127.0.0.1:5500
header('Access-Control-Allow-Origin: http://127.0.0.1:5500');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        exit;
    }

    $email = trim($data['email']);
    $password = $data['password'];

    try {
        // Prepare SQL statement
        $stmt = $conn->prepare("
            SELECT id, password, first_name, last_name, email 
            FROM users 
            WHERE email = ?
        ");
        if (!$stmt) {
            throw new Exception("Database error: " . $conn->error);
        }
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            exit;
        }
        $user = $result->fetch_assoc();
        // Secure password check
        if (!password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            exit;
        }
        // Successful login: set session
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_name'] = trim($user['first_name'] . ' ' . $user['last_name']);
        unset($user['password']); // Remove password from response
        $user['name'] = $_SESSION['user_name'];
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
