#!/usr/bin/env node
/**
 * Builds a static HTML file per live event so link previews (WhatsApp, Instagram,
 * X, Google) show that event's own poster, name, date and venue.
 *
 * Event pages are rendered client side, and crawlers do not run JavaScript, so
 * every /event/... URL would otherwise preview as the generic homepage card.
 * Each generated file is index.html with only the head tags swapped, so the app
 * still boots and routes exactly as before.
 *
 * Everything is read back out of index.html, so these pages cannot drift from
 * what the site actually shows. Re-run after adding, repricing or retiring an event:
 *
 *   node scripts/build-share-pages.js
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SITE = "https://www.fall0ut.in";
const OG_DIR = path.join(ROOT, "assets", "og");
const OUT_DIR = path.join(ROOT, "event");

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

/** Pull a top-level `const NAME = {...};` object out of index.html by brace matching. */
function extractObject(source, name) {
  const start = source.indexOf(`const ${name} = {`);
  if (start === -1) throw new Error(`could not find ${name} in index.html`);
  let i = source.indexOf("{", start);
  let depth = 0;
  for (let j = i; j < source.length; j += 1) {
    if (source[j] === "{") depth += 1;
    else if (source[j] === "}") {
      depth -= 1;
      if (depth === 0) {
        // eslint-disable-next-line no-eval
        return eval(`(${source.slice(i, j + 1)})`);
      }
    }
  }
  throw new Error(`unbalanced braces reading ${name}`);
}

const ticketCatalog = extractObject(html, "ticketCatalog");
const ticketContexts = extractObject(html, "ticketContexts");
const posterFallbacks = extractObject(html, "eventPosterFallbacks");

/** Every calendar row is the authoritative list of title / date / venue per slug. */
function readCalendarEntries(source) {
  const entries = new Map();
  const row =
    /<a\s+class="calendar-event[^"]*"\s+data-event-slug="([^"]+)"[\s\S]*?<time datetime="([^"]+)">[^<]*<\/time>\s*<strong>([^<]+)<\/strong>\s*<span>([^<]+)<\/span>/g;
  let match;
  while ((match = row.exec(source)) !== null) {
    const [, slug, date, title, venue] = match;
    entries.set(slug, { slug, date, title: title.trim(), venue: venue.trim() });
  }
  return entries;
}

