<?php
/**
 * Admin Inquiries API Endpoint
 * Protected endpoint for viewing contact form submissions.
 * AKAAR Studio
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$pdo = getDbConnection();
$inquiries = [];

if ($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM `contacts` ORDER BY id DESC");
        $inquiries = $stmt->fetchAll();
    } catch (Exception $e) {
        error_log("Inquiries fetch error: " . $e->getMessage());
    }
}

// Fallback to JSON log if DB empty
if (empty($inquiries)) {
    $logPath = __DIR__ . '/inquiries_log.json';
    if (file_exists($logPath)) {
        $inquiries = json_decode(file_get_contents($logPath), true) ?: [];
    }
}

echo json_encode([
    'success' => true,
    'inquiries' => $inquiries
]);
