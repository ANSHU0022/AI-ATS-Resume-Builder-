import { useEffect } from "react";

const SITE_NAME = "ATSForge";
const DEFAULT_IMAGE = "/high-resolution-color-logo.png";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });
}

function upsertLink(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, value);
    }
  });
}

export default function SEOHead({
  title,
  description,
  path = "/",
  keywords = "",
  robots = "index,follow",
  type = "website",
  image = DEFAULT_IMAGE,
  schema,
}) {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const fullUrl = new URL(path, siteUrl).toString();
    const imageUrl = new URL(image, siteUrl).toString();
    const googleVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    document.title = fullTitle;

    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywords });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });

    upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: fullUrl });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });

    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });

    if (googleVerification) {
      upsertMeta('meta[name="google-site-verification"]', {
        name: "google-site-verification",
        content: googleVerification,
      });
    }

    upsertLink('link[rel="canonical"]', { rel: "canonical", href: fullUrl });

    const schemaId = "atsforge-seo-schema";
    const existingSchema = document.getElementById(schemaId);
    if (existingSchema) existingSchema.remove();

    if (schema) {
      const schemaScript = document.createElement("script");
      schemaScript.type = "application/ld+json";
      schemaScript.id = schemaId;
      schemaScript.text = JSON.stringify(schema);
      document.head.appendChild(schemaScript);
    }
  }, [title, description, path, keywords, robots, type, image, schema]);

  return null;
}
