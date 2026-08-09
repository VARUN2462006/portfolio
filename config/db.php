<?php
/**
 * Database Configuration & Connection (PDO)
 * AKAAR Studio
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'akaar_studio');
define('DB_USER', 'root');
define('DB_PASS', '');

function getDbConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            // Connect to server to ensure database exists
            $dsnNoDb = "mysql:host=" . DB_HOST . ";charset=utf8mb4";
            $pdoNoDb = new PDO($dsnNoDb, DB_USER, DB_PASS, $options);
            $pdoNoDb->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
            
            // Connect to akaar_studio database
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

            // Initialize tables automatically if needed
            initDbTables($pdo);

        } catch (PDOException $e) {
            error_log("DB Connection Error: " . $e->getMessage());
            return null;
        }
    }
    
    return $pdo;
}

function initDbTables($pdo) {
    try {
        // Users Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `username` VARCHAR(50) UNIQUE NOT NULL,
            `password` VARCHAR(255) NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // Ensure default admin user varun / 1008 exists
        $stmt = $pdo->prepare("SELECT id FROM `users` WHERE username = 'varun'");
        $stmt->execute();
        if (!$stmt->fetch()) {
            $hash = password_hash('1008', PASSWORD_DEFAULT);
            $stmtInsert = $pdo->prepare("INSERT INTO `users` (username, password) VALUES ('varun', ?)");
            $stmtInsert->execute([$hash]);
        }

        // Projects Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS `projects` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `slug` VARCHAR(100) UNIQUE NOT NULL,
            `title` VARCHAR(150) NOT NULL,
            `industry` VARCHAR(100) NOT NULL,
            `image_url` VARCHAR(255) NOT NULL,
            `overview` TEXT NOT NULL,
            `highlights` TEXT NOT NULL,
            `tech_tags` TEXT NOT NULL,
            `order_num` INT DEFAULT 0,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

        // Seed projects if table is empty
        $stmtProj = $pdo->query("SELECT COUNT(*) FROM `projects`");
        if ($stmtProj && $stmtProj->fetchColumn() == 0) {
            $initialProjects = [
                [
                    'slug' => 'aurelia',
                    'title' => 'Aurelia',
                    'industry' => 'E-Commerce / Skincare',
                    'image_url' => 'assets/images/project_aurelia.png',
                    'overview' => 'A high-end landing page created for a luxury botanical skincare line. Designed to evoke calm, elegance, and uncompromised quality.',
                    'highlights' => json_encode(["Editorial visual layout showcasing natural ingredients", "Interactive product ingredient hotspot explorer", "Clean conversion funnel targeting high-LTV customers", "Subtle glassmorphic cards and warm neutral tones"]),
                    'tech_tags' => json_encode(["HTML5", "CSS3 Custom Variables", "Vanilla JS", "PHP Contact Endpoint"]),
                    'order_num' => 1
                ],
                [
                    'slug' => 'forge',
                    'title' => 'Forge',
                    'industry' => 'Health & Fitness',
                    'image_url' => 'assets/images/project_forge.png',
                    'overview' => 'An aggressive, conversion-optimized landing page designed for a boutique gym & elite athletic coaching platform.',
                    'highlights' => json_encode(["Dynamic workout schedule preview widget", "High-contrast dark mode aesthetic with electric accents", "Interactive membership plan estimator", "Zero layout shift, 99+ Lighthouse performance baseline"]),
                    'tech_tags' => json_encode(["HTML5", "CSS Flexbox & Grid", "JavaScript UI Controls"]),
                    'order_num' => 2
                ],
                [
                    'slug' => 'nexa',
                    'title' => 'Nexa',
                    'industry' => 'B2B Software / SaaS',
                    'image_url' => 'assets/images/project_nexa.png',
                    'overview' => 'A sleek, conversion-oriented product showcase designed for an enterprise AI analytics application.',
                    'highlights' => json_encode(["Interactive metrics preview and feature comparison table", "Clear call-to-action hierarchy for free-trial signups", "Responsive metric dashboard preview mockup", "Optimized load times under 0.8 seconds"]),
                    'tech_tags' => json_encode(["HTML5", "CSS3 Systems", "Vanilla JavaScript", "MySQL Data Capture"]),
                    'order_num' => 3
                ],
                [
                    'slug' => 'casa',
                    'title' => 'Casa',
                    'industry' => 'Luxury Real Estate',
                    'image_url' => 'assets/images/project_casa.png',
                    'overview' => 'A minimalist, spacious landing page designed for prime luxury residential properties and architectural tours.',
                    'highlights' => json_encode(["Full-width high-resolution architectural photo galleries", "Direct private tour booking inquiry trigger", "Subtle micro-interactions on scroll and hover", "Accessible semantic markup for global buyers"]),
                    'tech_tags' => json_encode(["HTML5", "CSS Grid & Flex", "JavaScript Lightbox"]),
                    'order_num' => 4
                ]
            ];

            $insertStmt = $pdo->prepare("INSERT INTO `projects` (slug, title, industry, image_url, overview, highlights, tech_tags, order_num) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($initialProjects as $p) {
                $insertStmt->execute([$p['slug'], $p['title'], $p['industry'], $p['image_url'], $p['overview'], $p['highlights'], $p['tech_tags'], $p['order_num']]);
            }
        }

        // Contacts Table
        $pdo->exec("CREATE TABLE IF NOT EXISTS `contacts` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `name` VARCHAR(100) NOT NULL,
            `email` VARCHAR(150) NOT NULL,
            `project_type` VARCHAR(50) NOT NULL,
            `message` TEXT NOT NULL,
            `ip_address` VARCHAR(45) DEFAULT NULL,
            `status` ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_email` (`email`),
            INDEX `idx_created_at` (`created_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    } catch (PDOException $e) {
        error_log("Table initialization error: " . $e->getMessage());
    }
}
