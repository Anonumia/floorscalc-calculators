import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");
const pagePath = "src/components/SitePage.tsx";
const calculatorPath = "src/components/Calculator.tsx";

test("Astro static and Cloudflare Pages architecture is explicit", async () => {
  const [pkg, config] = await Promise.all([read("package.json"), read("astro.config.ts")]);
  assert.match(pkg, /astro check/);
  assert.match(pkg, /astro build/);
  assert.doesNotMatch(pkg, /vinext|next|wrangler|cloudflare\/vite-plugin/i);
  assert.match(config, /output: "static"/);
  assert.match(config, /https:\/\/floorscalc\.com/);
  for (const path of ["next.config.ts", "vite.config.ts", "worker/index.ts", ".openai/hosting.json"]) {
    await assert.rejects(access(path));
  }
});

test("production domain and approved homepage wording are preserved", async () => {
  const [config, page] = await Promise.all([read("src/data/site-config.ts"), read(pagePath)]);
  assert.match(config, /https:\/\/floorscalc\.com/);
  assert.match(config, /Free Flooring Calculators/);
  assert.match(page, /siteConfig\.tagline/);
  assert.doesNotMatch(`${config}\n${page}`, /Floorwise|FREE FLOORING MATERIAL CALCULATORS/);
});

test("all six calculators and reusable formulas remain present", async () => {
  const [data, calculator, calculations] = await Promise.all([
    read("src/data/site-data.ts"), read(calculatorPath), read("src/lib/calculations.ts"),
  ]);
  for (const slug of ["general-flooring", "tile", "vinyl-plank", "laminate-flooring", "hardwood-flooring", "carpet"]) {
    assert.match(data, new RegExp(slug));
  }
  for (const kind of ["general", "tile", "vinyl", "laminate", "hardwood", "carpet"]) {
    assert.match(calculator, new RegExp(`${kind}:\\s*\\{`));
  }
  for (const fn of ["areaResult", "pieceResult", "carpetResult"]) assert.match(calculations, new RegExp(fn));
});

test("calculator interaction, copy, print, reset, and mobile behavior remain", async () => {
  const [calculator, css] = await Promise.all([read(calculatorPath), read("src/styles/refinements.css")]);
  for (const token of ["Add another room", "Remove room", "Reset", "Copy Results", "Print Results", "navigator.clipboard.writeText", "scrollIntoView", "mobile-sticky-result", "print-summary"]) {
    assert.match(calculator, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(css, /@media\(max-width:760px\).*\.print-results\{display:none\}/s);
  assert.match(css, /@media print.*\.mobile-sticky-result.*display:none!important/s);
});

test("copy and print reports remain separate and compact", async () => {
  const calculator = await read(calculatorPath);
  assert.match(calculator, /\]\s*\.join\("\\n\\n"\)/);
  assert.match(calculator, /\["INPUTS", \.\.\.inputLines\]\.join\("\\n"\)/);
  assert.match(calculator, /\["RESULTS", \.\.\.copyResultLines\]\.join\("\\n"\)/);
  assert.match(calculator, /Result Breakdown/);
  assert.match(calculator, /print-report-header/);
});

test("guides, policy wording, navigation, and footer are preserved", async () => {
  const page = await read(pagePath);
  for (const text of ["How to Measure a Room for Flooring", "How Much Flooring Allowance Should You Add?", "Why Carpet Estimates Are Different", "Calculation Accuracy", "Privacy Policy", "Terms of Use", "Free flooring planning"]) {
    assert.match(page, new RegExp(text.replace("?", "\\?")));
  }
  for (const href of ["/calculators", "/guides", "/about", "/contact", "/privacy", "/terms"]) assert.match(page, new RegExp(`href="${href}"`));
});

test("favicon assets and global metadata are complete", async () => {
  const layout = await read("src/layouts/BaseLayout.astro");
  for (const file of ["favicon.ico", "favicon.svg", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon.png", "android-chrome-192x192.png", "android-chrome-512x512.png", "site.webmanifest"]) {
    await access(`public/${file}`);
    assert.match(`${layout}\n${await read("public/site.webmanifest")}`, new RegExp(file.replace(".", "\\.")));
  }
});

test("Cloudflare Pages contact function validates, rate-limits, and keeps secrets server-side", async () => {
  const fn = await read("functions/api/contact.ts");
  for (const token of ["RESEND_API_KEY", "CONTACT_EMAIL", "CONTACT_FROM_EMAIL", "LIMIT = 5", "website", "CF-Connecting-IP", "api.resend.com"]) assert.match(fn, new RegExp(token));
  assert.doesNotMatch(await read("src/components/ContactForm.tsx"), /RESEND_API_KEY/);
});

test("numeric input and rounding safeguards remain", async () => {
  const calculator = await read(calculatorPath);
  assert.match(calculator, /event\.currentTarget\.select\(\)/);
  assert.match(calculator, /value\.replace\(\/\^0\+/);
  assert.match(calculator, /pieceWasRounded/);
  assert.match(calculator, /packageWasRounded/);
  assert.match(calculator, /Box quantities are rounded up/);
});
