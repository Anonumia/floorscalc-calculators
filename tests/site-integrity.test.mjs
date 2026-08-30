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

test("hardwood content does not claim unsupported board-count functionality", async () => {
  const [data, page, guide] = await Promise.all([
    read("src/data/site-data.ts"),
    read(pagePath),
    read("src/pages/guides/how-to-calculate-hardwood-flooring.md"),
  ]);
  assert.doesNotMatch(`${data}\n${page}`, /fixed-board counts|fixed boards, and cartons/);
  assert.match(guide, /manual calculation a reader can perform/);
  assert.match(guide, /Hardwood Flooring Calculator does not calculate board counts/);
  assert.doesNotMatch(guide, /shows a board count/);
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
  const [page, data, chrome] = await Promise.all([read(pagePath), read("src/data/site-data.ts"), read("src/components/SiteChrome.tsx")]);
  for (const text of ["How to Measure a Room for Flooring", "How Much Extra Flooring Should You Buy?", "How to Measure for Carpet"]) {
    assert.match(data, new RegExp(text.replace("?", "\\?")));
  }
  for (const text of ["Calculation Accuracy", "Privacy Policy", "Terms of Use"]) assert.match(page, new RegExp(text));
  assert.match(chrome, /Free flooring planning/);
  for (const href of ["/calculators", "/guides", "/about", "/contact", "/privacy", "/terms"]) assert.match(chrome, new RegExp(`href="${href}"`));
});

test("privacy policy accurately describes analytics, advertising, and contact delivery", async () => {
  const page = await read(pagePath);
  for (const text of [
    "Google Analytics through its Google tag",
    "Google Analytics may process",
    "Cloudflare services,\\s+including aggregate web analytics",
    "Cloudflare Web Analytics does not use cookies",
    "Advertising and Google AdSense",
    "personalized or non-personalized ads",
    "myadcenter.google.com",
    "Brevo acts as the email delivery\\s+provider",
  ]) assert.match(page, new RegExp(text));
  assert.doesNotMatch(page, /Google Analytics is not installed|Resend|Google AdSense may be added in the future|neither is currently enabled/);
});

test("calculator formulas and protected advertising configuration remain isolated", async () => {
  const [calculations, layout, ads] = await Promise.all([
    read("src/lib/calculations.ts"), read("src/layouts/BaseLayout.astro"), read("public/ads.txt"),
  ]);
  for (const formula of ["areaResult", "pieceResult", "carpetResult", "Math.ceil"]) assert.match(calculations, new RegExp(formula));
  assert.equal((layout.match(/ca-pub-1072764168882200/g) || []).length, 1);
  assert.match(ads, /google\.com, pub-1072764168882200/);
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
  for (const token of ["BREVO_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM_EMAIL", "LIMIT = 5", "website", "CF-Connecting-IP", "api.brevo.com", "idempotencyKey"]) assert.match(fn, new RegExp(token));
  const client = await read("src/components/ContactForm.tsx");
  assert.doesNotMatch(client, /BREVO_API_KEY|CONTACT_TO_EMAIL|CONTACT_FROM_EMAIL/);
  assert.match(client, /name="subject" maxLength=\{160\} \/>/);
});

test("numeric input and rounding safeguards remain", async () => {
  const calculator = await read(calculatorPath);
  assert.match(calculator, /event\.currentTarget\.select\(\)/);
  assert.match(calculator, /value\.replace\(\/\^0\+/);
  assert.match(calculator, /pieceWasRounded/);
  assert.match(calculator, /packageWasRounded/);
  assert.match(calculator, /Box quantities are rounded up/);
});
