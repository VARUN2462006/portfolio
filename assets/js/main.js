/**
 * AKAAR STUDIO — Main JavaScript
 * Interactive controls, animations, project modals, AJAX form handler.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileDrawer();
  initScrollReveal();
  initProcessHighlight();
  initProjectModals();
  initContactForm();
  initAdminNotice();
});

/* --------------------------------------------------------------------------
   1. Navbar Scroll Shrink & Active Tracking
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar-wrapper');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check

  // Active section nav link observer
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));
}

/* --------------------------------------------------------------------------
   2. Mobile Drawer Navigation
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const drawerLinks = document.querySelectorAll('.mobile-drawer-link, .mobile-drawer-cta');

  if (!toggleBtn || !drawer) return;

  const toggleDrawer = () => {
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('open');
      toggleBtn.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    } else {
      drawer.classList.add('open');
      toggleBtn.classList.add('open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  };

  toggleBtn.addEventListener('click', toggleDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (drawer.classList.contains('open')) {
        toggleDrawer();
      }
    });
  });
}

/* --------------------------------------------------------------------------
   3. Scroll Reveal Animations (IntersectionObserver)
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length === 0) return;

  const revealAllVisible = () => {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 150 && rect.bottom > -150) {
        el.classList.add('revealed');
      }
    });
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '100px 0px 100px 0px',
    threshold: 0
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // Trigger immediate visibility check for hash links and on-screen elements
  revealAllVisible();
  window.addEventListener('scroll', revealAllVisible, { passive: true });
  window.addEventListener('touchmove', revealAllVisible, { passive: true });
  window.addEventListener('hashchange', () => setTimeout(revealAllVisible, 50));
  setTimeout(revealAllVisible, 100);
  setTimeout(revealAllVisible, 400);
}

/* --------------------------------------------------------------------------
   4. Process Steps Active Scroll Highlight
   -------------------------------------------------------------------------- */
function initProcessHighlight() {
  const processCards = document.querySelectorAll('.process-step-card');
  if (processCards.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.3
  });

  processCards.forEach(card => observer.observe(card));
}

/* --------------------------------------------------------------------------
   5. Concept Project Details Modal
   -------------------------------------------------------------------------- */
let dynamicProjectsMap = {};

