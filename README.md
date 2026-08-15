# Lizzdo Media — Production Website

Official production repository for **Lizzdo Media** (`https://media.lizzdo.com`), the creative and digital services division of Lizzdo.

---

## 🛠️ Technology Stack

- **Framework**: Modern Vite + Static Vanilla / TypeScript SPA Architecture
- **CMS**: Decap CMS (Git-backed headless CMS at `/admin/`)
- **Styling**: Tailored Dark/Neutral Theme with custom CSS styling and responsive layout
- **Deployment**: GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`)
- **DNS / Edge**: Cloudflare (`media.lizzdo.com`)
- **Lead Generation**: Direct WhatsApp API integration and structured email inquiry workflows

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml        # Automated GitHub Actions deployment to GitHub Pages
├── admin/
│   ├── config.yml            # Decap CMS collection schemas and backend configuration
│   └── index.html            # Decap CMS administrative control panel
├── docs/
│   ├── decap-cms.md          # Decap CMS setup, OAuth, and collection guide
│   ├── deployment.md         # GitHub Actions and GitHub Pages deployment workflow
│   └── domain.md             # Custom domain DNS and Cloudflare routing guide
├── public/
│   ├── 404.html              # SPA client-side fallback router for GitHub Pages
│   ├── CNAME                 # Custom domain declaration (media.lizzdo.com)
│   ├── robots.txt            # Search engine crawler instructions
│   ├── sitemap.xml           # XML sitemap with all routes and slugs
│   └── assets/               # Static media, logos, and uploads
├── src/
│   └── data/                 # Decoupled JSON data files managed by Decap CMS
│       ├── about.json
│       ├── blog.json
│       ├── faq.json
│       ├── home.json
│       ├── portfolio.json
│       ├── services.json
│       ├── settings.json
│       └── testimonials.json
├── index.html                # Application root with Open Graph & Twitter meta tags
├── main.js                   # Client-side router, view renderers, SEO & state manager
├── package.json              # Project dependencies and build scripts
└── vite.config.ts            # Vite build configuration (base: '/')
```

---

## 🚀 Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```
The output will be placed in the `dist/` directory, ready for deployment to GitHub Pages.

---

## 📖 Documentation
- [Deployment Guide](docs/deployment.md)
- [Decap CMS Guide](docs/decap-cms.md)
- [Custom Domain & DNS Guide](docs/domain.md)
