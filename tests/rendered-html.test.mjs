import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");
const guideSlugs = [
  "how-to-measure-a-room-for-flooring",
  "how-much-extra-flooring-to-buy",
  "how-to-calculate-flooring-for-multiple-rooms",
  "how-to-calculate-tile-needed",
  "how-to-calculate-vinyl-plank-flooring",
  "how-to-calculate-laminate-flooring",
  "how-to-calculate-hardwood-flooring",
  "how-to-measure-for-carpet",
  "flooring-square-feet-vs-square-yards",
  "flooring-box-carton-coverage",
];
const publicRoutes = [
  "index.html", "calculators/index.html", "general-flooring-calculator/index.html",
  "tile-calculator/index.html", "vinyl-plank-calculator/index.html",
  "laminate-flooring-calculator/index.html", "hardwood-flooring-calculator/index.html",
  "carpet-calculator/index.html", "guides/index.html", "about/index.html",
  "contact/index.html", "privacy/index.html", "terms/index.html",
  ...guideSlugs.map((slug) => `guides/${slug}/index.html`),
];

test("homepage preserves approved branding and metadata", async () => {
  const html = await read("index.html");
  assert.match(html, /FREE FLOORING CALCULATORS/i);
  assert.match(html, /<title>Free Flooring Calculators \| FloorsCalc<\/title>/);
  assert.match(html, /href="https:\/\/floorscalc\.com\/"/);
  assert.match(html, /favicon-16x16\.png/);
  assert.match(html, /apple-touch-icon\.png/);
  assert.match(html, /site\.webmanifest/);
});

test("site suppresses automatic install prompts without rendering an install CTA", async () => {
  const html = await read("index.html");
  assert.match(html, /beforeinstallprompt[\s\S]*?preventDefault\(\)/);
  assert.doesNotMatch(html, />\s*(?:Install App|Add to Home Screen)\s*</i);
});

test("every required route is generated", async () => {
  const routes = [...publicRoutes, "404.html"];
  for (const route of routes) assert.ok((await read(route)).length > 200, route);
});

test("calculator pages contain interactive, copy, print, and sticky-result UI", async () => {
  const html = await read("tile-calculator/index.html");
  for (const text of ["Tile Calculator", "Copy Results", "Print Results", "Add another room", "mobile-sticky-result"]) {
    assert.match(html, new RegExp(text));
  }
  assert.match(html, /data-react-site-page="tile-calculator"/);
});

test("contact page contains the complete private submission form", async () => {
  const html = await read("contact/index.html");
  for (const name of ["name", "email", "subject", "message", "website"]) {
    assert.match(html, new RegExp(`name="${name}"`));
  }
  assert.match(html, /data-react-site-page="contact"/);
});

test("SEO outputs are generated", async () => {
  assert.match(await read("robots.txt"), /Sitemap: https:\/\/floorscalc\.com\/sitemap\.xml/);
  const sitemap = await read("sitemap.xml");
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n/);
  assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  const paths = [
    "/", "/calculators", "/general-flooring-calculator", "/tile-calculator",
    "/vinyl-plank-calculator", "/laminate-flooring-calculator",
    "/hardwood-flooring-calculator", "/carpet-calculator", "/guides",
    ...guideSlugs.map((slug) => `/guides/${slug}`),
    "/about", "/contact", "/privacy", "/terms",
  ];
  for (const path of paths) {
    assert.match(sitemap, new RegExp(`<loc>https:\\/\\/floorscalc\\.com${path.replaceAll("/", "\\/")}<\\/loc>`));
  }
  assert.equal((sitemap.match(/<url>/g) || []).length, 23);
  assert.equal((sitemap.match(/<loc>/g) || []).length, 23);
  assert.doesNotMatch(sitemap, /pages\.dev/);
  assert.match(await read("_headers"), /\/sitemap\.xml\s+Content-Type: application\/xml; charset=UTF-8/);
});

test("public pages have unique metadata and a single primary heading", async () => {
  const routes = publicRoutes;
  const titles = new Set();
  const descriptions = new Set();
  for (const route of routes) {
    const html = await read(route);
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(title, `${route} title`);
    assert.ok(description, `${route} description`);
    assert.ok(!titles.has(title), `${route} duplicate title`);
    assert.ok(!descriptions.has(description), `${route} duplicate description`);
    titles.add(title);
    descriptions.add(description);
    assert.equal((html.match(/<h1(?:\s[^>]*)?>/g) || []).length, 1, `${route} H1 count`);
    assert.doesNotMatch(html, /<meta[^>]+(?:noindex|nofollow)/i, `${route} indexing directive`);
  }
});

test("guide pages have canonical metadata, useful structure, and working internal links", async () => {
  const knownPaths = new Set(publicRoutes.map((route) => route === "index.html" ? "/" : `/${route.replace(/index\.html$/, "")}`.replace(/\/$/, "")));
  for (const slug of guideSlugs) {
    const route = `guides/${slug}/index.html`;
    const html = await read(route);
    assert.match(html, new RegExp(`rel="canonical" href="https:\/\/floorscalc\.com\/guides\/${slug}"`));
    assert.ok((html.match(/<h2(?:\s[^>]*)?>/g) || []).length >= 3, `${slug} section count`);
    assert.match(html, /<a href="\/(?:guides\/[^"#]+|[^"#]+-calculator|calculators)"/);
    for (const href of html.matchAll(/href="(\/[^"]+)"/g)) {
      const path = href[1].split("#")[0].replace(/\/$/, "") || "/";
      if (path.startsWith("/api/")) continue;
      if (/\.[a-z0-9]+$/i.test(path)) continue;
      assert.ok(knownPaths.has(path), `${slug} broken internal link: ${path}`);
    }
  }
});

test("AdSense remains exactly once in every public page head", async () => {
  for (const route of publicRoutes) {
    const html = await read(route);
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
    assert.equal((head.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-1072764168882200/g) || []).length, 1, route);
  }
});
