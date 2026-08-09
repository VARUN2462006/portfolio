<?php
/**
 * Admin Projects Management API (Protected Endpoint)
 * Supports Add, Edit, Delete, and Image Upload for Portfolio Projects.
 * AKAAR Studio
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');

// Strict Security Verification
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admin authentication required.']);
    exit;
}

require_once __DIR__ . '/../config/db.php';

$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : 'list';
$fallbackPath = __DIR__ . '/../config/projects_data.json';

// Helper to save fallback JSON
function syncFallbackJson($projects) {
    global $fallbackPath;
    file_put_contents($fallbackPath, json_encode(array_values($projects), JSON_PRETTY_PRINT));
}

// Helper to upload project image
function handleImageUpload($fileField, $defaultPath = 'assets/images/project_aurelia.png') {
    if (isset($_FILES[$fileField]) && $_FILES[$fileField]['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES[$fileField];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mime, $allowedTypes)) {
            return false;
        }

        $uploadDir = __DIR__ . '/../assets/images/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'proj_' . time() . '_' . rand(1000, 9999) . '.' . strtolower($ext);
        $targetPath = $uploadDir . $filename;

        if (move_uploaded_path($file['tmp_name'], $targetPath)) {
            return 'assets/images/uploads/' . $filename;
        }
    }
    return false;
}

$pdo = getDbConnection();

// --- 1. LIST PROJECTS ---
if ($action === 'list') {
    $projects = [];
    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM `projects` ORDER BY order_num ASC, id DESC");
            $rows = $stmt->fetchAll();
            foreach ($rows as $r) {
                $highlights = json_decode($r['highlights'], true) ?: array_filter(array_map('trim', explode("\n", $r['highlights'])));
                $tech_tags = json_decode($r['tech_tags'], true) ?: array_filter(array_map('trim', explode(",", $r['tech_tags'])));
                $projects[] = [
                    'id' => (int)$r['id'],
                    'slug' => $r['slug'],
                    'title' => $r['title'],
                    'industry' => $r['industry'],
                    'image_url' => $r['image_url'],
                    'overview' => $r['overview'],
                    'highlights' => array_values($highlights),
                    'tech_tags' => array_values($tech_tags),
                    'order_num' => (int)$r['order_num']
                ];
            }
        } catch (Exception $e) {
            error_log("Admin List Error: " . $e->getMessage());
        }
    }

    if (empty($projects) && file_exists($fallbackPath)) {
        $projects = json_decode(file_get_contents($fallbackPath), true) ?: [];
    }

    echo json_encode(['success' => true, 'projects' => $projects]);
    exit;
}

// --- 2. ADD NEW PROJECT ---
if ($action === 'add') {
    $title = isset($_POST['title']) ? trim($_POST['title']) : '';
    $industry = isset($_POST['industry']) ? trim($_POST['industry']) : '';
    $overview = isset($_POST['overview']) ? trim($_POST['overview']) : '';
    $highlightsInput = isset($_POST['highlights']) ? $_POST['highlights'] : '';
    $techTagsInput = isset($_POST['tech_tags']) ? $_POST['tech_tags'] : '';
    $customImageUrl = isset($_POST['image_url']) ? trim($_POST['image_url']) : '';

    if (empty($title) || empty($industry) || empty($overview)) {
        echo json_encode(['success' => false, 'message' => 'Title, Industry, and Overview fields are required.']);
        exit;
    }

    // Process image
    $uploadedPath = handleImageUpload('project_image');
    if ($uploadedPath) {
        $imageUrl = $uploadedPath;
    } elseif (!empty($customImageUrl)) {
        $imageUrl = $customImageUrl;
    } else {
        $imageUrl = 'assets/images/hero_preview.png';
    }

    // Process Highlights (support array or newline string)
    if (is_array($highlightsInput)) {
        $highlightsArr = $highlightsInput;
    } else {
        $highlightsArr = array_values(array_filter(array_map('trim', explode("\n", $highlightsInput))));
    }
    if (empty($highlightsArr)) {
        $highlightsArr = ['High conversion landing page design', 'Fully responsive & mobile optimized'];
    }

    // Process Tech Tags (support array or comma-separated string)
    if (is_array($techTagsInput)) {
        $techTagsArr = $techTagsInput;
    } else {
        $techTagsArr = array_values(array_filter(array_map('trim', explode(',', $techTagsInput))));
    }
    if (empty($techTagsArr)) {
        $techTagsArr = ['HTML5', 'CSS3', 'JavaScript'];
    }

    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title)) . '-' . rand(100, 999);
    $highlightsJson = json_encode($highlightsArr);
    $techTagsJson = json_encode($techTagsArr);
    $orderNum = time();

    $newId = null;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("INSERT INTO `projects` (slug, title, industry, image_url, overview, highlights, tech_tags, order_num) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$slug, $title, $industry, $imageUrl, $overview, $highlightsJson, $techTagsJson, $orderNum]);
            $newId = $pdo->lastInsertId();
        } catch (Exception $e) {
            error_log("Admin Add Error: " . $e->getMessage());
        }
    }

    // Sync fallback JSON store
    $fallbackData = file_exists($fallbackPath) ? json_decode(file_get_contents($fallbackPath), true) : [];
    if (!is_array($fallbackData)) $fallbackData = [];
    
    $newProjectObj = [
        'id' => $newId ? (int)$newId : (count($fallbackData) + 1),
        'slug' => $slug,
        'title' => $title,
        'industry' => $industry,
        'image_url' => $imageUrl,
        'overview' => $overview,
        'highlights' => $highlightsArr,
        'tech_tags' => $techTagsArr,
        'order_num' => $orderNum
    ];
    $fallbackData[] = $newProjectObj;
    syncFallbackJson($fallbackData);

    echo json_encode([
        'success' => true,
        'message' => "Project '{$title}' added successfully!",
        'project' => $newProjectObj
    ]);
    exit;
}

// --- 3. DELETE PROJECT ---
if ($action === 'delete') {
    $id = isset($_REQUEST['id']) ? (int)$_REQUEST['id'] : 0;
    $slug = isset($_REQUEST['slug']) ? trim($_REQUEST['slug']) : '';

    if ($id <= 0 && empty($slug)) {
        echo json_encode(['success' => false, 'message' => 'Valid project ID or slug is required.']);
        exit;
    }

    if ($pdo) {
        try {
            if ($id > 0) {
                $stmt = $pdo->prepare("DELETE FROM `projects` WHERE id = ?");
                $stmt->execute([$id]);
            } else {
                $stmt = $pdo->prepare("DELETE FROM `projects` WHERE slug = ?");
                $stmt->execute([$slug]);
            }
        } catch (Exception $e) {
            error_log("Admin Delete Error: " . $e->getMessage());
        }
    }

    // Sync fallback JSON store
    if (file_exists($fallbackPath)) {
        $fallbackData = json_decode(file_get_contents($fallbackPath), true) ?: [];
        $updatedData = array_filter($fallbackData, function($p) use ($id, $slug) {
            if ($id > 0 && isset($p['id']) && $p['id'] == $id) return false;
            if (!empty($slug) && isset($p['slug']) && $p['slug'] == $slug) return false;
            return true;
        });
        syncFallbackJson($updatedData);
    }

    echo json_encode(['success' => true, 'message' => 'Project removed successfully!']);
    exit;
}

// Default response
echo json_encode(['success' => false, 'message' => 'Invalid action.']);
