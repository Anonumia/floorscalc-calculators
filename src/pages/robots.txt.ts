import type { APIRoute } from "astro";
import { siteConfig } from "../data/site-config";

export const GET: APIRoute = () => new Response(
  `User-agent: *\nAllow: /\nSitemap: ${siteConfig.url}/sitemap.xml\n`,
  { headers: { "content-type": "text/plain; charset=utf-8" } },
);
