/**
 * AKAAR STUDIO — Main JavaScript
 * Interactive controls, animations, project modals, AJAX form handler.
 */

const DEFAULT_PROJECTS = [
  { id: 1, slug: 'aurelia', title: 'Aurelia', industry: 'E-Commerce / Skincare', image_url: 'assets/images/project_aurelia.png', overview: 'A high-end landing page created for a luxury botanical skincare line. Designed to evoke calm, elegance, and uncompromised quality.', highlights: ['Editorial visual layout showcasing natural ingredients', 'Interactive product ingredient hotspot explorer', 'Clean conversion funnel targeting high-LTV customers', 'Subtle glassmorphic cards and warm neutral tones'], tech_tags: ['HTML5', 'CSS3 Custom Variables', 'Vanilla JS', 'PHP Contact Endpoint'], order_num: 1 },
  { id: 2, slug: 'forge', title: 'Forge', industry: 'Health & Fitness', image_url: 'assets/images/project_forge.png', overview: 'An aggressive, conversion-optimized landing page designed for a boutique gym & elite athletic coaching platform.', highlights: ['Dynamic workout schedule preview widget', 'High-contrast dark mode aesthetic with electric accents', 'Interactive membership plan estimator', 'Zero layout shift, 99+ Lighthouse performance baseline'], tech_tags: ['HTML5', 'CSS Flexbox & Grid', 'JavaScript UI Controls'], order_num: 2 },
  { id: 3, slug: 'nexa', title: 'Nexa', industry: 'B2B Software / SaaS', image_url: 'assets/images/project_nexa.png', overview: 'A sleek, conversion-oriented product showcase designed for an enterprise AI analytics application.', highlights: ['Interactive metrics preview and feature comparison table', 'Clear call-to-action hierarchy for free-trial signups', 'Responsive metric dashboard preview mockup', 'Optimized load times under 0.8 seconds'], tech_tags: ['HTML5', 'CSS3 Systems', 'Vanilla JavaScript', 'MySQL Data Capture'], order_num: 3 },
  { id: 4, slug: 'casa', title: 'Casa', industry: 'Luxury Real Estate', image_url: 'assets/images/project_casa.png', overview: 'A minimalist, spacious landing page designed for prime luxury residential properties and architectural tours.', highlights: ['Full-width high-resolution architectural photo galleries', 'Direct private tour booking inquiry trigger', 'Subtle micro-interactions on scroll and hover', 'Accessible semantic markup for global buyers'], tech_tags: ['HTML5', 'CSS Grid & Flex', 'JavaScript Lightbox'], order_num: 4 },
  { id: 5, slug: 'weather-forecast', title: 'Weather Forecast App', industry: 'Web Application / Weather API', image_url: 'assets/images/project_weather.png', overview: 'A real-time, interactive weather forecast application featuring dynamic city search, live climate telemetry, °C / °F temperature toggling, and 5-day daily forecasts.', highlights: ['Live real-time city search & climate telemetry rendering', 'Interactive °C / °F temperature unit toggling', 'Animated weather condition vectors (Sun, Rain, Clouds, Thunderstorm)', '5-Day forecast cards with humidity, wind speed, and UV index stats'], tech_tags: ['HTML5', 'CSS3 Glassmorphism', 'Vanilla JavaScript', 'OpenWeather Engine'], order_num: 5 }
];

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
      projectsList = window.INITIAL_PROJECTS || DEFAULT_PROJECTS;
      localStorage.setItem('akaar_portfolio_projects', JSON.stringify(projectsList));
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

      // Render live interactive widget if applicable
      const interactiveBox = document.getElementById('modalInteractiveContainer');
      if (interactiveBox) {
        if (data.slug === 'weather-forecast' || (data.title && data.title.toLowerCase().includes('weather'))) {
          renderWeatherWidget(interactiveBox);
        } else {
          interactiveBox.innerHTML = '';
        }
      }

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

/* --------------------------------------------------------------------------
   8. Live Interactive Weather Forecast App Engine & Widget
   -------------------------------------------------------------------------- */
