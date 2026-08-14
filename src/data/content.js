/**
 * Lizzdo Media - Content Store & Decap CMS Data Bridge
 * Centralized, decoupled content definitions loading from modular CMS JSON files.
 */

import settingsData from "./settings.json";
import homeData from "./home.json";
import servicesJson from "./services.json";
import portfolioJson from "./portfolio.json";
import blogJson from "./blog.json";
import aboutJson from "./about.json";
import testimonialsJson from "./testimonials.json";
import faqJson from "./faq.json";

// Safe Storage Bridge to support instant live edits / previews from Decap CMS / Local Storage
function getCachedData(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const cached = localStorage.getItem(`lizzdo_${key}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // Fall back silently
  }
  return fallback;
}

export function getSiteConfig() {
  const data = getCachedData("settings", settingsData);
  return {
    name: data.companyName || "Lizzdo Media",
    division: data.division || "Creative & Digital Services Division of Lizzdo",
    tagline: data.tagline || "Branding, Content, Marketing & Websites",
    description: data.description || "Creative and digital services division of Lizzdo.",
    logo: data.logo || "/assets/logo.webp",
    favicon: data.favicon || "/assets/logo.webp",
    whatsappNumber: data.whatsappNumber || "+1234567890",
    contactEmail: data.contactEmail || "hello@lizzdomedia.com",
    socials: {
      instagram: data.instagramUrl || "",
      facebook: data.facebookUrl || "",
      linkedin: data.linkedinUrl || "",
      whatsapp: data.whatsappNumber ? `https://wa.me/${data.whatsappNumber.replace(/[^0-9]/g, "")}` : ""
    },
    legal: {
      privacy: "Privacy Policy",
      terms: "Terms of Service"
    },
    footer: {
      description: data.description || "Creative and digital services division of Lizzdo. Empowering modern businesses with enduring brand identities, high-impact marketing visuals, and streamlined websites.",
      tagline: data.footerTagline || "A Lizzdo company",
      copyright: data.copyrightText || "© 2026 Lizzdo Media. All rights reserved."
    },
    seo: {
      defaultTitle: data.defaultSeoTitle || "Lizzdo Media — Creative & Digital Services",
      defaultDescription: data.defaultSeoDescription || "Branding, visual content, digital marketing and simple modern websites designed for growing businesses."
    }
  };
}

export function getHomeContent() {
  return getCachedData("home", homeData);
}

export function getServices() {
  const list = getCachedData("services", servicesJson);
  const items = Array.isArray(list) ? list : (list.services || []);
  return items
    .filter(s => s.published !== false)
    .sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
}

export function getAllServices() {
  const list = getCachedData("services", servicesJson);
  return Array.isArray(list) ? list : (list.services || []);
}

export function getServiceBySlug(slug) {
  if (!slug) return null;
  const services = getAllServices();
  const cleanSlug = slug.toLowerCase().trim();
  return services.find(s => (s.slug && s.slug.toLowerCase() === cleanSlug)) || null;
}

export function getPortfolio() {
  const list = getCachedData("portfolio", portfolioJson);
  const items = Array.isArray(list) ? list : (list.projects || []);
  return items
    .filter(p => p.published !== false)
    .sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
}

export function getFeaturedPortfolio() {
  const all = getPortfolio();
  const featured = all.filter(p => p.featured === true);
  return featured.length > 0 ? featured : all.slice(0, 4);
}

export function getPortfolioBySlug(slug) {
  if (!slug) return null;
  const list = getCachedData("portfolio", portfolioJson);
  const items = Array.isArray(list) ? list : (list.projects || []);
  const cleanSlug = slug.toLowerCase().trim();
  return items.find(p => (p.slug && p.slug.toLowerCase() === cleanSlug)) || null;
}

export function getBlogPosts() {
  const list = getCachedData("blog", blogJson);
  const items = Array.isArray(list) ? list : (list.articles || []);
  return items
    .filter(b => b.published !== false)
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
}

export function getBlogPostBySlug(slug) {
  if (!slug) return null;
  const list = getCachedData("blog", blogJson);
  const items = Array.isArray(list) ? list : (list.articles || []);
  const cleanSlug = slug.toLowerCase().trim();
  return items.find(b => (b.slug && b.slug.toLowerCase() === cleanSlug)) || null;
}

export function getAboutContent() {
  return getCachedData("about", aboutJson);
}

export function getTestimonials() {
  const list = getCachedData("testimonials", testimonialsJson);
  const items = Array.isArray(list) ? list : (list.testimonials || []);
  return items
    .filter(t => t.published === true && t.testimonial && t.clientName)
    .sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
}

export function getFAQ(category = null) {
  const list = getCachedData("faq", faqJson);
  const items = Array.isArray(list) ? list : (list.faq || []);
  const published = items.filter(f => f.published !== false && f.question && f.answer);
  const sorted = published.sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99));
  if (category) {
    return sorted.filter(f => f.category && f.category.toLowerCase() === category.toLowerCase());
  }
  return sorted;
}

export const budgetOptions = [
  "Not sure yet",
  "Under $100",
  "$100–$250",
  "$250–$500",
  "$500–$1,000",
  "$1,000+"
];

export function getBudgetOptions() {
  return budgetOptions;
}

// Compatibility exports
export const siteConfig = getSiteConfig();
export const homeContent = getHomeContent();
export const servicesData = getServices();
export const portfolioData = getPortfolio();
export const aboutContent = getAboutContent();
export const blogData = getBlogPosts();
