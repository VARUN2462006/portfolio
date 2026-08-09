-- AKAAR Studio Database Schema

CREATE DATABASE IF NOT EXISTS `akaar_studio` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `akaar_studio`;

-- Admin users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user: varun / 1008
INSERT INTO `users` (`username`, `password`)
VALUES ('varun', '$2y$10$L04yzSvBley5BWWxSu8QJufcqzZu2RaEZLTSTuAjaoCfXMz0gUT7a')
ON DUPLICATE KEY UPDATE `username`=`username`;

-- Projects table
CREATE TABLE IF NOT EXISTS `projects` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial projects
INSERT INTO `projects` (`slug`, `title`, `industry`, `image_url`, `overview`, `highlights`, `tech_tags`, `order_num`) VALUES
('aurelia', 'Aurelia', 'E-Commerce / Skincare', 'assets/images/project_aurelia.png', 'A high-end landing page created for a luxury botanical skincare line. Designed to evoke calm, elegance, and uncompromised quality.', '["Editorial visual layout showcasing natural ingredients", "Interactive product ingredient hotspot explorer", "Clean conversion funnel targeting high-LTV customers", "Subtle glassmorphic cards and warm neutral tones"]', '["HTML5", "CSS3 Custom Variables", "Vanilla JS", "PHP Contact Endpoint"]', 1),
('forge', 'Forge', 'Health & Fitness', 'assets/images/project_forge.png', 'An aggressive, conversion-optimized landing page designed for a boutique gym & elite athletic coaching platform.', '["Dynamic workout schedule preview widget", "High-contrast dark mode aesthetic with electric accents", "Interactive membership plan estimator", "Zero layout shift, 99+ Lighthouse performance baseline"]', '["HTML5", "CSS Flexbox & Grid", "JavaScript UI Controls"]', 2),
('nexa', 'Nexa', 'B2B Software / SaaS', 'assets/images/project_nexa.png', 'A sleek, conversion-oriented product showcase designed for an enterprise AI analytics application.', '["Interactive metrics preview and feature comparison table", "Clear call-to-action hierarchy for free-trial signups", "Responsive metric dashboard preview mockup", "Optimized load times under 0.8 seconds"]', '["HTML5", "CSS3 Systems", "Vanilla JavaScript", "MySQL Data Capture"]', 3),
('casa', 'Casa', 'Luxury Real Estate', 'assets/images/project_casa.png', 'A minimalist, spacious landing page designed for prime luxury residential properties and architectural tours.', '["Full-width high-resolution architectural photo galleries", "Direct private tour booking inquiry trigger", "Subtle micro-interactions on scroll and hover", "Accessible semantic markup for global buyers"]', '["HTML5", "CSS Grid & Flex", "JavaScript Lightbox"]', 4),
('weather-forecast', 'Weather Forecast App', 'Web Application / Weather API', 'assets/images/project_weather.png', 'A real-time, interactive weather forecast application featuring dynamic city search, live climate telemetry, °C / °F temperature toggling, and 5-day daily forecasts.', '["Live real-time city search & climate telemetry rendering", "Interactive °C / °F temperature unit toggling", "Animated weather condition vectors (Sun, Rain, Clouds, Thunderstorm)", "5-Day forecast cards with humidity, wind speed, and UV index stats"]', '["HTML5", "CSS3 Glassmorphism", "Vanilla JavaScript", "OpenWeather Engine"]', 5)
ON DUPLICATE KEY UPDATE `slug`=`slug`;

-- Contact inquiries table
CREATE TABLE IF NOT EXISTS `contacts` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
