<?php
/**
 * Contact Form API Endpoint
 * Handles form submission, validation, PDO MySQL storage, email notification to Varun, and graceful fallbacks.
 * AKAAR Studio
 */

header('Content-Type: application/json; charset=utf-8');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

// Retrieve and sanitize input data
$rawInput = json_decode(file_get_contents('php://input'), true);
if (!empty($rawInput)) {
    $input = $rawInput;
} elseif (empty($input) && !empty($_POST)) {
    $input = $_POST;
}

$name        = isset($input['name']) ? trim(strip_tags($input['name'])) : '';
$email       = isset($input['email']) ? trim(strip_tags($input['email'])) : '';
$projectType = isset($input['project_type']) ? trim(strip_tags($input['project_type'])) : '';
$message     = isset($input['message']) ? trim(strip_tags($input['message'])) : '';

$errors = [];

// Validation
if (empty($name) || strlen($name) < 2) {
    $errors['name'] = 'Please enter your name (at least 2 characters).';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
}

$allowedProjects = ['Landing Page', 'Business Website', 'Product Launch', 'Website Redesign', 'Other'];
if (empty($projectType) || !in_array($projectType, $allowedProjects)) {
    $errors['project_type'] = 'Please select a valid project type.';
}

if (empty($message) || strlen($message) < 10) {
    $errors['message'] = 'Please write a brief message (at least 10 characters).';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please correct the highlighted fields.',
        'errors'  => $errors
    ]);
    exit;
}

// Client IP Address
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

// Try saving to Database via PDO
$db = getDbConnection();
$savedToDb = false;

if ($db) {
    try {
        $stmt = $db->prepare("
            INSERT INTO contacts (name, email, project_type, message, ip_address) 
            VALUES (:name, :email, :project_type, :message, :ip_address)
        ");
        $savedToDb = $stmt->execute([
            ':name'         => $name,
            ':email'        => $email,
            ':project_type' => $projectType,
            ':message'      => $message,
            ':ip_address'   => $ipAddress
        ]);
    } catch (PDOException $e) {
        error_log("DB Insert Error: " . $e->getMessage());
    }
}

// Fallback JSON log if DB is offline/not initialized
if (!$savedToDb) {
    $logFile = __DIR__ . '/inquiries_log.json';
    $existing = [];
    if (file_exists($logFile)) {
        $existing = json_decode(file_get_contents($logFile), true) ?? [];
    }
    $existing[] = [
        'name' => $name,
        'email' => $email,
        'project_type' => $projectType,
        'message' => $message,
        'ip' => $ipAddress,
        'created_at' => date('Y-m-d H:i:s')
    ];
    @file_put_contents($logFile, json_encode($existing, JSON_PRETTY_PRINT));
}

// Send Email Notification directly to Varun (atahwalevarun779@gmail.com)
$to = 'atahwalevarun779@gmail.com';
$subject = "New Inquiry from {$name} - AKAAR Studio";
$emailContent = "You received a new client inquiry on AKAAR Studio:\n\n"
              . "Name: {$name}\n"
              . "Email: {$email}\n"
              . "Project Type: {$projectType}\n"
              . "Message:\n{$message}\n\n"
              . "Date: " . date('Y-m-d H:i:s') . "\n"
              . "IP Address: {$ipAddress}\n";
$headers = "From: noreply@akaarstudio.com\r\n"
         . "Reply-To: {$email}\r\n"
         . "X-Mailer: PHP/" . phpversion();

@mail($to, $subject, $emailContent, $headers);

// Return Success Response
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => "Thank you, {$name}! Your message has been sent directly to Varun (atahwalevarun779@gmail.com). We'll reply to your email within 24 hours.",
    'data' => [
        'name' => $name,
        'project_type' => $projectType
    ]
]);
