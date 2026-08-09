<?php
/**
 * Public Projects API Endpoint
 * Fetches all portfolio projects from database or fallback file.
 * AKAAR Studio
 */

require_once __DIR__ . '/../config/db.php';

function getProjectsList() {
    $pdo = getDbConnection();
    $projects = [];

    if ($pdo) {
        try {
            $stmt = $pdo->query("SELECT * FROM `projects` ORDER BY order_num ASC, id DESC");
            $rows = $stmt->fetchAll();

            foreach ($rows as $r) {
                $highlights = json_decode($r['highlights'], true);
                if (!is_array($highlights)) {
                    $highlights = array_filter(array_map('trim', explode("\n", $r['highlights'])));
                }

                $tech_tags = json_decode($r['tech_tags'], true);
                if (!is_array($tech_tags)) {
                    $tech_tags = array_filter(array_map('trim', explode(",", $r['tech_tags'])));
                }

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
            error_log("Projects Fetch Error: " . $e->getMessage());
        }
    }

    if (empty($projects)) {
        $fallbackPath = __DIR__ . '/../config/projects_data.json';
        if (file_exists($fallbackPath)) {
            $jsonContent = file_get_contents($fallbackPath);
            $projects = json_decode($jsonContent, true) ?: [];
        }
    }

    return $projects;
}

// Only output JSON if called directly as API endpoint via HTTP request
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'projects.php') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => true,
        'projects' => getProjectsList()
    ]);
    exit;
}
