# FloorsCalc project instructions

## Scope and change discipline

- Keep every change tightly scoped to the user's explicit request. Do not make unrelated application, content, styling, dependency, deployment, or configuration changes.
- Inspect the existing implementation and documentation before changing behavior.
- Run the relevant tests and production validation before committing. Do not commit or push unless the user explicitly asks.

## Validation workflow

- Use Node.js 22.13.0 or newer.
- Run the existing test suite with `npm test`.
- Run the standalone Astro validation with `npx astro check` when an Astro check is requested.
- Run the production build with `npm run build`. This script runs `astro check && astro build` and writes the static site to `dist/`.
- Before committing application changes, at minimum run `npm test` and `npm run build`; report failures, warnings/hints, and the number of generated pages accurately.

## Source control and deployment

- GitHub repository `Anonumia/floorscalc-calculators` is the source repository. The `main` branch is the production source.
- Use regular Git commands for normal branch, commit, and push operations.
- GitHub CLI (`gh`) is not required for this project. Do not install it or make routine work depend on it.
- Cloudflare Pages is the production deployment platform. It builds with `npm run build`, publishes `dist/`, and automatically deploys updates from the connected GitHub repository.
- Do not introduce Wrangler deployment, a standalone Worker, manual uploads, or a different hosting workflow unless specifically requested.

## Protected integrations

- Preserve the existing Cloudflare Pages configuration and the Pages Function at `functions/api/contact.ts` unless the user specifically requests a change.
- Preserve the existing Brevo contact-delivery behavior and private environment-variable contract: `BREVO_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`. Never expose these values to browser code or commit secrets.
- Preserve the installed Google AdSense script and publisher ID `ca-pub-1072764168882200` in the shared page `<head>` unless the user specifically requests its removal or replacement.
- The AdSense script must render exactly once in the `<head>` of every generated HTML page. Do not add duplicate scripts, ad units, Auto Ads configuration, or visible ad placeholders unless specifically requested.
