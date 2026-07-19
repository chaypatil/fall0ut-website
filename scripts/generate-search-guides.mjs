import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(import.meta.dirname, "..");
const guides = JSON.parse(readFileSync(resolve(root, "data/search-guides.json"), "utf8"));

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const jsonForHtml = (value) => JSON.stringify(value, null, 2).replaceAll("<", "\\u003c");

export function renderGuide(guide) {
  const url = `https://www.fall0ut.in/${guide.slug}`;
  const pageType = guide.type === "about" ? "AboutPage" : "WebPage";
  const imageAlt = `${guide.heading} by FallØut India`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.fall0ut.in/#organization",
        name: "FallØut India",
        alternateName: ["FALL0UT India", "Fall0ut India", "fall0ut"],
        url: "https://www.fall0ut.in/",
        sameAs: ["https://www.instagram.com/fall0utindia"],
      },
      {
        "@type": pageType,
        "@id": `${url}#page`,
        url,
        name: guide.title,
        description: guide.description,
        about: { "@id": "https://www.fall0ut.in/#organization" },
        isPartOf: { "@id": "https://www.fall0ut.in/#website" },
        inLanguage: "en-IN",
      },
      {
        "@type": "WebSite",
        "@id": "https://www.fall0ut.in/#website",
        url: "https://www.fall0ut.in/",
        name: "FallØut India",
        publisher: { "@id": "https://www.fall0ut.in/#organization" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "FallØut India",
            item: "https://www.fall0ut.in/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: guide.heading,
            item: url,
          },
        ],
      },
    ],
  };

  const sections = guide.sections
    .map(
      (section, index) => `
          <section class="editorial-copy-section" aria-labelledby="section-${index + 1}">
            <p class="editorial-number">0${index + 1}</p>
            <div>
              <h2 id="section-${index + 1}">${escapeHtml(section.heading)}</h2>
              <p>${escapeHtml(section.body)}</p>
            </div>
          </section>`,
    )
    .join("");

  const related = guide.related
    .map(
      (link) =>
        `<a href="${escapeHtml(link.href)}"><span>${escapeHtml(link.label)}</span><span aria-hidden="true">↗</span></a>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base href="/" />
    <title>${escapeHtml(guide.title)}</title>
    <meta name="description" content="${escapeHtml(guide.description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:site_name" content="FallØut India" />
    <meta property="og:title" content="${escapeHtml(guide.title)}" />
    <meta property="og:description" content="${escapeHtml(guide.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="https://www.fall0ut.in/assets/hero/f0-hero-desktop-poster.jpg" />
    <meta property="og:image:width" content="1600" />
    <meta property="og:image:height" content="900" />
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(guide.title)}" />
    <meta name="twitter:description" content="${escapeHtml(guide.description)}" />
    <meta name="twitter:image" content="https://www.fall0ut.in/assets/hero/f0-hero-desktop-poster.jpg" />
    <meta name="theme-color" content="#01040a" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&amp;family=DM+Sans:wght@400;500;700&amp;display=swap" rel="stylesheet" />
    <link rel="preload" as="image" href="./assets/hero/f0-hero-desktop-poster.jpg" />
    <link rel="icon" href="./assets/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" href="./assets/favicon.png" />
    <link rel="apple-touch-icon" href="./assets/favicon.png" />
    <link rel="stylesheet" href="./styles.css" />
    <script>
      window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    </script>
    <script defer src="/_vercel/insights/script.js"></script>
    <script type="application/ld+json">
${jsonForHtml(schema)}
    </script>
  </head>
  <body class="editorial-page">
    <div class="wall-texture" aria-hidden="true"></div>
    <header class="site-header">
      <nav class="header-inner" aria-label="Primary navigation">
        <div class="nav-cluster"><a href="/events" class="nav-link">Events</a></div>
        <a class="header-brand" href="/" aria-label="FallØut India home">
          <span class="wordmark-crop compact"><img src="./assets/fall0ut-wordmark-cropped.webp" alt="" width="900" height="378" /></span>
          <span class="india-label">India</span>
        </a>
        <a href="/contact" class="nav-link nav-link--right">Contact</a>
      </nav>
    </header>
    <main>
      <section class="editorial-hero" aria-labelledby="editorial-title">
        <img src="./assets/hero/f0-hero-desktop-poster.jpg" alt="${escapeHtml(imageAlt)}" width="1600" height="900" fetchpriority="high" />
        <div class="editorial-hero-scrim" aria-hidden="true"></div>
        <div class="editorial-hero-copy">
          <p class="eyebrow">${escapeHtml(guide.eyebrow)}</p>
          <h1 id="editorial-title">${escapeHtml(guide.heading)}</h1>
          <p>${escapeHtml(guide.intro)}</p>
          <div class="editorial-actions">
            <a class="primary-button" href="${escapeHtml(guide.primaryHref)}"><span>${escapeHtml(guide.primaryLabel)}</span></a>
            <a class="section-action" href="${escapeHtml(guide.secondaryHref)}"><span>${escapeHtml(guide.secondaryLabel)}</span></a>
          </div>
        </div>
      </section>
      <article class="section editorial-body">
${sections}
        <nav class="editorial-related" aria-label="Related FallØut guides">
          <p class="eyebrow">Continue exploring</p>
          ${related}
        </nav>
      </article>
    </main>
    <nav class="mobile-quickbar" aria-label="Quick actions">
      <a class="mobile-quickbar-link mobile-quickbar-link--primary" href="/events">Events</a>
      <a class="mobile-quickbar-link" href="/calendar">Calendar</a>
      <a class="mobile-quickbar-link" href="/f0moments">FØ Moments</a>
    </nav>
    <footer class="site-footer" aria-label="Footer"><a href="/about">FALL0UT India</a></footer>
    <script>
      document.addEventListener("click", (event) => {
        const link = event.target.closest("a[href]");
        if (!link || typeof window.va !== "function") return;
        const href = link.getAttribute("href") || "";
        window.va("event", { name: "navigation_click", data: { target: href, placement: "${escapeHtml(guide.slug)}" } });
      });
    </script>
  </body>
</html>
`;
}

export function generateSearchGuides() {
  for (const guide of guides) {
    writeFileSync(resolve(root, `${guide.slug}.html`), renderGuide(guide), "utf8");
    console.log(`generated ${guide.slug}.html`);
  }
}

if (resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  generateSearchGuides();
}
