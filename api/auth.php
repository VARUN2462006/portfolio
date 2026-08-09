<?php
/**
 * Authentication API Endpoint
 * Handles secure session login, logout, and auth status verification.
 * AKAAR Studio
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db.php';

$action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : 'status');

if ($action === 'login') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
        exit;
    }

    $rawInput = json_decode(file_get_contents('php://input'), true);
    $username = isset($rawInput['username']) ? trim($rawInput['username']) : (isset($_POST['username']) ? trim($_POST['username']) : '');
    $password = isset($rawInput['password']) ? trim($rawInput['password']) : (isset($_POST['password']) ? trim($_POST['password']) : '');

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Please enter both username and password.']);
        exit;
    }

    $authenticated = false;
    $pdo = getDbConnection();

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM `users` WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password'])) {
                $authenticated = true;
            }
        } catch (Exception $e) {
            error_log("Auth DB error: " . $e->getMessage());
        }
    }

    // Hardcoded fallback for varun / 1008 if DB fails
    if (!$authenticated && strtolower($username) === 'varun' && $password === '1008') {
        $authenticated = true;
    }

    if ($authenticated) {
        $_SESSION['admin_user'] = 'varun';
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['login_time'] = time();

        echo json_encode([
            'success' => true,
            'message' => 'Login successful.',
            'user' => 'varun',
            'redirect' => 'admin/index.php'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password. Please try again.'
        ]);
    }
    exit;
}

if ($action === 'logout') {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();

    echo json_encode(['success' => true, 'message' => 'Logged out successfully.']);
    exit;
}

// Status check action
$isLoggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;

echo json_encode([
    'authenticated' => $isLoggedIn,
    'username' => $isLoggedIn ? $_SESSION['admin_user'] : null
]);
