/**
 * Lizzdo Media - Single-Page Router & Dynamic Content Controller
 * Powered by Decap CMS data bridge while strictly locking the visual theme and design.
 */

import {
  getSiteConfig,
  getHomeContent,
  getServices,
  getServiceBySlug,
  getPortfolio,
  getFeaturedPortfolio,
  getPortfolioBySlug,
  getBlogPosts,
  getBlogPostBySlug,
  getAboutContent,
  getTestimonials,
  getFAQ,
  getBudgetOptions
} from './src/data/content.js';

let activeCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initGlobalEvents();
  initRouting();
});

/**
 * Global Event Delegation for Interactive UI Elements (Code Copy, FAQ Accordions, etc.)
 */
function initGlobalEvents() {
  document.body.addEventListener('click', (e) => {
    // 1. Copy Code Block Button
    const copyBtn = e.target.closest('.copy-code-btn');
    if (copyBtn) {
      const codeWrapper = copyBtn.closest('.code-block-wrapper');
      if (codeWrapper) {
        const codeEl = codeWrapper.querySelector('code');
        if (codeEl) {
          const rawCode = codeEl.textContent || '';
          navigator.clipboard.writeText(rawCode).then(() => {
            const originalHtml = copyBtn.innerHTML;
            copyBtn.classList.add('copied');
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i><span>Copied!</span>';
            setTimeout(() => {
              copyBtn.classList.remove('copied');
              copyBtn.innerHTML = originalHtml;
            }, 2000);
          }).catch(() => {
            // Fallback copy
          });
        }
      }
      return;
    }

    // 2. FAQ Accordion Toggle
    const faqBtn = e.target.closest('.faq-question-btn');
    if (faqBtn) {
      const faqItem = faqBtn.closest('.faq-item');
      if (faqItem) {
        const isOpen = faqItem.classList.contains('open');
        // Close others in same list if desired, or toggle
        faqItem.classList.toggle('open', !isOpen);
      }
      return;
    }
  });
}

/**
 * Routing logic supporting hash and path navigation
 */
function initRouting() {
  function getRoute() {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) {
      const path = window.location.pathname.replace(/^\//, '');
      return path || 'home';
    }
    return hash;
  }

  function handleRoute() {
    const rawRoute = getRoute();
    const [pathPart, queryPart] = rawRoute.split('?');
    const queryParams = new URLSearchParams(queryPart || '');

    const segments = pathPart.split('/').filter(Boolean);
    const mainSection = segments[0] || 'home';
    const subParam = segments[1] || null;

    renderPage(mainSection, subParam, queryParams);
    updateNavState(mainSection);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('popstate', handleRoute);

  // Intercept hash navigation clicks
  document.body.addEventListener('click', (e) => {
    const targetLink = e.target.closest('a');
    if (!targetLink) return;

    const href = targetLink.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const currentHash = window.location.hash;
      if (currentHash !== href) {
        window.location.hash = href;
      } else {
        handleRoute();
      }
    }
  });

  handleRoute();
}

/**
 * Navigation state synchronization
 */
function updateNavState(section) {
  const normSection = section === '' ? 'home' : section;
  const desktopLinks = document.querySelectorAll('.nav-pill .nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-menu-sheet .mobile-nav-link');

  const updateList = (links) => {
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const targetSec = href.replace(/^#\/?/, '').split('/')[0].split('?')[0] || 'home';
      if (targetSec === normSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  updateList(desktopLinks);
  updateList(mobileLinks);
}

/**
 * Render the requested page view
 */
function renderPage(section, param, queryParams) {
  const root = document.getElementById('view-mount');
  if (!root) return;

  switch (section) {
    case 'services':
      if (param) {
        renderServiceDetail(root, param);
      } else {
        renderServicesOverview(root);
      }
      break;

    case 'work':
      if (param) {
        renderWorkDetail(root, param);
      } else {
        renderWorkOverview(root);
      }
      break;

    case 'about':
      renderAboutPage(root);
      break;

    case 'blog':
      if (param) {
        renderBlogDetail(root, param);
      } else {
        renderBlogOverview(root);
      }
      break;

    case 'contact':
      renderContactPage(root, queryParams);
      break;

    case 'home':
    case '':
      renderHomePage(root);
      break;

    default:
      render404Page(root, `The requested page "#${escapeHtml(section)}" could not be found.`);
      break;
  }

  initEntranceAnimations();
}

/**
 * Utility: HTML Entity Escaping
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Utility: Analytics Event Dispatcher (Prepared for production tracking without hardcoded IDs)
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;
  // If Google Analytics / GTag is configured by client
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
  // If Google Tag Manager dataLayer exists
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...params });
  }
}

/**
 * Utility: Dynamic SEO & Social Meta Updater with Structured Data (JSON-LD)
 */
function updateSEO(title, description, image, path, schemaData = null) {
  const site = getSiteConfig();
  const fullTitle = title || site.seo?.defaultTitle || `${site.name} — ${site.tagline}`;
  const fullDesc = description || site.seo?.defaultDescription || site.description;
  const fullImg = image || site.logo || '/assets/logo.webp';
  const fullUrl = `https://media.lizzdo.com/${path ? (path.startsWith('#') ? path : `#${path}`) : ''}`;

  document.title = fullTitle;

  // Meta Description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', fullDesc);

  // Open Graph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', fullTitle);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', fullDesc);
  const ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) ogImg.setAttribute('content', fullImg);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', fullUrl);

  // Twitter
  const twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', fullTitle);
  const twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', fullDesc);
  const twImg = document.querySelector('meta[name="twitter:image"]');
  if (twImg) twImg.setAttribute('content', fullImg);
  const twUrl = document.querySelector('meta[name="twitter:url"]');
  if (twUrl) twUrl.setAttribute('content', fullUrl);

  // Canonical
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', fullUrl);

  // Structured Data (JSON-LD)
  let script = document.getElementById('structured-data');
  if (!script) {
    script = document.createElement('script');
    script.id = 'structured-data';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  const defaultSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://media.lizzdo.com/#organization",
        "name": site.name || "Lizzdo Media",
        "url": "https://media.lizzdo.com",
        "logo": "https://media.lizzdo.com/assets/logo.webp",
        "sameAs": [
          site.socials?.instagram,
          site.socials?.facebook,
          site.socials?.linkedin
        ].filter(Boolean)
      },
      {
        "@type": "WebSite",
        "@id": "https://media.lizzdo.com/#website",
        "url": "https://media.lizzdo.com",
        "name": site.name || "Lizzdo Media",
        "description": site.description,
        "publisher": {
          "@id": "https://media.lizzdo.com/#organization"
        }
      }
    ]
  };

  const finalSchema = schemaData || defaultSchema;
  script.textContent = JSON.stringify(finalSchema);
}

/**
 * Utility: Clean Markdown Parser with Syntax Code Block Support
 * Fulfills Requirement 11, 12, and 13
 */