function initProjectModals() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalIndustry = document.getElementById('modalIndustry');
  const modalImg = document.getElementById('modalImg');
  const modalDesc = document.getElementById('modalDesc');
  const modalHighlights = document.getElementById('modalHighlights');
  const modalTech = document.getElementById('modalTech');

  if (!modal) return;

  // Load project map from localStorage, window global or API
  const loadProjectsData = () => {
    let projectsList = [];
    const saved = localStorage.getItem('akaar_portfolio_projects');
    if (saved) {
      try { projectsList = JSON.parse(saved); } catch(e){}
    }
    if (!Array.isArray(projectsList) || projectsList.length === 0) {
      projectsList = window.INITIAL_PROJECTS || [];
    }

    dynamicProjectsMap = {};
    projectsList.forEach(p => {
      dynamicProjectsMap[p.slug] = p;
    });

    renderDynamicHomepageProjects(projectsList);
  };

  loadProjectsData();

  // Use Event Delegation so newly added project cards work seamlessly
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-project-trigger]');
    if (!trigger) return;

    e.preventDefault();
    const key = trigger.getAttribute('data-project-trigger');
    const data = dynamicProjectsMap[key];

    if (data) {
      modalTitle.textContent = data.title;
      modalIndustry.textContent = data.industry;
      modalImg.src = data.image_url;
      modalImg.alt = data.title;
      modalDesc.textContent = data.overview;

      const highlights = Array.isArray(data.highlights) ? data.highlights : [];
      const techTags = Array.isArray(data.tech_tags) ? data.tech_tags : [];

      // Render highlights
      modalHighlights.innerHTML = highlights.map(h => `<li style="margin-bottom: 0.4rem; color: var(--text-secondary);">• ${h}</li>`).join('');

      // Render tech tags
      modalTech.innerHTML = techTags.map(t => `<span class="tech-tag">${t}</span>`).join('');

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* --------------------------------------------------------------------------
   6. Contact Form AJAX & Static Mailto Submission
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusBox = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset status box
    statusBox.className = 'form-status';
    statusBox.style.display = 'none';

    // Get input values
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const projectType = form.project_type.value;
    const message = form.message.value.trim();

    // Client-side quick check
    if (!name || name.length < 2) {
      showStatus('Please enter your name.', 'error');
      return;
    }
    if (!email || !email.includes('@')) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }
    if (!projectType) {
      showStatus('Please select a project type.', 'error');
      return;
    }
    if (!message || message.length < 10) {
      showStatus('Please include a short message (at least 10 characters).', 'error');
      return;
    }

    // Disable button & loading feedback
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = `<span>Sending Message...</span>`;

    let submittedViaApi = false;

    try {
      const response = await fetch('api/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          project_type: projectType,
          message: message
        })
      });

      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.success) {
          showStatus(data.message || 'Thank you! Your message has been sent successfully.', 'success');
          form.reset();
          submittedViaApi = true;
        } else {
          showStatus(data.message || 'An error occurred while submitting. Please try again.', 'error');
          submittedViaApi = true;
        }
      }
    } catch (err) {
      console.log('PHP API endpoint unavailable. Falling back to direct email handler.', err);
    }

    if (!submittedViaApi) {
      // Fallback for GitHub Pages static hosting
      triggerMailtoFallback(name, email, projectType, message);
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
  });

  function triggerMailtoFallback(name, email, projectType, message) {
    const subject = encodeURIComponent(`[AKAAR Inquiry] ${projectType} - ${name}`);
    const body = encodeURIComponent(`Hello AKAAR Studio,\n\nName: ${name}\nEmail: ${email}\nProject Type: ${projectType}\n\nProject Details:\n${message}\n\nSent via AKAAR Studio Portfolio`);
    const mailtoUrl = `mailto:atahwalevarun779@gmail.com?subject=${subject}&body=${body}`;

    showStatus(`Thank you ${name}! Opening your email app to send your inquiry directly to atahwalevarun779@gmail.com...`, 'success');
    form.reset();

    setTimeout(() => {
      window.location.href = mailtoUrl;
    }, 600);
  }

  function showStatus(msg, type) {
    statusBox.textContent = msg;
    statusBox.className = `form-status ${type}`;
    statusBox.style.display = 'block';
  }
}

/* --------------------------------------------------------------------------
   7. Dynamic Homepage Projects Grid Rendering
   -------------------------------------------------------------------------- */
function renderDynamicHomepageProjects(projectsList) {
  const grid = document.getElementById('projectsGrid');
  if (!grid || !Array.isArray(projectsList) || projectsList.length === 0) return;

  grid.innerHTML = projectsList.map(p => {
    const techTags = Array.isArray(p.tech_tags) ? p.tech_tags : [];
    const techHtml = techTags.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
    const imgSrc = p.image_url.startsWith('http') || p.image_url.startsWith('/') || p.image_url.startsWith('assets')
      ? p.image_url
      : 'assets/images/' + p.image_url;

    return `
      <article class="project-card reveal-on-scroll revealed">
        <div class="project-img-box">
          <span class="concept-badge">Portfolio Project</span>
          <img src="${imgSrc}" alt="${escapeHtml(p.title)}" loading="lazy" onerror="this.src='assets/images/hero_preview.png'">
        </div>
        <div class="project-info">
          <div class="project-meta">
            <span class="project-industry">${escapeHtml(p.industry)}</span>
          </div>
          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          <p class="project-desc">${escapeHtml(p.overview || '')}</p>
          <div class="project-tech-tags">
            ${techHtml}
          </div>
          <div class="project-footer">
            <button class="btn-card-action" data-project-trigger="${escapeHtml(p.slug)}">
              <span>View Project Details</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initAdminNotice() {
  // Navigation to admin/ is automatically resolved to admin/index.html on GitHub Pages / static hosts,
  // and admin/index.php on local PHP servers.
}

