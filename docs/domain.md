# Lizzdo Media — Custom Domain & Cloudflare DNS Configuration

This guide details the DNS, SSL, and domain routing setup for **`media.lizzdo.com`**.

---

## 1. Domain Overview

- **Production Domain**: `https://media.lizzdo.com`
- **Root Domain**: `lizzdo.com` (Do NOT point root domain to this repository; only the `media` subdomain).
- **Target Host**: `<github-username>.github.io`

---

## 2. Cloudflare DNS Configuration

In your Cloudflare dashboard under the `lizzdo.com` zone, configure the following DNS record:

| Type | Name (Subdomain) | Target | Proxy Status | TTL |
|---|---|---|---|---|
| **CNAME** | `media` | `<your-github-username>.github.io` | **DNS Only (Gray Cloud)** during verification / **Proxied** once verified | Auto |

> **Important Note on Cloudflare Proxying**:
> When first verifying the custom domain in GitHub Pages:
> 1. Set the CNAME proxy status to **DNS Only** (gray cloud).
> 2. Allow GitHub to verify domain ownership and provision the Let's Encrypt TLS certificate.
> 3. Once verified and **Enforce HTTPS** is enabled in GitHub repository settings, you may toggle the record to **Proxied** (orange cloud) if desired.
> 4. If proxied, ensure Cloudflare's SSL/TLS mode is set to **Full** or **Full (Strict)**.

---

## 3. CNAME File in Repository

GitHub Pages requires a `CNAME` file at the root of the published output.
This project includes:
- `public/CNAME`: Contains `media.lizzdo.com`. Vite automatically copies this to `dist/CNAME` during every production build (`npm run build`).

---

## 4. Troubleshooting Common Issues

### "Domain's DNS record could not be resolved"
- Verify that the CNAME points to `<username>.github.io` and not the repository name directly.
- Check DNS propagation using `dig CNAME media.lizzdo.com` or `nslookup media.lizzdo.com`.

### "Certificate is pending or failing"
- Temporarily disable Cloudflare proxying (change from Orange Cloud to Gray Cloud / DNS Only) until GitHub issues the SSL certificate.
- Ensure CAA records (if any exist) allow `letsencrypt.org` and `digicert.com`.

### "Too Many Redirects" (ERR_TOO_MANY_REDIRECTS)
- In Cloudflare SSL/TLS settings, set SSL mode to **Full** or **Full (Strict)** (never *Flexible*, which causes infinite redirect loops with HTTPS-enforced hosts).