function renderMarkdown(content) {
  if (!content) return '';

  // If already an array of paragraphs (backwards compatibility)
  if (Array.isArray(content)) {
    return content.map(p => `<p>${escapeHtml(p)}</p>`).join('');
  }

  let text = String(content);

  // 1. Extract and protect code blocks
  const codeBlocks = [];
  text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    const cleanLang = (lang || 'code').trim().toLowerCase();
    const safeCode = escapeHtml(code.trim());
    codeBlocks.push({
      lang: cleanLang,
      html: `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-lang-badge">${escapeHtml(cleanLang)}</span>
            <button class="copy-code-btn" type="button" aria-label="Copy Code">
              <i class="fa-regular fa-copy"></i>
              <span>Copy</span>
            </button>
          </div>
          <pre class="code-pre"><code class="language-${escapeHtml(cleanLang)}">${safeCode}</code></pre>
        </div>
      `
    });
    return placeholder;
  });

  // 2. Parse lines and structural elements
  const lines = text.split('\n');
  const output = [];
  let inList = false;
  let listType = 'ul';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check code placeholder
    if (line.trim().startsWith('__CODE_BLOCK_') && line.trim().endsWith('__')) {
      if (inList) {
        output.push(`</${listType}>`);
        inList = false;
      }
      const idx = parseInt(line.trim().replace('__CODE_BLOCK_', '').replace('__', ''), 10);
      if (codeBlocks[idx]) {
        output.push(codeBlocks[idx].html);
      }
      continue;
    }

    // Blank line
    if (!line.trim()) {
      if (inList) {
        output.push(`</${listType}>`);
        inList = false;
      }
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      if (inList) {
        output.push(`</${listType}>`);
        inList = false;
      }
      const quoteText = formatInlineMarkdown(line.replace(/^>\s?/, ''));
      output.push(`<blockquote><p>${quoteText}</p></blockquote>`);
      continue;
    }

    // Headings
    if (line.startsWith('#### ')) {
      if (inList) { output.push(`</${listType}>`); inList = false; }
      output.push(`<h4>${formatInlineMarkdown(line.slice(5))}</h4>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { output.push(`</${listType}>`); inList = false; }
      output.push(`<h3>${formatInlineMarkdown(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { output.push(`</${listType}>`); inList = false; }
      output.push(`<h2>${formatInlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) { output.push(`</${listType}>`); inList = false; }
      output.push(`<h1>${formatInlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    // Unordered List
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        if (inList) output.push(`</${listType}>`);
        output.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      const itemText = formatInlineMarkdown(line.trim().slice(2));
      output.push(`<li>${itemText}</li>`);
      continue;
    }

    // Ordered List
    const numMatch = line.trim().match(/^([0-9]+)\.\s(.*)$/);
    if (numMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) output.push(`</${listType}>`);
        output.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      const itemText = formatInlineMarkdown(numMatch[2]);
      output.push(`<li>${itemText}</li>`);
      continue;
    }

    // Standard Paragraph
    if (inList) {
      output.push(`</${listType}>`);
      inList = false;
    }
    output.push(`<p>${formatInlineMarkdown(line)}</p>`);
  }

  if (inList) {
    output.push(`</${listType}>`);
  }

  return output.join('\n');
}

/**
 * Format inline Markdown tags (Bold, Italic, Links, Inline Code)
 */
function formatInlineMarkdown(str) {
  if (!str) return '';
  let formatted = escapeHtml(str);

  // Inline code: `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Bold: **text** or __text__
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Links: [text](url)
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return formatted;
}

/**
 * 01. Complete Continuous Scrollable Homepage
 */
function renderHomePage(container) {
  const site = getSiteConfig();
  const home = getHomeContent();
  const services = getServices();
  const portfolio = getFeaturedPortfolio();
  const blogPosts = getBlogPosts().slice(0, 3);
  const testimonials = getTestimonials();
  const faqs = getFAQ();

  updateSEO(
    home.seo?.title || `${site.name} — ${home.hero?.line1 || 'Creative & Digital'} ${home.hero?.line2 || 'Designed To Scale'}`,
    home.seo?.description || site.seo?.defaultDescription || site.description,
    site.logo,
    'home'
  );

  container.innerHTML = `
    <div class="home-scroll-container">
      
      <!-- 02. Hero Section -->
      <section class="home-section hero" id="hero-section">
        <!-- Trust Row -->
        <div class="trust-row anim" style="--d: 0.05s" id="enterprise-trust-row">
          <div class="avatar-group" id="enterprise-avatars">
            <div class="avatar-ring avatar-1" title="Brand Excellence">
              <div class="avatar-inner">
                <i class="fa-solid fa-gem"></i>
              </div>
            </div>
            <div class="avatar-ring avatar-2" title="Digital Innovation">
              <div class="avatar-inner">
                <i class="fa-solid fa-bolt"></i>
              </div>
            </div>
            <div class="avatar-ring avatar-3" title="Creative Craft">
              <div class="avatar-inner">
                <i class="fa-solid fa-sparkles"></i>
              </div>
            </div>
          </div>
          <div class="trust-pill" id="trust-pill-text">
            ${home.hero.trustLabel}
          </div>
        </div>

        <!-- Headline -->
        <h1 class="headline anim" id="hero-main-title">
          <span>${home.hero.line1}</span>
          <span>${home.hero.line2}</span>
        </h1>

        <!-- Subhead -->
        <p class="subhead anim" style="--d: 0.28s" id="hero-description">
          ${home.hero.subhead}
        </p>

        <!-- CTA Row -->
        <div style="display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap;" class="anim" style="--d: 0.4s">
          <a href="#contact" class="btn-cta" id="hero-get-started">
            ${home.hero.primaryCta}
          </a>
          <a href="#work" class="sign-in-btn" style="height: clamp(40px, 4.8vw, 44px); padding: 0 20px;" id="hero-view-work">
            ${home.hero.secondaryCta}
          </a>
        </div>

        <!-- Stats Counter -->
        <footer class="stats-footer" id="stats-metrics-footer">
          ${home.stats
            .map(
              (s, i) => `
            <div
              class="stat-item anim"
              style="--d: ${0.5 + i * 0.08}s"
              id="stat-metric-${i}"
              data-target="${s.target}"
              data-suffix="${s.suffix || ''}"
              data-decimals="${s.decimals || 0}"
              data-index="${i}"
            >
              <div class="stat-icon" aria-hidden="true">${s.icon}</div>
              <div class="stat-value-row">
                <span class="stat-num">0</span>
                <span class="stat-suffix">${s.suffix || ''}</span>
              </div>
              <div class="stat-label">${s.label}</div>
            </div>
          `
            )
            .join('')}
        </footer>
      </section>

      <!-- 03. Introduction Section -->
      <section class="home-section" id="home-intro">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.intro.badge}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.intro.headline}</h2>
        <div class="intro-card anim" style="--d: 0.25s">
          <p>${home.intro.paragraph1}</p>
          <p>${home.intro.paragraph2}</p>
        </div>
      </section>

      <!-- 04. Services Section (All 11 Core Capabilities) -->
      <section class="home-section" id="home-services">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.servicesSection.badge || '02 // Disciplines — 11 Core Capabilities'}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.servicesSection.heading || 'Comprehensive Creative & Digital Services'}</h2>
        <p class="section-subhead anim" style="--d: 0.25s">
          ${home.servicesSection.description || 'From initial mark to market launch. Click any service to explore detailed deliverables and execution processes.'}
        </p>

        <div class="services-grid">
          ${services
            .map(
              (srv, idx) => `
            <a href="#services/${srv.slug}" class="service-card anim" style="--d: ${0.25 + (idx % 6) * 0.05}s" id="home-service-card-${srv.slug}">
              <div>
                <div class="service-card-top">
                  <span class="service-num">${srv.number || `0${idx + 1}`}</span>
                  <span class="service-glyph">${srv.iconGlyph || '◆'}</span>
                </div>
                <h3 class="service-card-title">${srv.title}</h3>
                <p class="service-card-summary">${srv.summary}</p>
              </div>
              <div class="service-card-cta">
                <span>${srv.ctaText || 'Discuss This Service'}</span>
                <i class="fa-solid fa-arrow-right" style="font-size: 11px;"></i>
              </div>
            </a>
          `
            )
            .join('')}
        </div>
      </section>

      <!-- 05. Expertise Section -->
      <section class="home-section" id="home-expertise">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.expertise.badge}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.expertise.heading}</h2>
        <p class="section-subhead anim" style="--d: 0.25s">
          ${home.expertise.description}
        </p>

        <div class="expertise-grid">
          ${home.expertise.items
            .map(
              (exp, idx) => `
            <a href="${exp.link}" class="expertise-card anim" style="--d: ${0.2 + idx * 0.08}s" id="expertise-card-${exp.code}">
              <div class="expertise-card-top">
                <span class="expertise-code">${exp.code}</span>
                <span class="expertise-glyph">${exp.glyph}</span>
              </div>
              <h3 class="expertise-title">${exp.title}</h3>
              <p class="expertise-desc">${exp.desc}</p>
              <div class="expertise-link-cta">
                <span>Explore Discipline</span>
                <i class="fa-solid fa-arrow-right" style="font-size: 11px;"></i>
              </div>
            </a>
          `
            )
            .join('')}
        </div>
      </section>

      <!-- 06. Selected Work Section -->
      <section class="home-section" id="home-work">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.selectedWork.badge}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.selectedWork.heading}</h2>
        <p class="section-subhead anim" style="--d: 0.25s">
          ${home.selectedWork.description}
        </p>

        <div class="portfolio-grid" style="margin-bottom: 24px;">
          ${portfolio
            .map(
              (proj, idx) => `
            <a href="#work/${proj.slug}" class="project-card anim" style="--d: ${0.2 + idx * 0.08}s" id="home-project-card-${proj.slug}">
              <div class="project-thumb">
                <span class="project-thumb-badge">${proj.category}</span>
                <img src="${proj.featuredImage || '/assets/logo.webp'}" alt="${proj.title}" />
              </div>
              <div class="project-content">
                <h3 class="project-title">${proj.title}</h3>
                <p class="project-summary">${proj.summary}</p>
                <div class="project-tags">
                  ${(proj.services || []).map((s) => `<span class="tag-pill">${s}</span>`).join('')}
                </div>
              </div>
            </a>
          `
            )
            .join('')}
        </div>

        <a href="#work" class="btn-cta anim" style="--d: 0.4s" id="home-view-all-work">
          ${home.selectedWork.ctaText || 'View All Portfolio Works'}
          <i class="fa-solid fa-arrow-right" style="font-size: 12px; margin-left: 8px;"></i>
        </a>
      </section>

      <!-- 07. Brand Identity Section -->
      <section class="home-section" id="home-branding">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.brandingShowcase.badge}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.brandingShowcase.heading}</h2>
        <p class="section-subhead anim" style="--d: 0.25s">${home.brandingShowcase.description}</p>

        <div class="showcase-banner anim" style="--d: 0.3s">
          <div class="elements-grid">
            ${home.brandingShowcase.elements
              .map(
                (el) => `
              <div class="element-pill-card">
                <h4>${el.title}</h4>
                <p>${el.desc}</p>
              </div>
            `
              )
              .join('')}
          </div>
          <div style="display: flex; justify-content: center; margin-top: 8px;">
            <a href="#contact?service=Brand%20Identity" class="btn-cta">
              Discuss Brand Identity
            </a>
          </div>
        </div>
      </section>

      <!-- 08. Social Media & Content Section -->
      <section class="home-section" id="home-social">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.socialShowcase.badge}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.socialShowcase.heading}</h2>
        <p class="section-subhead anim" style="--d: 0.25s">${home.socialShowcase.description}</p>

        <div class="showcase-banner anim" style="--d: 0.3s">
          <div class="elements-grid">
            ${home.socialShowcase.items
              .map(
                (item) => `
              <div class="element-pill-card">
                <h4>${item.title}</h4>
                <p>${item.desc}</p>
              </div>
            `
              )
              .join('')}
          </div>
          <div style="display: flex; justify-content: center; margin-top: 8px;">
            <a href="#contact?service=Social%20Media%20Design" class="btn-cta">
              Discuss Social Media
            </a>
          </div>
        </div>
      </section>

      <!-- 09. Marketing Section -->
      <section class="home-section" id="home-marketing">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.marketingShowcase.badge}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.marketingShowcase.heading}</h2>
        <p class="section-subhead anim" style="--d: 0.25s">${home.marketingShowcase.description}</p>

        <div class="showcase-banner anim" style="--d: 0.3s">
          <ul class="deliverables-list" style="max-width: 680px; margin: 0 auto;">
            ${home.marketingShowcase.points
              .map(
                (pt) => `
              <li class="deliverable-item">
                <span class="deliverable-dot"></span>
                <span>${pt}</span>
              </li>
            `
              )
              .join('')}
          </ul>
          <div style="display: flex; justify-content: center; margin-top: 12px;">
            <a href="#contact?service=Digital%20Marketing" class="btn-cta">
              Discuss Marketing
            </a>
          </div>
        </div>
      </section>

      <!-- 10. Website Development Section -->
      <section class="home-section" id="home-web">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.webShowcase.badge}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.webShowcase.heading}</h2>
        <p class="section-subhead anim" style="--d: 0.25s">${home.webShowcase.description}</p>

        <div class="showcase-banner anim" style="--d: 0.3s">
          <div class="elements-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
            ${home.webShowcase.tiers
              .map(
                (t) => `
              <div class="element-pill-card" style="padding: 20px;">
                <h4 style="font-size: 16px; margin-bottom: 6px;">${t.pages}</h4>
                <p style="font-size: 13.5px;">${t.desc}</p>
              </div>
            `
              )
              .join('')}
          </div>

          <ul class="deliverables-list" style="max-width: 680px; margin: 8px auto 0;">
            ${home.webShowcase.highlights
              .map(
                (hl) => `
              <li class="deliverable-item">
                <span class="deliverable-dot"></span>
                <span>${hl}</span>
              </li>
            `
              )
              .join('')}
          </ul>

          <div style="display: flex; justify-content: center; margin-top: 12px;">
            <a href="#contact?service=Website%20Development" class="btn-cta">
              Discuss Website Project
            </a>
          </div>
        </div>
      </section>

      <!-- 11. Creative Process Section -->
      <section class="home-section" id="home-process">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.process.badge}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.process.heading}</h2>
        <p class="section-subhead anim" style="--d: 0.25s">
          ${home.process.description}
        </p>

        <div class="process-grid">
          ${home.process.steps
            .map(
              (p, idx) => `
            <div class="process-step-card anim" style="--d: ${0.2 + idx * 0.08}s">
              <span class="process-step-num">${p.step}</span>
              <h4 class="process-step-title">${p.name}</h4>
              <p class="process-step-desc">${p.desc}</p>
            </div>
          `
            )
            .join('')}
        </div>
      </section>

      <!-- Testimonials Section (Requirement 15: Cleanly hidden if none exist) -->
      ${testimonials.length > 0 ? `
        <section class="home-section" id="home-testimonials">
          <div class="page-title-badge anim" style="--d: 0.1s">
            <span class="badge-dot"></span>
            <span>Client Feedback</span>
          </div>
          <h2 class="section-headline anim" style="--d: 0.18s">What Our Partners Say</h2>
          <div class="testimonials-grid" style="margin-top: 16px;">
            ${testimonials.map(t => `
              <div class="testimonial-card">
                <p class="testimonial-text">"${escapeHtml(t.testimonial)}"</p>
                <div class="testimonial-author">
                  ${t.image ? `<img src="${t.image}" alt="${t.clientName}" class="testimonial-avatar" />` : ''}
                  <div>
                    <div class="testimonial-author-name">${escapeHtml(t.clientName)}</div>
                    <div class="testimonial-author-role">${escapeHtml(t.role || '')}${t.company ? ` • ${escapeHtml(t.company)}` : ''}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 12. About Lizzdo Media Preview -->
      <section class="home-section" id="home-about">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.aboutPreview.badge}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.aboutPreview.heading}</h2>
        <div class="intro-card anim" style="--d: 0.25s">
          <p>
            ${home.aboutPreview.description}
          </p>
          <div style="display: flex; justify-content: flex-start; margin-top: 12px;">
            <a href="#about" class="btn-cta">
              ${home.aboutPreview.ctaText || 'More About Lizzdo Media'}
              <i class="fa-solid fa-arrow-right" style="font-size: 11px; margin-left: 6px;"></i>
            </a>
          </div>
        </div>
      </section>

      <!-- FAQ Section (Requirement 16) -->
      ${faqs.length > 0 ? `
        <section class="home-section" id="home-faq">
          <div class="page-title-badge anim" style="--d: 0.1s">
            <span class="badge-dot"></span>
            <span>Frequently Asked Questions</span>
          </div>
          <h2 class="section-headline anim" style="--d: 0.18s">Answers to Common Inquiries</h2>
          <div class="faq-list anim" style="--d: 0.25s; margin-top: 16px;">
            ${faqs.map((f, idx) => `
              <div class="faq-item ${idx === 0 ? 'open' : ''}">
                <button class="faq-question-btn" type="button">
                  <span>${escapeHtml(f.question)}</span>
                  <i class="fa-solid fa-chevron-down faq-toggle-icon"></i>
                </button>
                <div class="faq-answer-panel">
                  <p class="faq-answer-text">${escapeHtml(f.answer)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- 14. Blog / Insights Preview -->
      <section class="home-section" id="home-blog">
        <div class="page-title-badge anim" style="--d: 0.1s">
          <span class="badge-dot"></span>
          <span>${home.blogPreview.badge}</span>
        </div>
        <h2 class="section-headline anim" style="--d: 0.18s">${home.blogPreview.heading}</h2>
        <p class="section-subhead anim" style="--d: 0.25s">
          ${home.blogPreview.description}
        </p>

        <div class="blog-grid" style="margin-bottom: 24px;">
          ${blogPosts
            .map(
              (post, idx) => `
            <a href="#blog/${post.slug}" class="blog-card anim" style="--d: ${0.2 + idx * 0.08}s" id="home-blog-card-${post.slug}">
              <div class="blog-meta">
                <span class="blog-cat">${post.category}</span>
                <span>${post.formattedDate || post.date}</span>
                <span>• ${post.readTime}</span>
              </div>
              <h3 class="blog-title">${post.title}</h3>
              <p class="blog-excerpt">${post.excerpt}</p>
            </a>
          `
            )
            .join('')}
        </div>

        <a href="#blog" class="btn-cta anim" style="--d: 0.4s" id="home-view-all-blog">
          ${home.blogPreview.ctaText || 'View All Articles'}
          <i class="fa-solid fa-arrow-right" style="font-size: 12px; margin-left: 8px;"></i>
        </a>
      </section>

      <!-- 15. Final Call To Action -->
      <section class="home-section" id="home-cta">
        <div class="final-cta-card anim" style="--d: 0.2s">
          <h2>${home.finalCta.headline}</h2>
          <p>${home.finalCta.subhead}</p>
          <div class="final-cta-actions">
            <a href="#contact" class="btn-cta" id="final-cta-start-project">
              ${home.finalCta.primaryBtn}
            </a>
            ${site.socials.whatsapp ? `
              <a href="${site.socials.whatsapp}?text=${encodeURIComponent("Hello Lizzdo Media, I'm interested in starting a project.")}" target="_blank" rel="noopener noreferrer" class="sign-in-btn" style="height: 44px; display: inline-flex; align-items: center; gap: 8px;">
                <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i>
                <span>${home.finalCta.secondaryBtn}</span>
              </a>
            ` : ''}
          </div>
        </div>
      </section>

      <!-- 16. Comprehensive Footer -->
      ${renderFooterHTML()}

    </div>
  `;

  initCountUp();
}

/**
 * Services Overview View
 */
/**
 * Services Overview View
 */
function renderServicesOverview(container) {
  const site = getSiteConfig();
  const services = getServices();
  
  updateSEO(
    `Services — ${site.name}`,
    'Explore our 11 core creative and digital disciplines: Brand identity, logo design, graphic design, flyers, social media, digital marketing, advertising, and fast modern websites.',
    site.logo,
    'services'
  );

  container.innerHTML = `
    <div class="view-container">
      <div class="page-title-badge anim" style="--d: 0.05s">
        <span class="badge-dot"></span>
        <span>Capabilities — 11 Core Disciplines</span>
      </div>

      <h1 class="section-headline anim" style="--d: 0.12s">
        Purpose-Built Digital & Creative Services
      </h1>

      <p class="section-subhead anim" style="--d: 0.2s">
        From enduring brand systems and high-converting marketing content to fast, modern websites. Every project is individually reviewed and custom quoted.
      </p>

      <div class="services-grid">
        ${services
          .map(
            (srv, idx) => `
          <a href="#services/${srv.slug}" class="service-card anim" style="--d: ${0.25 + (idx % 6) * 0.06}s" id="service-card-${srv.slug}">
            <div>
              <div class="service-card-top">
                <span class="service-num">${srv.number || `0${idx + 1}`}</span>
                <span class="service-glyph">${srv.iconGlyph || '◆'}</span>
              </div>
              <h3 class="service-card-title">${srv.title}</h3>
              <p class="service-card-summary">${srv.summary}</p>
            </div>
            <div class="service-card-cta">
              <span>View Service Breakdown</span>
              <i class="fa-solid fa-arrow-right" style="font-size: 11px;"></i>
            </div>
          </a>
        `
          )
          .join('')}
      </div>

      <!-- Action Bar -->
      <div class="detail-action-bar anim" style="--d: 0.35s; margin-bottom: clamp(32px, 4vh, 48px);">
        <div class="action-bar-text">
          <h4>Have a custom or multi-discipline project in mind?</h4>
          <p>We review every inquiry individually and provide tailored proposals with clear deliverables.</p>
        </div>
        <a href="#contact" class="btn-cta">
          Start a Project Discussion
          <i class="fa-solid fa-arrow-right" style="font-size: 12px; margin-left: 6px;"></i>
        </a>
      </div>

      ${renderFooterHTML()}
    </div>
  `;
}

/**
 * Service Detail View
 * Exact Uniform Structure: Hero -> Intro -> What We Provide -> Deliverables -> Why It Matters -> Related Work -> Process -> FAQs -> CTA -> Footer
 */
function renderServiceDetail(container, slug) {
  const site = getSiteConfig();
  const service = getServiceBySlug(slug);
  
  if (!service) {
    render404Page(container, 'Service not found');
    return;
  }

  // Find related portfolio work
  const allProjects = getPortfolio();
  const relatedProjects = allProjects.filter((p) => {
    const catMatch = p.category && service.category && p.category.toLowerCase() === service.category.toLowerCase();
    const serviceMatch = p.services && p.services.some(s => s.toLowerCase().includes(service.title.toLowerCase()) || service.title.toLowerCase().includes(s.toLowerCase()));
    return catMatch || serviceMatch;
  }).slice(0, 3);
  
  const serviceSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "name": service.title,
        "description": service.description || service.summary,
        "provider": {
          "@type": "Organization",
          "name": site.name,
          "url": "https://media.lizzdo.com"
        },
        "url": `https://media.lizzdo.com/#services/${service.slug}`
      }
    ]
  };

  updateSEO(
    service.seoTitle || `${service.title} — ${site.name}`,
    service.seoDescription || service.description || service.summary,
    service.featuredImage || site.logo,
    `services/${service.slug}`,
    serviceSchema
  );

  container.innerHTML = `
    <div class="view-container">
      <div class="service-detail-view">
        <a href="#services" class="back-link anim" style="--d: 0.05s">
          <i class="fa-solid fa-arrow-left"></i>
          <span>All Services</span>
        </a>

        <!-- 1. Detail Header Card / Intro -->
        <div class="detail-header-card anim" style="--d: 0.12s">
          <span class="detail-num-tag">${service.number || '01'} // ${service.iconGlyph || '◆'}</span>
          <h1 class="detail-title">${service.title}</h1>
          <p class="detail-description">${service.description || service.summary}</p>
        </div>

        <!-- 2. What We Provide Card -->
        ${service.whatWeProvide && service.whatWeProvide.length > 0 ? `
          <div class="detail-section-card anim" style="--d: 0.18s">
            <h3 class="detail-section-title">
              <i class="fa-solid fa-layer-group" style="font-size: 14px; opacity: 0.8;"></i>
              <span>What We Provide</span>
            </h3>
            <div class="elements-grid">
              ${service.whatWeProvide
                .map(
                  (item) => `
                <div class="element-pill-card">
                  <h4>${escapeHtml(item.title)}</h4>
                  <p>${escapeHtml(item.desc)}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        ` : ''}

        <!-- 3. Deliverables Card -->
        ${service.deliverables && service.deliverables.length > 0 ? `
          <div class="detail-section-card anim" style="--d: 0.22s">
            <h3 class="detail-section-title">
              <i class="fa-solid fa-check-double" style="font-size: 14px; opacity: 0.8;"></i>
              <span>Deliverables Included</span>
            </h3>
            <ul class="deliverables-list">
              ${service.deliverables
                .map(
                  (item) => `
                <li class="deliverable-item">
                  <span class="deliverable-dot"></span>
                  <span>${escapeHtml(item)}</span>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        ` : ''}

        <!-- 4. Why It Matters Card -->
        ${service.whyItMatters && service.whyItMatters.length > 0 ? `
          <div class="detail-section-card anim" style="--d: 0.26s">
            <h3 class="detail-section-title">
              <i class="fa-solid fa-lightbulb" style="font-size: 14px; opacity: 0.8;"></i>
              <span>Why It Matters for Your Brand</span>
            </h3>
            <div class="elements-grid">
              ${service.whyItMatters
                .map(
                  (item) => `
                <div class="element-pill-card">
                  <h4>${escapeHtml(item.title)}</h4>
                  <p>${escapeHtml(item.desc)}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        ` : ''}

        <!-- 5. Related Work Case Studies -->
        ${relatedProjects.length > 0 ? `
          <div class="detail-section-card anim" style="--d: 0.3s">
            <h3 class="detail-section-title">
              <i class="fa-solid fa-diagram-project" style="font-size: 14px; opacity: 0.8;"></i>
              <span>Related Case Studies & Work</span>
            </h3>
            <div class="portfolio-grid" style="margin-bottom: 0;">
              ${relatedProjects
                .map(
                  (proj, idx) => `
                <a href="#work/${proj.slug}" class="project-card" id="related-card-${proj.slug}">
                  <div class="project-thumb">
                    <span class="project-thumb-badge">${proj.category}</span>
                    <img src="${proj.featuredImage || '/assets/logo.webp'}" alt="${proj.title}" />
                  </div>
                  <div class="project-content">
                    <h3 class="project-title">${proj.title}</h3>
                    <p class="project-summary">${proj.summary}</p>
                    <div class="project-tags">
                      ${(proj.services || []).map((s) => `<span class="tag-pill">${s}</span>`).join('')}
                    </div>
                  </div>
                </a>
              `
                )
                .join('')}
            </div>
          </div>
        ` : ''}

        <!-- 6. Execution Process Card -->
        ${service.process && service.process.length > 0 ? `
          <div class="detail-section-card anim" style="--d: 0.34s">
            <h3 class="detail-section-title">
              <i class="fa-solid fa-list-check" style="font-size: 14px; opacity: 0.8;"></i>
              <span>Execution Process</span>
            </h3>
            <div class="process-grid">
              ${service.process
                .map(
                  (p) => `
                <div class="process-step-card">
                  <span class="process-step-num">${p.step}</span>
                  <h4 class="process-step-title">${escapeHtml(p.title)}</h4>
                  <p class="process-step-desc">${escapeHtml(p.desc)}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        ` : ''}

        <!-- 7. Service Specific FAQs -->
        ${service.faqs && service.faqs.length > 0 ? `
          <div class="detail-section-card anim" style="--d: 0.38s">
            <h3 class="detail-section-title">
              <i class="fa-solid fa-circle-question" style="font-size: 14px; opacity: 0.8;"></i>
              <span>Service FAQs</span>
            </h3>
            <div class="faq-list">
              ${service.faqs
                .map(
                  (faq, idx) => `
                <div class="faq-item ${idx === 0 ? 'open' : ''}">
                  <button class="faq-question-btn" type="button">
                    <span>${escapeHtml(faq.question)}</span>
                    <i class="fa-solid fa-chevron-down faq-toggle-icon"></i>
                  </button>
                  <div class="faq-answer-panel">
                    <p class="faq-answer-text">${escapeHtml(faq.answer)}</p>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        ` : ''}

        <!-- 8. Action Bar CTA -->
        <div class="detail-action-bar anim" style="--d: 0.42s">
          <div class="action-bar-text">
            <h4>Ready to discuss ${service.shortTitle || service.title}?</h4>
            <p>We provide tailored proposals and custom quotes based on your exact requirements.</p>
          </div>
          <a href="#contact?service=${encodeURIComponent(service.title)}" class="btn-cta" id="service-cta-${service.slug}">
            ${service.ctaText || `Discuss ${service.shortTitle || service.title}`}
            <i class="fa-solid fa-arrow-right" style="font-size: 12px; margin-left: 6px;"></i>
          </a>
        </div>
      </div>

      ${renderFooterHTML()}
    </div>
  `;
}

/**
 * Work / Portfolio Overview View
 * Structure: Hero -> Intro -> Filters -> Project Gallery -> Instagram CTA -> Final CTA -> Footer
 */
function renderWorkOverview(container) {
  const site = getSiteConfig();
  const allProjects = getPortfolio();
  
  updateSEO(
    `Work & Portfolio — ${site.name}`,
    'Explore selected case studies across brand identity systems, logos, flyer designs, social content, advertising creatives, and websites.',
    site.logo,
    'work'
  );

  const categories = [
    'All',
    'Branding',
    'Logo Design',
    'Graphic Design',
    'Flyer Design',
    'Social Media',
    'Marketing',
    'Advertising',
    'AI Visuals',
    'Websites'
  ];

  const filteredProjects =
    activeCategory === 'All'
      ? allProjects
      : allProjects.filter((p) => {
          if (!p.category) return false;
          return p.category.toLowerCase().includes(activeCategory.toLowerCase()) ||
            (p.services && p.services.some(s => s.toLowerCase().includes(activeCategory.toLowerCase())));
        });

  container.innerHTML = `
    <div class="view-container">
      <div class="page-title-badge anim" style="--d: 0.05s">
        <span class="badge-dot"></span>
        <span>Portfolio & Selected Works</span>
      </div>

      <h1 class="section-headline anim" style="--d: 0.12s">
        Deliberate Design. Measurable Impact.
      </h1>

      <p class="section-subhead anim" style="--d: 0.2s">
        Explore recent client case studies across brand identity systems, social campaigns, advertising creative suites, and websites.
      </p>

      <!-- Category Filter Pills -->
      <div class="category-filter-bar anim" style="--d: 0.25s">
        ${categories
          .map(
            (cat) => `
          <button class="filter-pill ${cat.toLowerCase() === activeCategory.toLowerCase() ? 'active' : ''}" data-cat="${cat}">
            ${cat}
          </button>
        `
          )
          .join('')}
      </div>

      <!-- Portfolio Grid -->
      <div class="portfolio-grid">
        ${filteredProjects.length > 0
          ? filteredProjects
              .map(
                (proj, idx) => `
              <a href="#work/${proj.slug}" class="project-card anim" style="--d: ${0.28 + (idx % 6) * 0.05}s" id="portfolio-card-${proj.slug}">
                <div class="project-thumb">
                  <span class="project-thumb-badge">${proj.category}</span>
                  <img src="${proj.featuredImage || '/assets/logo.webp'}" alt="${proj.title}" loading="lazy" />
                </div>
                <div class="project-content">
                  <h3 class="project-title">${proj.title}</h3>
                  <p class="project-summary">${proj.summary}</p>
                  <div class="project-tags">
                    ${(proj.services || []).map((s) => `<span class="tag-pill">${s}</span>`).join('')}
                  </div>
                </div>
              </a>
            `
              )
              .join('')
          : `
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: #8e8e94;">
              <p>No projects found in this category. Showing all projects soon.</p>
            </div>
          `}
      </div>

      <!-- Instagram CTA -->
      ${site.socials.instagram ? `
        <div style="display: flex; justify-content: center; margin-bottom: clamp(32px, 4vh, 48px);">
          <a href="${site.socials.instagram}" target="_blank" rel="noopener noreferrer" class="btn-instagram-cta">
            <i class="fa-brands fa-instagram"></i>
            <span>See More Work on Instagram</span>
          </a>
        </div>
      ` : ''}

      <!-- Action Bar -->
      <div class="detail-action-bar anim" style="--d: 0.35s; margin-bottom: clamp(32px, 4vh, 48px);">
        <div class="action-bar-text">
          <h4>Have a project in mind for your brand?</h4>
          <p>Every engagement is customized to your exact objectives and timeline.</p>
        </div>
        <a href="#contact" class="btn-cta">
          Start a Project Inquiry
          <i class="fa-solid fa-arrow-right" style="font-size: 12px; margin-left: 6px;"></i>
        </a>
      </div>

      ${renderFooterHTML()}
    </div>
  `;

  // Attach filter handlers for fast client-side filtering
  const filterBtns = container.querySelectorAll('.filter-pill');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeCategory = btn.getAttribute('data-cat') || 'All';
      renderWorkOverview(container);
    });
  });
}

/**
 * Work / Project Detail View
 * Exact Uniform Structure: Hero -> Info -> Overview -> Objective -> Creative Direction -> Services Provided -> Final Work & Gallery -> Video -> Related Projects -> CTA -> Footer
 */
function renderWorkDetail(container, slug) {
  const site = getSiteConfig();
  const project = getPortfolioBySlug(slug);
  
  if (!project) {
    render404Page(container, 'Project not found');
    return;
  }

  // Find related projects (same category or shared service)
  const allProjects = getPortfolio();
  const relatedProjects = allProjects
    .filter((p) => p.slug !== project.slug && (p.category === project.category || (p.services && project.services && p.services.some(s => project.services.includes(s)))))
    .slice(0, 3);
  
  const workSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "name": project.title,
        "description": project.description || project.summary,
        "creator": {
          "@type": "Organization",
          "name": site.name,
          "url": "https://media.lizzdo.com"
        },
        "image": project.featuredImage ? `https://media.lizzdo.com${project.featuredImage}` : undefined,
        "url": `https://media.lizzdo.com/#work/${project.slug}`
      }
    ]
  };

  updateSEO(
    project.seoTitle || `${project.title} Case Study — ${site.name}`,
    project.seoDescription || project.description || project.summary,
    project.featuredImage || site.logo,
    `work/${project.slug}`,
    workSchema
  );

  container.innerHTML = `
    <div class="view-container">
      <div class="service-detail-view">
        <a href="#work" class="back-link anim" style="--d: 0.05s">
          <i class="fa-solid fa-arrow-left"></i>
          <span>All Portfolio Works</span>
        </a>

        <!-- 1. Project Hero & Overview Card -->
        <div class="detail-header-card anim" style="--d: 0.12s">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span class="tag-pill" style="font-size: 13px; padding: 4px 12px;">${project.category}</span>
            <span style="font-size: 13px; color: #8e8e8e;">${project.year || '2026'}${project.client ? ` • Client: ${project.client}` : ''}</span>
          </div>
          <h1 class="detail-title">${project.title}</h1>
          <p class="detail-description">${project.description || project.summary}</p>
          
          <!-- Project Metadata Grid -->
          <div class="project-meta-grid">
            ${project.client ? `
              <div class="project-meta-item">
                <span class="project-meta-label">Client</span>
                <span class="project-meta-value">${escapeHtml(project.client)}</span>
              </div>
            ` : ''}
            <div class="project-meta-item">
              <span class="project-meta-label">Year</span>
              <span class="project-meta-value">${escapeHtml(project.year || '2026')}</span>
            </div>
            <div class="project-meta-item">
              <span class="project-meta-label">Category</span>
              <span class="project-meta-value">${escapeHtml(project.category)}</span>
            </div>
            ${project.industry ? `
              <div class="project-meta-item">
                <span class="project-meta-label">Industry</span>
                <span class="project-meta-value">${escapeHtml(project.industry)}</span>
              </div>
            ` : ''}
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px;">
            ${(project.services || []).map((s) => `<span class="tag-pill">${s}</span>`).join('')}
          </div>
        </div>

        <!-- 2. Project Objective Card (if available) -->
        ${project.objective ? `
          <div class="project-narrative-card anim" style="--d: 0.18s">
            <h3>
              <i class="fa-solid fa-bullseye" style="font-size: 14px; opacity: 0.85;"></i>
              <span>Project Objective</span>
            </h3>
            <p>${escapeHtml(project.objective)}</p>
          </div>
        ` : ''}

        <!-- 3. Creative Direction Card (if available) -->
        ${project.creativeDirection ? `
          <div class="project-narrative-card anim" style="--d: 0.22s">
            <h3>
              <i class="fa-solid fa-compass-drafting" style="font-size: 14px; opacity: 0.85;"></i>
              <span>Creative Direction & System</span>
            </h3>
            <p>${escapeHtml(project.creativeDirection)}</p>
          </div>
        ` : ''}

        <!-- 4. Final Work & Deliverables Gallery -->
        ${project.gallery && project.gallery.length > 0 ? `
          <div class="detail-section-card anim" style="--d: 0.26s">
            <h3 class="detail-section-title">
              <i class="fa-solid fa-layer-group" style="font-size: 14px; opacity: 0.8;"></i>
              <span>Final Work & Deliverables</span>
            </h3>
            <div class="project-gallery-grid">
              ${project.gallery
                .map(
                  (g) => `
                <div class="gallery-card">
                  <div class="gallery-card-image">
                    <img src="${g.image || project.featuredImage || '/assets/logo.webp'}" alt="${escapeHtml(g.title)}" loading="lazy" />
                  </div>
                  <div class="gallery-card-body">
                    <h4>${escapeHtml(g.title)}</h4>
                    <p>${escapeHtml(g.desc)}</p>
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        ` : ''}

        <!-- 5. Optional Video Showcase (only if videoUrl exists) -->
        ${project.videoUrl && project.videoUrl.trim() !== '' ? `
          <div class="detail-section-card anim" style="--d: 0.3s">
            <h3 class="detail-section-title">
              <i class="fa-solid fa-play" style="font-size: 14px; opacity: 0.8;"></i>
              <span>Video Presentation</span>
            </h3>
            <div class="project-video-wrapper">
              ${project.videoUrl.includes('youtube.com') || project.videoUrl.includes('vimeo.com')
                ? `<iframe src="${escapeHtml(project.videoUrl)}" title="${escapeHtml(project.title)} video" allowfullscreen></iframe>`
                : `<video controls src="${escapeHtml(project.videoUrl)}" poster="${project.featuredImage || ''}"></video>`
              }
            </div>
          </div>
        ` : ''}

        <!-- 6. Related Work -->
        ${relatedProjects.length > 0 ? `
          <div class="detail-section-card anim" style="--d: 0.34s">
            <h3 class="detail-section-title">
              <i class="fa-solid fa-diagram-project" style="font-size: 14px; opacity: 0.8;"></i>
              <span>Related Case Studies</span>
            </h3>
            <div class="portfolio-grid" style="margin-bottom: 0;">
              ${relatedProjects
                .map(
                  (proj) => `
                <a href="#work/${proj.slug}" class="project-card" id="related-case-${proj.slug}">
                  <div class="project-thumb">
                    <span class="project-thumb-badge">${proj.category}</span>
                    <img src="${proj.featuredImage || '/assets/logo.webp'}" alt="${proj.title}" loading="lazy" />
                  </div>
                  <div class="project-content">
                    <h3 class="project-title">${proj.title}</h3>
                    <p class="project-summary">${proj.summary}</p>
                    <div class="project-tags">
                      ${(proj.services || []).map((s) => `<span class="tag-pill">${s}</span>`).join('')}
                    </div>
                  </div>
                </a>
              `
                )
                .join('')}
            </div>
          </div>
        ` : ''}

        <!-- 7. Action Bar CTA -->
        <div class="detail-action-bar anim" style="--d: 0.38s">
          <div class="action-bar-text">
            <h4>Interested in a similar project?</h4>
            <p>Let's discuss how we can build something tailored for your business.</p>
          </div>
          <a href="#contact?service=${encodeURIComponent(project.category)}" class="btn-cta" id="project-start-similar">
            Start a Similar Project
            <i class="fa-solid fa-arrow-right" style="font-size: 12px; margin-left: 6px;"></i>
          </a>
        </div>
      </div>

      ${renderFooterHTML()}
    </div>
  `;
}

/**
 * About Page View (Requirement 14)
 */
function renderAboutPage(container) {
  const site = getSiteConfig();
  const about = getAboutContent();
  
  updateSEO(
    about.seoTitle || `About — ${site.name}`,
    about.seoDescription || about.introduction || 'Learn about Lizzdo Media, the creative & digital services division of Lizzdo.',
    site.logo,
    'about'
  );

  container.innerHTML = `
    <div class="view-container">
      <div class="about-container">
        <div class="page-title-badge anim" style="--d: 0.05s">
          <span class="badge-dot"></span>
          <span>${about.subheadline || 'Creative & Digital Services Division of Lizzdo'}</span>
        </div>

        <h1 class="section-headline anim" style="--d: 0.12s">
          ${about.heading || 'About Lizzdo Media'}
        </h1>

        <div class="about-card anim" style="--d: 0.2s">
          ${(about.paragraphs || [about.introduction]).map((p) => `<p>${p}</p>`).join('')}
        </div>

        <!-- Core Philosophy Pillars -->
        ${about.pillars && about.pillars.length > 0 ? `
          <div class="detail-section-card anim" style="--d: 0.28s">
            <h3 class="detail-section-title">
              <i class="fa-solid fa-compass" style="font-size: 14px; opacity: 0.8;"></i>
              <span>Our Working Philosophy</span>
            </h3>
            <div class="pillars-grid">
              ${about.pillars
                .map(
                  (pil) => `
                <div class="pillar-card">
                  <span class="pillar-num">${pil.number}</span>
                  <h4 class="pillar-title">${pil.title}</h4>
                  <p class="pillar-desc">${pil.desc}</p>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        ` : ''}

        <!-- Call to action -->
        <div class="detail-action-bar anim" style="--d: 0.35s">
          <div class="action-bar-text">
            <h4>Ready to build your next creative asset?</h4>
            <p>We are available for new client collaborations and custom quotes.</p>
          </div>
          <a href="#contact" class="btn-cta">
            ${about.ctaText || 'Start a Conversation'}
            <i class="fa-solid fa-arrow-right" style="font-size: 12px; margin-left: 6px;"></i>
          </a>
        </div>
      </div>

      ${renderFooterHTML()}
    </div>
  `;
}

/**
 * Blog / Insights Overview View
 */
function renderBlogOverview(container) {
  const site = getSiteConfig();
  const blogPosts = getBlogPosts();
  
  updateSEO(
    `Insights & Journal — ${site.name}`,
    'Practical articles on branding systems, digital marketing creatives, social media strategy, and web design.',
    site.logo,
    'blog'
  );

  container.innerHTML = `
    <div class="view-container">
      <div class="page-title-badge anim" style="--d: 0.05s">
        <span class="badge-dot"></span>
        <span>Insights & Perspectives</span>
      </div>

      <h1 class="section-headline anim" style="--d: 0.12s">
        Creative & Digital Insights
      </h1>

      <p class="section-subhead anim" style="--d: 0.2s">
        Practical articles on branding systems, digital marketing creatives, social media strategy, and web design.
      </p>

      <div class="blog-grid">
        ${blogPosts
          .map(
            (post, idx) => `
          <a href="#blog/${post.slug}" class="blog-card anim" style="--d: ${0.25 + idx * 0.08}s" id="blog-card-${post.slug}">
            <div class="blog-meta">
              <span class="blog-cat">${post.category}</span>
              <span>${post.formattedDate || post.date}</span>
              <span>• ${post.readTime}</span>
            </div>
            <h3 class="blog-title">${post.title}</h3>
            <p class="blog-excerpt">${post.excerpt}</p>
          </a>
        `
          )
          .join('')}
      </div>

      ${renderFooterHTML()}
    </div>
  `;
}

/**
 * Blog Article Detail View with Code Blocks & Markdown Formatting
 * (Requirements 11, 12, 13, 28, 29: Lead Gen CTA with optional Related Service connection)
 */
function renderBlogDetail(container, slug) {
  const site = getSiteConfig();
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    render404Page(container, 'Article not found');
    return;
  }
  
  const articleSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt || post.summary || post.seoDescription,
        "image": post.featuredImage ? `https://media.lizzdo.com${post.featuredImage}` : undefined,
        "datePublished": post.date,
        "author": {
          "@type": "Person",
          "name": post.author || site.name
        },
        "publisher": {
          "@type": "Organization",
          "name": site.name,
          "logo": {
            "@type": "ImageObject",
            "url": "https://media.lizzdo.com/assets/logo.webp"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://media.lizzdo.com/#blog/${post.slug}`
        }
      }
    ]
  };

  updateSEO(
    post.seoTitle || `${post.title} — ${site.name}`,
    post.seoDescription || post.excerpt,
    post.featuredImage || site.logo,
    `blog/${post.slug}`,
    articleSchema
  );

  const articleBodyHtml = renderMarkdown(post.body || post.content);
  const relatedServiceName = post.relatedService || null;

  container.innerHTML = `
    <div class="view-container">
      <div class="service-detail-view">
        <a href="#blog" class="back-link anim" style="--d: 0.05s">
          <i class="fa-solid fa-arrow-left"></i>
          <span>All Insights</span>
        </a>

        <div class="detail-header-card anim" style="--d: 0.12s">
          <div class="blog-meta" style="margin-bottom: 8px;">
            <span class="blog-cat">${post.category}</span>
            <span>${post.formattedDate || post.date}</span>
            <span>• ${post.readTime}</span>
            ${post.author ? `<span>• By ${escapeHtml(post.author)}</span>` : ''}
          </div>
          <h1 class="detail-title">${post.title}</h1>
        </div>

        <div class="about-card markdown-article anim" style="--d: 0.2s">
          ${articleBodyHtml}
        </div>

        <!-- Blog Lead Gen CTA connected to Related Service -->
        <div class="detail-action-bar anim" style="--d: 0.28s">
          <div class="action-bar-text">
            <h4>${relatedServiceName ? `Ready to discuss ${relatedServiceName} for your brand?` : 'Need assistance executing these strategies?'}</h4>
            <p>Our team is available to help implement these solutions tailored to your business goals.</p>
          </div>
          <a href="#contact${relatedServiceName ? `?service=${encodeURIComponent(relatedServiceName)}` : ''}" class="btn-cta">
            ${relatedServiceName ? `Discuss ${relatedServiceName}` : 'Start a Project'}
            <i class="fa-solid fa-arrow-right" style="font-size: 12px; margin-left: 6px;"></i>
          </a>
        </div>
      </div>

      ${renderFooterHTML()}
    </div>
  `;
}

/**
 * 404 Not Found View
 */
function render404Page(container, message = 'Page not found.') {
  const site = getSiteConfig();
  updateSEO(
    `Page Not Found — ${site.name}`,
    'The requested page or case study could not be located.',
    site.logo,
    '404'
  );

  container.innerHTML = `
    <div class="view-container">
      <div class="error-404-container anim" style="--d: 0.1s">
        <div class="error-404-badge">
          <span class="badge-dot"></span>
          <span>404 // Not Found</span>
        </div>
        <h1 class="error-404-title">Page Not Found</h1>
        <p class="error-404-desc">
          ${escapeHtml(message || 'The page or case study you requested could not be located.')}
        </p>
        <div class="error-404-actions">
          <a href="#home" class="btn-cta">
            <i class="fa-solid fa-house" style="margin-right: 6px;"></i>
            Back to Home
          </a>
          <a href="#services" class="sign-in-btn" style="height: 44px; display: inline-flex; align-items: center;">
            View Services
          </a>
        </div>
      </div>
      ${renderFooterHTML()}
    </div>
  `;
}

/**
 * Contact / Project Inquiry Page View with WhatsApp Integration
 * (Requirement 18, 19, 30, 31)
 */
function renderContactPage(container, queryParams) {
  const site = getSiteConfig();
  const services = getServices();
  const budgetOpts = getBudgetOptions();
  
  updateSEO(
    `Contact & Project Inquiry — ${site.name}`,
    'Start a project inquiry or message us on WhatsApp. Custom quotes for brand identity, social content, marketing, and modern websites.',
    site.logo,
    'contact'
  );

  const preselectedService = queryParams ? (queryParams.get('service') || '') : '';

  container.innerHTML = `
    <div class="view-container">
      <div class="contact-container">
        <div class="page-title-badge anim" style="--d: 0.05s">
          <span class="badge-dot"></span>
          <span>Start a Project</span>
        </div>

        <h1 class="section-headline anim" style="--d: 0.12s">
          Let's Build Something Exceptional
        </h1>

        <p class="section-subhead anim" style="--d: 0.2s">
          Share your project details below or message us directly on WhatsApp. We review all inquiries carefully and provide custom quotes.
        </p>

        <div class="contact-card anim" style="--d: 0.28s">
          <form class="contact-form" id="project-inquiry-form" novalidate>
            
            <!-- Honeypot Anti-Spam Field (Hidden from humans) -->
            <input type="text" name="_gotcha" id="client-gotcha" style="position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none;" tabindex="-1" autocomplete="off" aria-hidden="true" />

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="client-name">Your Full Name <span class="required-star">*</span></label>
                <input class="form-input" type="text" id="client-name" name="name" placeholder="Alex Morgan" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="client-business">Business or Brand Name</label>
                <input class="form-input" type="text" id="client-business" name="business" placeholder="Morgan Studio" />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="client-email">Email Address <span class="required-star">*</span></label>
                <input class="form-input" type="email" id="client-email" name="email" placeholder="alex@morganstudio.com" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="client-phone">WhatsApp / Phone Number</label>
                <input class="form-input" type="tel" id="client-phone" name="phone" placeholder="+1 (555) 019-2834" />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="client-service">Service Required <span class="required-star">*</span></label>
                <select class="form-select" id="client-service" name="service" required>
                  <option value="" disabled ${!preselectedService ? 'selected' : ''}>Select a service...</option>
                  ${services
                    .map(
                      (s) => `
                    <option value="${escapeHtml(s.title)}" ${preselectedService.toLowerCase() === s.title.toLowerCase() || preselectedService.toLowerCase() === (s.shortTitle || '').toLowerCase() ? 'selected' : ''}>
                      ${s.number || ''} — ${s.title}
                    </option>
                  `
                    )
                    .join('')}
                  <option value="Multiple Services / Comprehensive Package" ${preselectedService.includes('Multiple') ? 'selected' : ''}>Multiple Services / Comprehensive Package</option>
                  <option value="Other Creative Request">Other Creative Request</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="client-budget">Estimated Budget Range</label>
                <select class="form-select" id="client-budget" name="budget">
                  ${budgetOpts.map((opt) => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="client-timeline">Desired Timeline</label>
                <select class="form-select" id="client-timeline" name="timeline">
                  <option value="Flexible / Not Urgent">Flexible / Not Urgent</option>
                  <option value="1–2 Weeks">1–2 Weeks (Urgent)</option>
                  <option value="2–4 Weeks">2–4 Weeks (Standard)</option>
                  <option value="1–2 Months">1–2 Months</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="client-reference">Reference / Website URL</label>
                <input class="form-input" type="url" id="client-reference" name="reference" placeholder="https://instagram.com/yourbrand" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="client-description">Project Description & Requirements <span class="required-star">*</span></label>
              <textarea class="form-textarea" id="client-description" name="description" rows="4" placeholder="Briefly describe your goals, required deliverables, style preferences, or any questions..." required></textarea>
            </div>

            <div class="form-actions">
              <button type="button" id="btn-send-whatsapp" class="btn-whatsapp-action">
                <i class="fa-brands fa-whatsapp"></i>
                <span>Chat on WhatsApp</span>
              </button>

              <button type="submit" class="btn-secondary-action">
                Submit Inquiry via Email
              </button>
            </div>

            <div class="form-success-banner" id="form-success-message">
              Thank you! Your project inquiry has been received. Our team will review your requirements and respond within 24 hours.
            </div>

          </form>
        </div>
      </div>

      ${renderFooterHTML()}
    </div>
  `;

  // Form submission handler
  const form = container.querySelector('#project-inquiry-form');
  const successBanner = container.querySelector('#form-success-message');
  const btnWhatsApp = container.querySelector('#btn-send-whatsapp');

  if (btnWhatsApp) {
    btnWhatsApp.addEventListener('click', () => {
      const name = (document.getElementById('client-name').value || '').trim() || 'Prospective Client';
      const business = (document.getElementById('client-business').value || '').trim() || 'N/A';
      const service = (document.getElementById('client-service').value || '').trim() || 'Creative Services';
      const timeline = (document.getElementById('client-timeline').value || '').trim() || 'Flexible';
      const budget = (document.getElementById('client-budget').value || '').trim() || 'Not specified';
      const desc = (document.getElementById('client-description').value || '').trim() || 'Interested in discussing a custom project quote.';

      trackEvent('whatsapp_click', { service, budget, timeline });

      // Exact prompt specified format:
      const msg = `Hello Lizzdo Media,\n\nI would like to discuss a project.\n\nName: ${name}\nBusiness: ${business}\nService: ${service}\nTimeline: ${timeline}\nEstimated Budget: ${budget}\n\nProject Details:\n${desc}\n\nPlease let me know the next steps.`;

      const numOnly = (site.whatsappNumber || '+1234567890').replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${numOnly}?text=${encodeURIComponent(msg)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Check Honeypot spam trap
      const gotcha = (document.getElementById('client-gotcha')?.value || '').trim();
      if (gotcha) {
        // Silently swallow bot submission
        form.reset();
        if (successBanner) successBanner.classList.add('visible');
        return;
      }

      const nameInput = document.getElementById('client-name');
      const emailInput = document.getElementById('client-email');
      const serviceInput = document.getElementById('client-service');
      const descInput = document.getElementById('client-description');

      const name = (nameInput?.value || '').trim();
      const email = (emailInput?.value || '').trim();
      const service = (serviceInput?.value || '').trim();
      const desc = (descInput?.value || '').trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name) {
        nameInput?.focus();
        return;
      }
      if (!email || !emailRegex.test(email)) {
        emailInput?.focus();
        return;
      }
      if (!service) {
        serviceInput?.focus();
        return;
      }
      if (!desc) {
        descInput?.focus();
        return;
      }

      trackEvent('contact_form_submission', {
        service,
        timeline: document.getElementById('client-timeline')?.value || '',
        budget: document.getElementById('client-budget')?.value || ''
      });

      if (successBanner) {
        successBanner.classList.add('visible');
        form.reset();
      }
    });
  }
}

/**
 * Universal Site Footer Component
 */
function renderFooterHTML() {
  const site = getSiteConfig();
  const socials = site.socials || {};

  return `
    <footer class="site-footer" id="universal-site-footer">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-brand-title">${site.name}</div>
          <div class="footer-division-tag">${site.division}</div>
          <p class="footer-brand-desc">${site.footer.description}</p>
        </div>

        <div class="footer-cols">
          <div class="footer-col">
            <div class="footer-col-title">Navigation</div>
            <div class="footer-links">
              <a href="#home" class="footer-link">Home</a>
              <a href="#services" class="footer-link">Services</a>
              <a href="#work" class="footer-link">Work</a>
              <a href="#about" class="footer-link">About</a>
              <a href="#blog" class="footer-link">Blog</a>
              <a href="#contact" class="footer-link">Contact</a>
            </div>
          </div>

          <div class="footer-col">
            <div class="footer-col-title">Core Services</div>
            <div class="footer-links">
              <a href="#services/brand-identity" class="footer-link">Brand Identity</a>
              <a href="#services/logo-design" class="footer-link">Logo Design</a>
              <a href="#services/graphic-design" class="footer-link">Graphic Design</a>
              <a href="#services/social-media-design" class="footer-link">Social Media</a>
              <a href="#services/digital-marketing" class="footer-link">Digital Marketing</a>
              <a href="#services/website-development" class="footer-link">Web Development</a>
            </div>
          </div>

          <div class="footer-col">
            <div class="footer-col-title">Direct Inquiries</div>
            <div class="footer-links">
              ${socials.whatsapp ? `
                <a href="${socials.whatsapp}" target="_blank" rel="noopener noreferrer" class="footer-link" style="display: flex; align-items: center; gap: 6px;">
                  <i class="fa-brands fa-whatsapp" style="color: #25d366;"></i>
                  <span>WhatsApp Chat</span>
                </a>
              ` : ''}
              ${site.contactEmail ? `
                <a href="mailto:${site.contactEmail}" class="footer-link">
                  ${site.contactEmail}
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div>${site.footer.copyright} • ${site.footer.tagline}</div>
        
        <div class="footer-socials">
          ${socials.instagram ? `
            <a href="${socials.instagram}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" title="Instagram">
              <i class="fa-brands fa-instagram"></i>
            </a>
          ` : ''}
          ${socials.facebook ? `
            <a href="${socials.facebook}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" title="Facebook">
              <i class="fa-brands fa-facebook"></i>
            </a>
          ` : ''}
          ${socials.linkedin ? `
            <a href="${socials.linkedin}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" title="LinkedIn">
              <i class="fa-brands fa-linkedin"></i>
            </a>
          ` : ''}
          ${socials.whatsapp ? `
            <a href="${socials.whatsapp}" target="_blank" rel="noopener noreferrer" class="footer-social-icon" title="WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          ` : ''}
        </div>
      </div>
    </footer>
  `;
}

/**
 * Stats Count-Up Animation
 */
function initCountUp() {
  const statItems = document.querySelectorAll('.stat-item');
  if (!statItems.length) return;

  const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

  statItems.forEach((el) => {
    const target = parseFloat(el.getAttribute('data-target') || '0');
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const numEl = el.querySelector('.stat-num');
    if (!numEl) return;

    const duration = 1600;
    const startDelay = parseFloat(el.style.getPropertyValue('--d') || '0') * 1000 + 150;

    setTimeout(() => {
      let startTime = null;

      function step(currentTime) {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = easeOutQuart(progress);
        const currentVal = eased * target;

        numEl.textContent = decimals > 0 ? currentVal.toFixed(decimals) : Math.floor(currentVal).toString();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          numEl.textContent = decimals > 0 ? target.toFixed(decimals) : target.toString();
        }
      }

      requestAnimationFrame(step);
    }, startDelay);
  });
}

/**
 * Mobile Navigation Menu Handler
 */
function initMobileMenu() {
  const burgerBtn = document.getElementById('mobile-burger-btn');
  const overlay = document.getElementById('mobile-menu-overlay');
  const sheet = document.getElementById('mobile-menu-sheet');
  const mobileNavLinks = document.querySelectorAll('.mobile-menu-sheet .mobile-nav-link');
  const mobileSignInBtn = document.querySelector('.mobile-sign-in-btn');

  if (!burgerBtn || !overlay || !sheet) return;

  function openMenu() {
    burgerBtn.setAttribute('aria-expanded', 'true');
    overlay.classList.add('open');
    sheet.classList.add('open');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    burgerBtn.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('open');
    sheet.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    const isOpen = burgerBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  burgerBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  if (mobileSignInBtn) {
    mobileSignInBtn.addEventListener('click', () => {
      closeMenu();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burgerBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
}

/**
 * Entrance Animations Trigger
 */
function initEntranceAnimations() {
  const animEls = document.querySelectorAll('.anim');
  animEls.forEach((el) => {
    el.addEventListener(
      'animationend',
      () => {
        el.classList.add('animated');
      },
      { once: true }
    );
  });
}
