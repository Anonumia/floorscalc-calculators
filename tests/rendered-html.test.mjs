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
  assert.match(await read("robots.txt"), /Sitemap: https:\/\/floorscalc\.com\/sitemap-index\.xml/);
  const sitemap = await read("sitemap-0.xml");
  for (const path of ["/calculators/", "/tile-calculator/", "/guides/", "/privacy/"]) {
    assert.match(sitemap, new RegExp(path.replaceAll("/", "\\/")));
  }
});