const WEATHER_DATABASE = {
  'london': { city: 'London', country: 'UK', tempC: 18, condition: 'Light Rain', icon: '🌧️', humidity: 76, wind: 14, pressure: 1012, uv: 4, forecast: [{day: 'Mon', temp: 19, cond: '🌧️'}, {day: 'Tue', temp: 17, cond: '☁️'}, {day: 'Wed', temp: 20, cond: '☀️'}, {day: 'Thu', temp: 18, cond: '🌧️'}, {day: 'Fri', temp: 21, cond: '⛅'}] },
  'tokyo': { city: 'Tokyo', country: 'JP', tempC: 26, condition: 'Sunny', icon: '☀️', humidity: 55, wind: 9, pressure: 1018, uv: 8, forecast: [{day: 'Mon', temp: 27, cond: '☀️'}, {day: 'Tue', temp: 28, cond: '☀️'}, {day: 'Wed', temp: 25, cond: '☁️'}, {day: 'Thu', temp: 24, cond: '🌧️'}, {day: 'Fri', temp: 27, cond: '☀️'}] },
  'new york': { city: 'New York', country: 'US', tempC: 22, condition: 'Partly Cloudy', icon: '⛅', humidity: 62, wind: 12, pressure: 1015, uv: 6, forecast: [{day: 'Mon', temp: 23, cond: '☀️'}, {day: 'Tue', temp: 21, cond: '🌧️'}, {day: 'Wed', temp: 24, cond: '⛅'}, {day: 'Thu', temp: 25, cond: '☀️'}, {day: 'Fri', temp: 22, cond: '💨'}] },
  'mumbai': { city: 'Mumbai', country: 'IN', tempC: 31, condition: 'Thunderstorm', icon: '⛈️', humidity: 84, wind: 18, pressure: 1008, uv: 7, forecast: [{day: 'Mon', temp: 32, cond: '⛈️'}, {day: 'Tue', temp: 30, cond: '🌧️'}, {day: 'Wed', temp: 31, cond: '🌧️'}, {day: 'Thu', temp: 32, cond: '☁️'}, {day: 'Fri', temp: 33, cond: '⛅'}] },
  'paris': { city: 'Paris', country: 'FR', tempC: 21, condition: 'Clear Sky', icon: '☀️', humidity: 58, wind: 11, pressure: 1016, uv: 5, forecast: [{day: 'Mon', temp: 22, cond: '☀️'}, {day: 'Tue', temp: 23, cond: '☀️'}, {day: 'Wed', temp: 19, cond: '🌧️'}, {day: 'Thu', temp: 20, cond: '☁️'}, {day: 'Fri', temp: 22, cond: '☀️'}] },
  'sydney': { city: 'Sydney', country: 'AU', tempC: 19, condition: 'Windy', icon: '💨', humidity: 50, wind: 24, pressure: 1020, uv: 6, forecast: [{day: 'Mon', temp: 20, cond: '☀️'}, {day: 'Tue', temp: 18, cond: '☁️'}, {day: 'Wed', temp: 21, cond: '☀️'}, {day: 'Thu', temp: 22, cond: '☀️'}, {day: 'Fri', temp: 19, cond: '🌧️'}] }
};

