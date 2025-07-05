<?php
// session.php - Handles session start and secure settings
if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_secure' => true, // Always true for cross-origin with SameSite=None
        'cookie_samesite' => 'None',
    ]);
}
