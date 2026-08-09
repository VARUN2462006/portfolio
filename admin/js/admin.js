/**
 * AKAAR STUDIO — Admin Panel JavaScript
 * Handles AJAX authentication, Project CRUD operations, and Inquiries.
 */

document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initDashboard();
  initAddProjectModal();
});

/* --- 1. LOGIN HANDLER --- */
function initLogin() {
  const loginForm = document.getElementById('loginForm');
  const alertBox = document.getElementById('loginAlert');

  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value.trim();

    if (!usernameInput || !passwordInput) {
      showAlert(alertBox, 'Please fill in both Username and Password.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Authenticating...';
    showAlert(alertBox, '', 'hide');

    try {
      const response = await fetch('../api/auth.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const data = await response.json();

      if (data.success) {
        showAlert(alertBox, 'Access Granted! Redirecting...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showAlert(alertBox, data.message || 'Invalid username or password.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login to Dashboard';
      }
    } catch (err) {
      console.error('Login error:', err);
      showAlert(alertBox, 'Network error. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login to Dashboard';
    }
  });
}

function showAlert(box, msg, type) {
  if (!box) return;
  if (type === 'hide') {
    box.style.display = 'none';
    box.textContent = '';
    return;
  }
  box.textContent = msg;
  box.className = `alert-message alert-${type}`;
  box.style.display = 'block';
}

/* --- 2. DASHBOARD DATA LOADER --- */
let loadedProjects = [];

async function initDashboard() {
  const tableBody = document.getElementById('projectsTableBody');
  if (!tableBody) return; // Not on dashboard page

  // Attach logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch('../api/auth.php?action=logout');
        window.location.reload();
      } catch (err) {
        window.location.reload();
      }
    });
  }

  await loadProjects();
  await loadInquiries();
}

async function loadProjects() {
  const tableBody = document.getElementById('projectsTableBody');
  const countBadge = document.getElementById('statProjectCount');
  if (!tableBody) return;

  try {
    const response = await fetch('../api/admin_projects.php?action=list');
    if (response.status === 401) {
      window.location.reload();
      return;
    }
    const data = await response.json();

    if (data.success && Array.isArray(data.projects)) {
      loadedProjects = data.projects;
      if (countBadge) countBadge.textContent = loadedProjects.length;

      if (loadedProjects.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No projects added yet. Click "+ Add New Project" to create one.</td></tr>`;
        return;
      }

      tableBody.innerHTML = loadedProjects.map((p, idx) => {
        const imageSrc = p.image_url.startsWith('http') || p.image_url.startsWith('/') || p.image_url.startsWith('assets')
          ? '../' + p.image_url
          : '../assets/images/' + p.image_url;

        const techTagsHtml = (p.tech_tags || []).map(t => `<span class="badge-tag">${t}</span>`).join('');

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <img src="${imageSrc}" alt="${p.title}" class="proj-thumb" onerror="this.src='../assets/images/hero_preview.png'">
                <div>
                  <strong style="display: block; color: var(--text-main); font-size: 0.95rem;">${escapeHtml(p.title)}</strong>
                  <span style="font-size: 0.78rem; color: var(--text-dim);">${escapeHtml(p.slug)}</span>
                </div>
              </div>
            </td>
            <td><span class="badge-tag" style="background: rgba(99,102,241,0.15); color: var(--accent-cyan); border-color: rgba(99,102,241,0.3);">${escapeHtml(p.industry)}</span></td>
            <td><div style="max-width: 250px;">${techTagsHtml}</div></td>
            <td style="color: var(--text-muted); font-size: 0.85rem;">${(p.highlights || []).length} highlights</td>
            <td>
              <div class="action-btns">
                <button class="btn-icon-action btn-delete" title="Remove Project" onclick="deleteProject(${p.id}, '${escapeJsString(p.title)}')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

async function loadInquiries() {
  const inquiriesBody = document.getElementById('inquiriesTableBody');
  const statCount = document.getElementById('statInquiryCount');
  if (!inquiriesBody) return;

  try {
    const response = await fetch('../api/inquiries.php');
    if (response.status === 401) return;
    const data = await response.json();

    if (data.success && Array.isArray(data.inquiries)) {
      if (statCount) statCount.textContent = data.inquiries.length;

      if (data.inquiries.length === 0) {
        inquiriesBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No client inquiries logged yet.</td></tr>`;
        return;
      }

      inquiriesBody.innerHTML = data.inquiries.map(inq => `
        <tr>
          <td><strong>${escapeHtml(inq.name)}</strong></td>
          <td><a href="mailto:${escapeHtml(inq.email)}?subject=Re:%20Inquiry%20from%20AKAAR%20Studio" style="color: var(--accent-cyan); text-decoration: none;">${escapeHtml(inq.email)}</a></td>
          <td><span class="badge-tag">${escapeHtml(inq.project_type)}</span></td>
          <td style="max-width: 280px; color: var(--text-muted); font-size: 0.88rem;">${escapeHtml(inq.message)}</td>
          <td style="font-size: 0.8rem; color: var(--text-dim);">${inq.created_at || 'Just now'}</td>
          <td>
            <a href="mailto:${escapeHtml(inq.email)}?subject=Re:%20${encodeURIComponent(inq.project_type)}%20Inquiry%20-%20AKAAR%20Studio&body=Hi%20${encodeURIComponent(inq.name)},%0A%0AThank%20you%20for%20reaching%20out%20to%20AKAAR%20Studio!%0A%0ARegarding%20your%20message:%0A%22${encodeURIComponent(inq.message)}%22%0A%0ABest%20regards,%0AVarun%20(AKAAR%20Studio)" class="btn-header" style="font-size: 0.78rem; padding: 0.35rem 0.65rem; background: var(--accent); color: #fff; border: none; text-decoration: none; border-radius: 6px; display: inline-flex; align-items: center; gap: 0.3rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span>Reply</span>
            </a>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load inquiries:', err);
  }
}

/* --- 3. ADD PROJECT MODAL & FORM --- */
function initAddProjectModal() {
  const modal = document.getElementById('addProjectModal');
  const openBtn = document.getElementById('openAddModalBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('addProjectForm');
  const alertBox = document.getElementById('modalAlert');

  if (!modal || !form) return;

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      form.reset();
      showAlert(alertBox, '', 'hide');
      modal.classList.add('active');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving Project...';
    showAlert(alertBox, '', 'hide');

    try {
      const response = await fetch('../api/admin_projects.php?action=add', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        showAlert(alertBox, data.message || 'Project added successfully!', 'success');
        setTimeout(() => {
          modal.classList.remove('active');
          loadProjects();
        }, 800);
      } else {
        showAlert(alertBox, data.message || 'Failed to add project.', 'error');
      }
    } catch (err) {
      console.error('Add project error:', err);
      showAlert(alertBox, 'Error creating project.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create & Publish Project';
    }
  });
}

/* --- 4. DELETE PROJECT HANDLER --- */
async function deleteProject(id, title) {
  if (!confirm(`Are you sure you want to remove the project "${title}"?`)) {
    return;
  }

  try {
    const response = await fetch(`../api/admin_projects.php?action=delete&id=${id}`, {
      method: 'POST'
    });
    const data = await response.json();

    if (data.success) {
      loadProjects();
    } else {
      alert(data.message || 'Could not delete project.');
    }
  } catch (err) {
    console.error('Delete error:', err);
    alert('Error deleting project.');
  }
}

// Utility Helpers
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJsString(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'");
}
