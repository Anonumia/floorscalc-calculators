import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");

test("homepage preserves approved branding and metadata", async () => {
  const html = await read("index.html");
  assert.match(html, /FREE FLOORING CALCULATORS/i);
  assert.match(html, /<title>Free Flooring Calculators \| FloorsCalc<\/title>/);
  assert.match(html, /href="https:\/\/floorscalc\.com\/"/);
  assert.match(html, /favicon-16x16\.png/);
  assert.match(html, /apple-touch-icon\.png/);
  assert.match(html, /site\.webmanifest/);
});

test("every required route is generated", async () => {
  const routes = [
    "index.html", "calculators/index.html", "general-flooring-calculator/index.html",
    "tile-calculator/index.html", "vinyl-plank-calculator/index.html",
    "laminate-flooring-calculator/index.html", "hardwood-flooring-calculator/index.html",
    "carpet-calculator/index.html", "guides/index.html", "about/index.html",
    "contact/index.html", "privacy/index.html", "terms/index.html", "404.html",
  ];
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
    "/about", "/contact", "/privacy", "/terms",
  ];
  for (const path of paths) {
    assert.match(sitemap, new RegExp(`<loc>https:\\/\\/floorscalc\\.com${path.replaceAll("/", "\\/")}<\\/loc>`));
  }
  assert.equal((sitemap.match(/<url>/g) || []).length, 13);
  assert.equal((sitemap.match(/<loc>/g) || []).length, 13);
  assert.doesNotMatch(sitemap, /pages\.dev/);
  assert.match(await read("_headers"), /\/sitemap\.xml\s+Content-Type: application\/xml; charset=UTF-8/);
});

test("public pages have unique metadata and a single primary heading", async () => {
  const routes = [
    "index.html", "calculators/index.html", "general-flooring-calculator/index.html",
    "tile-calculator/index.html", "vinyl-plank-calculator/index.html",
    "laminate-flooring-calculator/index.html", "hardwood-flooring-calculator/index.html",
    "carpet-calculator/index.html", "guides/index.html", "about/index.html",
    "contact/index.html", "privacy/index.html", "terms/index.html",
  ];
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