/** Carousel slides carry the poster actually displayed for an event. */
function readSlidePosters(source) {
  const posters = new Map();
  const slide = /data-event-slug="([^"]+)"[\s\S]{0,900}?<img[\s\S]{0,200}?src="\.\/([^"]+)"/g;
  let match;
  while ((match = slide.exec(source)) !== null) {
    if (!posters.has(match[1])) posters.set(match[1], match[2]);
  }
  return posters;
}

const calendar = readCalendarEntries(html);
const slidePosters = readSlidePosters(html);

function resolvePoster(slug) {
  const context = ticketContexts[slug];
  const candidates = [
    slidePosters.get(slug),
    posterFallbacks[slug] && posterFallbacks[slug].replace(/^\.\//, ""),
    // Multi-city events share one catalog, so fall back to the canonical slug's art.
    context && slidePosters.get(context.catalogSlug),
    context && posterFallbacks[context.catalogSlug] && posterFallbacks[context.catalogSlug].replace(/^\.\//, ""),
  ].filter(Boolean);
  return candidates.find((file) => fs.existsSync(path.join(ROOT, file)));
}

function lowestPrice(slug) {
  const context = ticketContexts[slug];
  const catalog = context && ticketCatalog[context.catalogSlug];
  if (!catalog) return null;
  const rows = catalog.cities
    ? catalog.cities[context.defaultCity] || Object.values(catalog.cities)[0]
    : catalog.categoriesAfterSwitch || catalog.categories;
  const prices = (rows || [])
    .filter((row) => row[5] !== "sold-out")
    .map((row) => Number(row[2]))
    .filter(Boolean);
  return prices.length ? Math.min(...prices) : null;
}

const formatDate = (iso) =>
  new Date(`${iso}T12:00:00+05:30`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

const escapeHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ImageMagick is present on a workstation but not on the deploy builder, so the
 * cards are generated locally and committed. On the builder we reuse them and
 * only rebuild the HTML, which is the part that actually goes stale. */
const hasMagick = (() => {
  try {
    execFileSync("magick", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

/** Letterbox the poster onto a 1200x630 card so nothing is cropped and the shape suits every platform. */
function buildShareImage(slug, posterFile) {
  const out = path.join(OG_DIR, `${slug}.jpg`);

  if (!hasMagick) {
    // Without a card the link would preview as the generic site card, so say so
    // rather than shipping a page pointing at an image that does not exist.
    if (!fs.existsSync(out)) return null;
    return out;
  }

  execFileSync("magick", [
    "-size", "1200x630", "xc:#01040a",
    "(", path.join(ROOT, posterFile), "-resize", "1200x630", ")",
    "-gravity", "center", "-composite",
    "-quality", "86", "-strip",
    out,
  ]);
  return out;
}

function buildPage(entry) {
  const { slug, title, venue, date } = entry;
  const price = lowestPrice(slug);
  const pageTitle = `${title} | ${venue.split("/").pop().trim()} | FallØut India`;
  const description = [
    `${title} on ${formatDate(date)} at ${venue.replace(/\s*\/\s*/, ", ")}.`,
    price ? `Offline tickets from ₹${price.toLocaleString("en-IN")}.` : null,
    "Book direct with FallØut India.",
  ]
    .filter(Boolean)
    .join(" ");

  const image = `${SITE}/assets/og/${slug}.jpg`;
  const canonical = `${SITE}/event/${slug}`;

  return html
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escapeHtml(pageTitle)}</title>`,
    )
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${escapeHtml(description)}$2`,
    )
    .replace(
      /(<link id="canonical-url" rel="canonical" href=")[^"]*(")/,
      `$1${canonical}$2`,
    )
    .replace(/(<meta property="og:type" content=")website(")/, "$1article$2")
    .replace(
      /(property="og:title"\s+content=")[^"]*(")/,
      `$1${escapeHtml(pageTitle)}$2`,
    )
    .replace(
      /(property="og:description"\s+content=")[^"]*(")/,
      `$1${escapeHtml(description)}$2`,
    )
    .replace(/(property="og:image"\s+content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(property="og:image:alt"\s+content=")[^"]*(")/, `$1${escapeHtml(`${title} poster`)}$2`)
    .replace(
      /(name="twitter:title"\s+content=")[^"]*(")/,
      `$1${escapeHtml(pageTitle)}$2`,
    )
    .replace(
      /(name="twitter:description"\s+content=")[^"]*(")/,
      `$1${escapeHtml(description)}$2`,
    )
    .replace(/(name="twitter:image"\s+content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(name="twitter:image:alt"\s+content=")[^"]*(")/, `$1${escapeHtml(`${title} poster`)}$2`)
    .replace(/(rel="image_src"\s+href=")[^"]*(")/, `$1${image}$2`);
}

fs.mkdirSync(OG_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

// Only events that are still sellable get a share page; past ones stay on the generic card.
const today = new Date().toISOString().slice(0, 10);
const live = [...calendar.values()].filter(
  (entry) => entry.date >= today && ticketContexts[entry.slug],
);

const built = [];
for (const entry of live) {
  const posterFile = resolvePoster(entry.slug);
  if (!posterFile) {
    console.warn(`  skipped ${entry.slug}: no poster found`);
    continue;
  }
  if (!buildShareImage(entry.slug, posterFile)) {
    console.warn(`  skipped ${entry.slug}: share card missing and ImageMagick unavailable`);
    continue;
  }
  fs.writeFileSync(path.join(OUT_DIR, `${entry.slug}.html`), buildPage(entry), "utf8");
  built.push({ slug: entry.slug, poster: posterFile });
}

console.log(`Built ${built.length} share pages:`);
built.forEach((b) => console.log(`  /event/${b.slug}  <-  ${b.poster}`));

/* ------------------------------------------------------------------ *
 * Keep the sitemap and the raves.html event schema in step with the
 * same list, so they cannot drift the way they did before.
 * ------------------------------------------------------------------ */

const liveSlugs = new Set(built.map((b) => b.slug));
const stamp = new Date().toISOString().slice(0, 10);

function syncSitemap() {
  const file = path.join(ROOT, "sitemap.xml");
  let xml = fs.readFileSync(file, "utf8");

  // Drop event URLs that are no longer sellable.
  xml = xml.replace(
    /\s*<url>\s*<loc>https:\/\/www\.fall0ut\.in\/event\/([^<]+)<\/loc>[\s\S]*?<\/url>/g,
    (block, slug) => (liveSlugs.has(slug) ? block : ""),
  );

  // Add any live event that is missing, and refresh lastmod on the rest.
  for (const slug of liveSlugs) {
    const loc = `${SITE}/event/${slug}`;
    if (xml.includes(`<loc>${loc}</loc>`)) {
      xml = xml.replace(
        new RegExp(`(<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>\\s*<lastmod>)[^<]*`),
        `$1${stamp}`,
      );
    } else {
      xml = xml.replace(
        "</urlset>",
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${stamp}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`,
      );
    }
  }

  fs.writeFileSync(file, xml, "utf8");
  console.log(`\nSitemap synced: ${liveSlugs.size} event URLs.`);
}

function syncEventSchema() {
  const file = path.join(ROOT, "raves.html");
  let page = fs.readFileSync(file, "utf8");

  const anchor = page.indexOf('"@id": "https://www.fall0ut.in/raves-in-india#events"');
  if (anchor === -1) {
    console.warn("  skipped raves.html: events ItemList not found");
    return;
  }
  const keyAt = page.indexOf('"itemListElement"', anchor);
  const open = page.indexOf("[", keyAt);
  let depth = 0;
  let close = open;
  for (; close < page.length; close += 1) {
    if (page[close] === "[") depth += 1;
    else if (page[close] === "]") {
      depth -= 1;
      if (depth === 0) break;
    }
  }

  const items = built.map((b, index) => {
    const entry = calendar.get(b.slug);
    const [venueName, city] = entry.venue.split("/").map((part) => part.trim());
    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "MusicEvent",
        name: `${entry.title}${city ? ` ${city}` : ""}`,
        startDate: entry.date,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        url: `${SITE}/event/${b.slug}`,
        image: `${SITE}/assets/og/${b.slug}.jpg`,
        location: {
          "@type": "Place",
          name: venueName,
          address: { "@type": "PostalAddress", addressLocality: city || "India", addressCountry: "IN" },
        },
      },
    };
  });

  const indented = JSON.stringify(items, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : `            ${line}`))
    .join("\n");

  page = page.slice(0, open) + indented + page.slice(close + 1);
  page = page.replace(/("numberOfItems":\s*)\d+/, `$1${items.length}`);
  fs.writeFileSync(file, page, "utf8");
  console.log(`Event schema synced: ${items.length} events in raves.html.`);
}

syncSitemap();
syncEventSchema();

console.log("\nvercel.json rewrites needed ABOVE the catch-all /event/:slug rule:");
console.log(
  JSON.stringify(
    built.map((b) => ({ source: `/event/${b.slug}`, destination: `/event/${b.slug}.html` })),
    null,
    2,
  ),
);
