import type { APIRoute } from "astro";
import { calculators } from "../data/site-data";
import { siteConfig } from "../data/site-config";

const paths = [
  "",
  "calculators",
  ...calculators.map(([slug]) => slug),
  "guides",
  "about",
  "contact",
  "privacy",
  "terms",
];

const escapeXml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

export const GET: APIRoute = () => {
  const urls = paths
    .map((path) => `  <url><loc>${escapeXml(new URL(path || "/", `${siteConfig.url}/`).toString())}</loc></url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "content-type": "application/xml; charset=utf-8" } },
  );
};