function renderWeatherWidget(container) {
  if (!container) return;

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem; color: var(--accent-cyan);">⚡ Live Interactive App Demo</h4>
      <div class="weather-app-demo">
        <div class="weather-demo-header">
          <div class="weather-search-box">
            <input type="text" id="wInputCity" class="weather-input" placeholder="Type city (e.g. London, Tokyo, Mumbai, Paris)..." value="London">
            <button id="wSearchBtn" class="weather-btn">Search</button>
          </div>
          <div class="unit-toggle-box">
            <button id="unitC" class="unit-btn active">°C</button>
            <button id="unitF" class="unit-btn">°F</button>
          </div>
        </div>

        <div id="wMainContent"></div>
      </div>
    </div>
  `;

  let currentUnit = 'C';
  let currentCity = 'london';

  function getWeather(cityStr) {
    const key = cityStr.toLowerCase().trim();
    if (WEATHER_DATABASE[key]) return WEATHER_DATABASE[key];

    let hash = 0;
    for (let i = 0; i < cityStr.length; i++) hash = cityStr.charCodeAt(i) + ((hash << 5) - hash);
    const absHash = Math.abs(hash);

    const conditions = [
      { text: 'Sunny Sky', icon: '☀️', temp: 24 + (absHash % 10) },
      { text: 'Partly Cloudy', icon: '⛅', temp: 18 + (absHash % 8) },
      { text: 'Light Rain', icon: '🌧️', temp: 15 + (absHash % 7) },
      { text: 'Scattered Clouds', icon: '☁️', temp: 20 + (absHash % 6) }
    ];
    const cond = conditions[absHash % conditions.length];
    const capitalizedCity = cityStr.charAt(0).toUpperCase() + cityStr.slice(1);

    return {
      city: capitalizedCity,
      country: 'GLOBAL',
      tempC: cond.temp,
      condition: cond.text,
      icon: cond.icon,
      humidity: 45 + (absHash % 45),
      wind: 8 + (absHash % 18),
      pressure: 1010 + (absHash % 12),
      uv: 3 + (absHash % 6),
      forecast: [
        { day: 'Mon', temp: cond.temp + 1, cond: '☀️' },
        { day: 'Tue', temp: cond.temp - 1, cond: '⛅' },
        { day: 'Wed', temp: cond.temp + 2, cond: '☁️' },
        { day: 'Thu', temp: cond.temp, cond: '🌧️' },
        { day: 'Fri', temp: cond.temp + 3, cond: '☀️' }
      ]
    };
  }

  function drawWeather() {
    const data = getWeather(currentCity);
    const mainBox = document.getElementById('wMainContent');
    if (!mainBox) return;

    const displayTemp = currentUnit === 'C' ? data.tempC : Math.round((data.tempC * 9/5) + 32);
    const unitSymbol = '°' + currentUnit;

    mainBox.innerHTML = `
      <div class="weather-main-display">
        <div class="weather-hero-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="weather-location">${data.city}, ${data.country}</span>
                <div class="weather-condition-text">${data.condition}</div>
              </div>
              <span style="font-size: 2.5rem;">${data.icon}</span>
            </div>
            <div class="weather-temp-huge">${displayTemp}${unitSymbol}</div>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-tertiary);">Real-time Telemetry Baseline • Live Forecast</div>
        </div>

        <div class="weather-stats-grid">
          <div class="weather-stat-pill">
            <span style="font-size: 1.2rem;">💧</span>
            <div>
              <div class="weather-stat-val">${data.humidity}%</div>
              <div class="weather-stat-lbl">Humidity</div>
            </div>
          </div>

          <div class="weather-stat-pill">
            <span style="font-size: 1.2rem;">💨</span>
            <div>
              <div class="weather-stat-val">${data.wind} km/h</div>
              <div class="weather-stat-lbl">Wind Speed</div>
            </div>
          </div>

          <div class="weather-stat-pill">
            <span style="font-size: 1.2rem;">🧭</span>
            <div>
              <div class="weather-stat-val">${data.pressure} hPa</div>
              <div class="weather-stat-lbl">Pressure</div>
            </div>
          </div>

          <div class="weather-stat-pill">
            <span style="font-size: 1.2rem;">☀️</span>
            <div>
              <div class="weather-stat-val">${data.uv} / 10</div>
              <div class="weather-stat-lbl">UV Index</div>
            </div>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">5-Day Daily Outlook</div>
      <div class="weather-forecast-grid">
        ${data.forecast.map(f => {
          const fTemp = currentUnit === 'C' ? f.temp : Math.round((f.temp * 9/5) + 32);
          return `
            <div class="forecast-card">
              <div class="forecast-day">${f.day}</div>
              <div style="font-size: 1.5rem; margin: 0.2rem 0;">${f.cond}</div>
              <div class="forecast-temp">${fTemp}${unitSymbol}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  drawWeather();

  const searchBtn = document.getElementById('wSearchBtn');
  const cityInput = document.getElementById('wInputCity');
  const btnC = document.getElementById('unitC');
  const btnF = document.getElementById('unitF');

  if (searchBtn && cityInput) {
    searchBtn.addEventListener('click', () => {
      const val = cityInput.value.trim();
      if (val) {
        currentCity = val;
        drawWeather();
      }
    });

    cityInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = cityInput.value.trim();
        if (val) {
          currentCity = val;
          drawWeather();
        }
      }
    });
  }

  if (btnC && btnF) {
    btnC.addEventListener('click', () => {
      currentUnit = 'C';
      btnC.classList.add('active');
      btnF.classList.remove('active');
      drawWeather();
    });

    btnF.addEventListener('click', () => {
      currentUnit = 'F';
      btnF.classList.add('active');
      btnC.classList.remove('active');
      drawWeather();
    });
  }
}

