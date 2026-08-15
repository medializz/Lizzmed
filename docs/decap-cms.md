# Lizzdo Media — Decap CMS Architecture & Guide

This guide explains the headless Decap CMS integration, schema organization, and editorial workflow for **Lizzdo Media**.

---

## 1. CMS Architecture

Decap CMS is a Git-backed headless content management system running entirely in the browser at `/admin/`.

- **Admin Entry**: `https://media.lizzdo.com/admin/`
- **Configuration**: `/admin/config.yml` (copied to `dist/admin/config.yml` on build)
- **Data Format**: Modular JSON files in `src/data/`
- **Assets Directory**: `public/assets/uploads/`

---

## 2. Authentication Setup

Decap CMS connects directly to the GitHub repository using the `github` backend:

```yaml
backend:
  name: github
  repo: your-org-or-username/lizzdo-media-repo
  branch: main
```

### GitHub OAuth Authentication Options:
1. **GitHub PKCE Authorization** (Built-in Decap CMS GitHub integration)
2. **Netlify Identity / External OAuth Gateway** (e.g. standard Netlify or custom OAuth microservice)
3. **Local Backend Mode** (For local testing without live git commits):
   ```bash
   npx decap-server
   ```
   Set `local_backend: true` in `admin/config.yml` during local content authoring.

---

## 3. Collections & Content Schema

The CMS manages the following distinct content collections:

| Collection | File / Directory | Description |
|---|---|---|
| **Site Settings** | `src/data/settings.json` | Brand name, contact email, WhatsApp number, social URLs, footer, and default SEO |
| **Home Page** | `src/data/home.json` | Hero copy, badge labels, feature pillars, dynamic stats counters |
| **Services (11)** | `src/data/services.json` | Capabilities, deliverables, process steps, and service FAQs |
| **Portfolio** | `src/data/portfolio.json` | Case studies, challenges, solutions, visual galleries, and metrics |
| **Insights / Blog** | `src/data/blog.json` | Articles with Markdown formatting and related service connections |
| **About Page** | `src/data/about.json` | Company ethos, division history, values, and leadership narrative |
| **Testimonials** | `src/data/testimonials.json` | Client reviews, company names, project scopes, and ratings |
| **FAQs** | `src/data/faq.json` | Categorized questions and answers for pricing, process, and deliverables |

---

## 4. Editorial Workflow

1. Log into `/admin/`.
2. Edit or create content entries.
3. Decap CMS automatically commits JSON updates and uploads media assets directly to the `main` branch of your GitHub repository.
4. GitHub Actions detects the commit on `main`, triggers the automated build, and redeploys the updated static site within ~1-2 minutes.
