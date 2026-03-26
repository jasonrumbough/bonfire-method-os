/* ============================================
   Shared Components — Nav + Footer
   ============================================ */

function renderNav(activePage) {
  const pages = [
    { href: 'framework.html', label: 'Framework' },
    { href: 'book.html',      label: 'Book' },
    { href: 'services.html',  label: 'Services' },
    { href: 'about.html',     label: 'About' },
  ];

  const links = pages.map(p => {
    const isActive = activePage === p.href ? ' class="active"' : '';
    return `<li><a href="${p.href}"${isActive}>${p.label}</a></li>`;
  }).join('');

  document.getElementById('site-nav').innerHTML = `
    <a href="index.html" class="nav-logo">The Bonfire <span>Method</span></a>
    <ul class="nav-links">${links}</ul>
    <a href="spark-audit.html" class="nav-cta">Free Spark Audit</a>
    <a href="https://app.thebonfirecompany.com" class="nav-portal" target="_blank">Client Portal</a>
    <button class="nav-mobile-toggle" aria-label="Menu" onclick="toggleMobileNav()">☰</button>
  `;
}

function toggleMobileNav() {
  const nav = document.querySelector('.nav-links');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  nav.style.flexDirection = 'column';
  nav.style.position = 'absolute';
  nav.style.top = '100%';
  nav.style.left = '0';
  nav.style.right = '0';
  nav.style.background = 'var(--coal)';
  nav.style.padding = '24px 32px';
  nav.style.borderBottom = '1px solid var(--divider)';
  nav.style.gap = '20px';
}

function renderFooter() {
  document.getElementById('site-footer').innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="nav-logo">The Bonfire <span style="color:var(--ember)">Method</span>™</a>
            <p>A leadership sustainability framework for those who want to build fires that last — without burning out in the process.</p>
          </div>
          <div class="footer-col">
            <h5>Framework</h5>
            <ul>
              <li><a href="framework.html#spark">The Spark</a></li>
              <li><a href="framework.html#systems">S.Y.S.T.E.M.S.</a></li>
              <li><a href="framework.html#air">AIR</a></li>
              <li><a href="spark-audit.html">Free Audit</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Resources</h5>
            <ul>
              <li><a href="book.html">The Book</a></li>
              <li><a href="services.html">Services</a></li>
              <li><a href="about.html">About Jason</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Connect</h5>
            <ul>
              <li><a href="spark-audit.html">Take the Spark Audit</a></li>
              <li><a href="services.html#speaking">Book Jason to Speak</a></li>
              <li><a href="mailto:jason@thebonfiremethod.com">Contact</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 Jason Rumbough. The Bonfire Method™ is a registered trademark.</p>
          <div style="display:flex;gap:24px;">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  `;
}

// Intersection Observer for fade-in animations
function initAnimations() {
  if (!('IntersectionObserver' in window)) return;
  const els = document.querySelectorAll('[data-animate]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('animate-in');
        if (e.target.dataset.delay) {
          e.target.style.animationDelay = e.target.dataset.delay + 's';
        }
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => {
    el.style.opacity = '0';
    obs.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', initAnimations);
