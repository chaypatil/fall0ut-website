import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { renderGuide } from "./generate-search-guides.mjs";

const root = resolve(import.meta.dirname, "..");
const failures = [];
const fail = (message) => failures.push(message);
const read = (path) => readFileSync(resolve(root, path), "utf8");

let routes;
let guides;

try {
  routes = JSON.parse(read("vercel.json"));
} catch (error) {
  fail(`vercel.json: ${error.message}`);
}

try {
  guides = JSON.parse(read("data/search-guides.json"));
} catch (error) {
  fail(`data/search-guides.json: ${error.message}`);
}

const htmlFiles = readdirSync(root).filter((file) => file.endsWith(".html"));
const routePatterns = [
  /^\/$/,
  ...(routes?.redirects ?? []).map((route) => route.source),
  ...(routes?.rewrites ?? []).map((route) => route.source),
].map((source) => {
  if (source instanceof RegExp) return source;
  const pattern = source
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/:([A-Za-z][A-Za-z0-9_]*)\\\?/g, "[^/]*")
    .replace(/:([A-Za-z][A-Za-z0-9_]*)/g, "[^/]+");
  return new RegExp(`^${pattern}/?$`);
});

for (const file of htmlFiles) {
  const html = read(file);
  const jsonLdBlocks = [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ];

  for (const [index, match] of jsonLdBlocks.entries()) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      fail(`${file}: JSON-LD block ${index + 1}: ${error.message}`);
    }
  }

  const executableScripts = [
    ...html.matchAll(/<script(?![^>]*application\/ld\+json)(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),
  ]
    .map((match) => match[1])
    .filter(Boolean);

  for (const [index, source] of executableScripts.entries()) {
    try {
      new Function(source);
    } catch (error) {
      fail(`${file}: executable script ${index + 1}: ${error.message}`);
    }
  }

  if (!/<title>[^<]+<\/title>/.test(html)) fail(`${file}: missing title`);
  if (!/<meta\s+name="description"/.test(html)) fail(`${file}: missing description`);

  for (const match of html.matchAll(/(?:src|href)="(?:\.\/)?(assets\/[^"#?]+|styles\.css)"/g)) {
    if (match[1].includes("${")) continue;
    if (!existsSync(resolve(root, match[1]))) fail(`${file}: missing local asset ${match[1]}`);
  }

  for (const match of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const path = match[1].split("?", 1)[0];
    if (!routePatterns.some((pattern) => pattern.test(path))) {
      fail(`${file}: unresolved internal link ${match[1]}`);
    }
  }
}

if (Array.isArray(guides)) {
  const slugs = new Set();
  const rewriteMap = new Map((routes?.rewrites ?? []).map((route) => [route.source, route.destination]));
  for (const guide of guides) {
    if (!guide.slug || slugs.has(guide.slug)) fail(`duplicate or missing guide slug: ${guide.slug}`);
    slugs.add(guide.slug);
    const generatedPath = `${guide.slug}.html`;
    if (!existsSync(resolve(root, generatedPath))) {
      fail(`missing generated page: ${generatedPath}`);
    } else if (read(generatedPath) !== renderGuide(guide)) {
      fail(`${generatedPath}: generated output is stale; run node scripts/generate-search-guides.mjs`);
    }
    if (!Array.isArray(guide.sections) || guide.sections.length < 2) {
      fail(`${guide.slug}: at least two useful sections are required`);
    }

    if (rewriteMap.get(`/${guide.slug}`) !== `/${guide.slug}.html`) {
      fail(`vercel.json: missing rewrite for /${guide.slug}`);
    }
  }
}

const index = read("index.html");
if (index.includes('id="announcements"')) fail("index.html: Announcements section must remain removed");
if (index.includes("event-moments--archive")) fail("index.html: empty event galleries must not render an archive prompt");

const announcementRedirect = routes?.redirects?.find((route) => route.source === "/announcements");
if (announcementRedirect?.destination !== "/events") {
  fail("vercel.json: /announcements must redirect to /events");
}

const sitemap = read("sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapUrlSet = new Set(sitemapUrls);
if (sitemapUrlSet.size !== sitemapUrls.length) fail("sitemap.xml: duplicate URLs");
for (const guide of guides ?? []) {
  const url = `https://www.fall0ut.in/${guide.slug}`;
  if (!sitemapUrlSet.has(url)) fail(`sitemap.xml: missing ${url}`);
}

if (failures.length) {
  console.error(failures.map((message) => `FAIL: ${message}`).join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} HTML files, ${guides.length} generated guides, routes, assets and sitemap.`);
