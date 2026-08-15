# Lizzdo Media — Deployment Architecture & Guide

This document provides a comprehensive guide for building, maintaining, and deploying the **Lizzdo Media** website (`https://media.lizzdo.com`).

---

## 1. Hosting & Infrastructure Architecture

| Layer | Provider / Tool | Purpose |
|---|---|---|
| **Repository** | GitHub | Source control & CI/CD trigger |
| **CI / CD Pipeline** | GitHub Actions | Automated build & deployment workflow |
| **Static Hosting** | GitHub Pages | High-performance edge static asset delivery |
| **DNS & Domain** | Cloudflare | Subdomain routing (`media.lizzdo.com`) |
| **Content Management** | Decap CMS | Git-backed headless content editing |

---

## 2. GitHub Actions Workflow Configuration

The deployment pipeline is located at `.github/workflows/deploy.yml`:

```yaml
name: Deploy Lizzdo Media to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Upload GitHub Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 3. GitHub Pages Repository Settings

To ensure the custom domain and actions deployment work seamlessly:

1. Navigate to **GitHub Repository** → **Settings** → **Pages**.
2. Under **Build and deployment**:
   - **Source**: Select `GitHub Actions`.
3. Under **Custom domain**:
   - Enter: `media.lizzdo.com`
   - Check **Enforce HTTPS** (once DNS and certificate issuance complete).

---

## 4. SPA Routing & 404 Fallback

GitHub Pages serves static files directly. Because Lizzdo Media uses client-side routing, the file `public/404.html` (which is copied to `dist/404.html` during the build) provides single-page routing resolution so direct URL access or deep links load the application correctly without 404 errors.

---

## 5. Build Artifact Verification

Before pushing to production, verify the build locally:

```bash
# Clean install dependencies
npm ci

# Execute production build
npm run build

# Preview build artifacts
npm run preview
```
