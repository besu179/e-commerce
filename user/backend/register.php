<?php

require_once 'session.php';
require_once 'db.php';


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
    $requiredFields = ['first_name', 'last_name', 'email', 'password'];
    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit;
        }
    }
    
    $firstName = trim($data['first_name']);
    $lastName = trim($data['last_name']);
    $email = trim($data['email']);
    $password = $data['password'];
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }
    
    // Check password length
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        exit;
    }
    // Hash password securely
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    try {
        // Check if email already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already registered']);
            exit;
        }
        
        // Create new user
        $stmt = $conn->prepare("
            INSERT INTO users (first_name, last_name, email, password)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->bind_param('ssss', $firstName, $lastName, $email, $passwordHash);
        $stmt->execute();
        
        if ($stmt->affected_rows > 0) {
            // Get the new user
            $userId = $stmt->insert_id;
            $stmt = $conn->prepare("
                SELECT id, first_name, last_name, email 
                FROM users 
                WHERE id = ?
            ");
            $stmt->bind_param('i', $userId);
            $stmt->execute();
            $result = $stmt->get_result();
            $user = $result->fetch_assoc();
            
            // Successful registration
            echo json_encode([
                'success' => true,
                'user' => $user,
                'message' => 'Registration successful'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}