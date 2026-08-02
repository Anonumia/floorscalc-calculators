# FloorsCalc

FloorsCalc is a static Astro website with six interactive flooring calculators and a Cloudflare Pages Function for contact-form delivery.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
npm run build
npm test
```

The production build command is:

```bash
astro check && astro build
```

Astro writes the static website to `dist/`. Calculator and contact interactivity is bundled as a small client asset only on pages that need it.

## Cloudflare Pages deployment

Connect the existing `Anonumia/floorscalc-calculators` GitHub repository to Cloudflare Pages with:

- Production branch: `main` (only after the migration is approved and merged)
- Preview branch: `astro-migration`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Node.js version: 22.13 or newer

Cloudflare Pages automatically discovers `functions/api/contact.ts` and serves it as `/api/contact`. No Wrangler deployment, standalone Worker project, ChatGPT Sites repository, or Cloudflare API token is required.

Configure these encrypted environment variables for both Preview and Production in the Cloudflare Pages project:

- `BREVO_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

Never prefix these values with `PUBLIC_`; they must remain available only to the Pages Function.

## Output structure

- `dist/index.html`: homepage
- `dist/<route>/index.html`: static content and calculator pages
- `dist/_astro/`: hashed browser assets
- `dist/robots.txt`: crawler policy
- `dist/sitemap.xml`: canonical public sitemap
- `functions/api/contact.ts`: server-side Pages contact handler (deployed separately from `dist` by Pages)

## Architecture

- Astro owns static routing, layouts, canonical metadata, sitemap generation, and the production build.
- React is retained only for the existing calculator and contact-form client islands, preserving tested interaction behavior and formulas.
- Shared calculation utilities live in `src/lib/calculations.ts` and remain framework-independent.
- The site is not configured for `wrangler deploy` and does not contain a standalone Worker entrypoint.
