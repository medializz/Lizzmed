# Lizzdo Media — Decap CMS Management Guide

A complete, non-technical editorial guide for managing all content, branding, services, portfolio projects, and articles across **Lizzdo Media** (`https://media.lizzdo.com`) without modifying source code.

---

## 1. Accessing Decap CMS

- **Admin URL**: `https://media.lizzdo.com/admin/`
- **Supported Browsers**: Chrome, Safari, Edge, Firefox
- **Authentication**: Sign in using your authorized GitHub or Netlify Identity credentials.

---

## 2. Managing Brand & Site Settings

Navigate to **Site & Brand Settings → Global Brand, Contact & Social Settings**.

Here you can update global information that reflects across every page of the website:

- **Brand Name**: Change the primary company name (default: `Lizzdo Media`).
- **Brand Taglines**: Update the primary tagline and division tagline.
- **Logos & Favicon**:
  - **Primary Logo**: Updates the header, footer, and search engine schema.
  - **Favicon**: Changes the browser tab icon.
  - **Default Social Sharing Image**: Image preview used when links are shared on WhatsApp, iMessage, Twitter, and LinkedIn.
- **Contact & WhatsApp**:
  - **Business Contact Email**: Where contact form emails and direct inquiries point.
  - **WhatsApp Business Number**: Format with international country code (e.g. `+1234567890`). All WhatsApp buttons on the site automatically link to this number with pre-formatted inquiry text.
- **Social Media Links**: Update profile links for Instagram, Facebook, and LinkedIn.
- **Global CTA & Footer**: Update primary button text (e.g. `Start a Project`), copyright notice, and parent company links.
- **Default SEO**: Set fallback search engine titles and descriptions.

---

## 3. Editing Homepage Sections

Navigate to **Homepage → Homepage Sections & Content**.

All homepage components are organized into logical sections:

1. **Hero Section**: Edit Headline Line 1, Headline Line 2, subhead description, and call-to-action button labels.
2. **Stats Counter**: Adjust numerical targets, suffixes (`+`, `%`), and labels.
3. **Introduction**: Edit the introductory narrative paragraphs.
4. **Services Section**: Customize the section heading and description.
5. **Expertise Showcase**: Edit discipline titles and descriptions.
6. **Featured Work Header**: Customize the portfolio preview banner.
7. **Showcases (Branding, Social Media, Marketing, Web Development)**: Edit highlights, bullet points, and solution tiers.
8. **Creative Process**: Update the 4-step creative workflow.
9. **Final Call to Action**: Customize the bottom banner headline and button copy.
10. **Homepage SEO**: Set custom meta title and description for search engines.

---

## 4. Managing Services (11 Core Disciplines)

Navigate to **Services → Services List**.

### To edit an existing service:
1. Click on the service title.
2. Update the **Title**, **Short Summary**, **Full Description**, **What We Provide**, **Deliverables**, or **Why It Matters**.
3. Adjust the **Display Order** (e.g., `1`, `2`, `3`) to rearrange position.

### To publish or unpublish a service:
- Toggle the **Published** switch:
  - **ON (true)**: Visible across the site and automatically listed in the contact form dropdown.
  - **OFF (false)**: Hidden from the public website and contact form dropdown.

---

## 5. Managing Work / Portfolio Projects

Navigate to **Work / Portfolio → All Projects List**.

### Adding or editing a project:
1. **Title & Slug**: Give the project a clear name and URL slug (e.g. `aura-brand-identity`).
2. **Client & Year**: Enter client name and completion year.
3. **Category**: Select the primary discipline (e.g., *Branding*, *Websites*, *Social Media*).
4. **Featured Switch**: Toggle **Featured on Homepage** to `true` to highlight the project on the homepage.
5. **Summary & Overview**: Write the case study summary, objective, and creative direction.
6. **Gallery & Deliverables**: Upload high-resolution deliverable images, add titles, and descriptions.
7. **Links**: Add live website URL, Instagram post link, or hosted video URL.

---

## 6. Writing & Publishing Blog Articles

Navigate to **Blog / Insights → All Blog Articles**.

### Adding an article:
1. **Article Title & Slug**: Enter a descriptive title and URL slug (e.g., `anatomy-of-modern-brand`).
2. **Publish Date & Read Time**: Set the publication date and estimated read time.
3. **Category & Related Service**: Connect the article to a relevant service to display contextual calls-to-action.
4. **Excerpt**: Write a 1–2 sentence summary shown on blog preview cards.
5. **Article Body**: Write full content using the rich Markdown editor:
   - Use `#`, `##`, `###` for headings.
   - Use `- ` or `* ` for bullet lists.
   - Use `1. `, `2. ` for numbered lists.
   - Wrap code or snippets with triple backticks: ` ```javascript ... ``` ` (syntax copy buttons are automatically added).
6. **Publish Toggle**: Toggle **Published** to `true` to make it live.

---

## 7. Managing Testimonials & FAQs

- **Testimonials**: Add client quotes, company names, and avatars. Testimonials are only displayed on the website when `published` is set to `true` and text is provided.
- **FAQ Collection**: Add or reorder frequently asked questions and answers.

---

## 8. Media Upload Guidelines

- **Supported Formats**: `.webp` (recommended for fastest load times), `.png`, `.jpg`, `.mp4`.
- **Image Sizing**:
  - Logos & Icons: 200×200px to 500×500px transparent WebP/PNG.
  - Hero & Portfolio Gallery Images: 1600×1000px or 1920×1080px WebP.
  - Social Preview Images: 1200×630px JPG/WebP.
- **Storage**: Media is uploaded directly to `public/assets/` in your repository.

---

## 9. Publishing & Deployment Workflow

1. Click **Save** in Decap CMS after making changes.
2. Decap CMS automatically commits the updated JSON files and images directly to your GitHub repository `main` branch.
3. **Automated Build**: GitHub Actions immediately detects the new commit, runs the automated build, and updates `https://media.lizzdo.com` in approximately 1–2 minutes.
4. Refresh `https://media.lizzdo.com` in your browser to view your live changes.
