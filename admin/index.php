<?php
/**
 * AKAAR STUDIO — Protected Admin Gateway & Control Panel
 * Secure session check ensures unauthenticated users cannot access management tools.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$isLoggedIn = isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
$adminUser  = $isLoggedIn ? $_SESSION['admin_user'] : null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $isLoggedIn ? 'Admin Dashboard — AKAAR STUDIO' : 'Admin Login — AKAAR STUDIO'; ?></title>
    <link rel="stylesheet" href="css/admin.css">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%2312141D'/><path d='M50 18L18 82H36L50 51L64 82H82L50 18Z' fill='%236366F1'/><path d='M34 60H66' stroke='%2338BDF8' stroke-width='7' stroke-linecap='round'/></svg>">
</head>
<body>

<?php if (!$isLoggedIn): ?>
    <!-- ==========================================================================
         SECURE LOGIN SCREEN (UNAUTHENTICATED)
         ========================================================================== -->
    <div class="login-wrapper">
        <div class="login-card">
            <div class="login-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h1 class="login-title">Admin Access</h1>
            <p class="login-sub">Protected Portal • Please enter your credentials to manage AKAAR Studio projects.</p>

            <div id="loginAlert" class="alert-message"></div>

            <form id="loginForm" autocomplete="off">
                <div class="form-group">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" id="username" name="username" class="form-input" placeholder="Enter username..." required autofocus>
                </div>

                <div class="form-group" style="margin-bottom: 1.75rem;">
                    <label for="password" class="form-label">Password</label>
                    <input type="password" id="password" name="password" class="form-input" placeholder="Enter password..." required>
                </div>

                <button type="submit" class="btn-primary-admin">
                    <span>Login to Dashboard</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
            </form>
        </div>
    </div>
    <script src="js/admin.js"></script>

<?php else: ?>
    <!-- ==========================================================================
         PROTECTED ADMIN DASHBOARD (AUTHENTICATED AS VARUN)
         ========================================================================== -->
    <div class="admin-container">
        <!-- Top Navbar -->
        <header class="admin-header">
            <a href="#" class="brand-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L3 20H8.5L12 12.5L15.5 20H21L12 3Z" fill="url(#akaar-admin-logo)"/>
                    <path d="M8.5 15.5H15.5" stroke="#38BDF8" stroke-width="2" stroke-linecap="round"/>
                    <defs>
                        <linearGradient id="akaar-admin-logo" x1="3" y1="3" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                            <stop stop-color="#6366F1"/>
                            <stop offset="1" stop-color="#38BDF8"/>
                        </linearGradient>
                    </defs>
                </svg>
                <span>AKAAR STUDIO</span>
                <span class="brand-badge">Admin</span>
            </a>

            <div class="header-actions">
                <span style="font-size: 0.85rem; color: var(--text-muted);">Logged in as <strong style="color: var(--accent-cyan);"><?php echo htmlspecialchars($adminUser); ?></strong></span>
                <button id="logoutBtn" class="btn-header btn-logout">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span>Logout</span>
                </button>
            </div>
        </header>

        <!-- Stats Overview -->
        <div class="dashboard-grid">
            <div class="stat-card">
                <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div>
                    <div id="statProjectCount" class="stat-val">0</div>
                    <div class="stat-label">Active Portfolio Projects</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon" style="color: #10B981; background: rgba(16, 185, 129, 0.12);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                    <div id="statInquiryCount" class="stat-val">0</div>
                    <div class="stat-label">Client Form Inquiries</div>
                </div>
            </div>
        </div>

        <!-- Section 1: Portfolio Projects Management -->
        <div class="section-header">
            <div>
                <h2 class="section-heading">Manage Portfolio Projects</h2>
                <p style="color: var(--text-muted); font-size: 0.88rem;">Add, inspect, or remove project cards published on your portfolio homepage.</p>
            </div>
            <button id="openAddModalBtn" class="btn-header" style="background: var(--accent-gradient); color: #FFF; border: none; font-weight: 600;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                <span>+ Add New Project</span>
            </button>
        </div>

        <!-- Projects Table -->
        <div class="projects-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>Industry / Category</th>
                        <th>Tech Stack</th>
                        <th>Highlights</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="projectsTableBody">
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">Loading portfolio projects...</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Section 2: Contact Form Submissions -->
        <div class="section-header" style="margin-top: 3rem;">
            <div>
                <h2 class="section-heading">Client Inquiries</h2>
                <p style="color: var(--text-muted); font-size: 0.88rem;">Messages sent through the website contact form.</p>
            </div>
        </div>

        <div class="projects-table-wrap">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Client Name</th>
                        <th>Email</th>
                        <th>Project Type</th>
                        <th>Message</th>
                        <th>Date</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="inquiriesTableBody">
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Loading client inquiries...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- ==========================================================================
         ADD NEW PROJECT MODAL
         ========================================================================== -->
    <div id="addProjectModal" class="modal-admin-overlay">
        <div class="modal-admin-card">
            <div class="modal-header">
                <h3 style="font-family: var(--font-heading); font-size: 1.25rem;">+ Add New Project Card</h3>
                <button id="closeModalBtn" class="modal-close">&times;</button>
            </div>

            <div id="modalAlert" class="alert-message"></div>

            <form id="addProjectForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="title" class="form-label">Project Title *</label>
                    <input type="text" id="title" name="title" class="form-input" placeholder="e.g. Zenith Analytics" required>
                </div>

                <div class="form-group">
                    <label for="industry" class="form-label">Industry / Category *</label>
                    <input type="text" id="industry" name="industry" class="form-input" placeholder="e.g. E-Commerce / SaaS / Mobile App" required>
                </div>

                <div class="form-group">
                    <label for="project_image" class="form-label">Project Image (Upload File)</label>
                    <input type="file" id="project_image" name="project_image" class="form-input" accept="image/*">
                </div>

                <div class="form-group">
                    <label for="image_url" class="form-label">Or Image Path / URL (Optional)</label>
                    <input type="text" id="image_url" name="image_url" class="form-input" placeholder="assets/images/project_aurelia.png">
                </div>

                <div class="form-group">
                    <label for="overview" class="form-label">Project Overview / Description *</label>
                    <textarea id="overview" name="overview" class="form-textarea" rows="3" placeholder="Brief explanation of the project design and conversion goals..." required></textarea>
                </div>

                <div class="form-group">
                    <label for="highlights" class="form-label">Key Conversion Highlights (One bullet point per line)</label>
                    <textarea id="highlights" name="highlights" class="form-textarea" rows="3" placeholder="High-converting visual layout&#10;Interactive metrics dashboard&#10;Zero layout shift, 99+ performance"></textarea>
                </div>

                <div class="form-group" style="margin-bottom: 1.75rem;">
                    <label for="tech_tags" class="form-label">Technologies Used (Comma-separated)</label>
                    <input type="text" id="tech_tags" name="tech_tags" class="form-input" placeholder="HTML5, CSS3, JavaScript, PHP, MySQL">
                </div>

                <button type="submit" class="btn-primary-admin">
                    <span>Create & Publish Project</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
            </form>
        </div>
    </div>

    <script src="js/admin.js"></script>
<?php endif; ?>

</body>
</html>
