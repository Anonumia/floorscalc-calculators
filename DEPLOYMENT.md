# Utility Site Deployment Guide

This guide explains how to publish FloorsCalc and future utility sites using GitHub and Cloudflare Pages. It is written for site owners who do not need to work with the application code.

## What FloorsCalc uses

FloorsCalc is an Astro website. Astro creates static HTML, CSS, and JavaScript files that Cloudflare Pages can serve quickly. The calculators run in the visitor's browser. The contact form uses a Cloudflare Pages Function so email credentials remain private.

FloorsCalc does not need a standalone Cloudflare Worker, Wrangler deployment, Cloudflare API token, ChatGPT Sites project, or manual file upload.

## GitHub repository

- Repository: `Anonumia/floorscalc-calculators`
- Git URL: `git@github.com:Anonumia/floorscalc-calculators.git`
- Production branch: `main`

The `main` branch is the production source. Cloudflare Pages should automatically rebuild the site whenever a new commit is pushed to `main`.

## Cloudflare Pages build settings

Enter these exact values when connecting the repository:

- Framework preset: Astro, if offered
- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: leave blank; the repository root is correct
- Node.js version: `22.13.0`

Set the Node version by adding a Cloudflare build environment variable named `NODE_VERSION` with the value `22.13.0`.

Preview deployments should be enabled for all non-production branches. This lets changes be reviewed at a temporary `pages.dev` address before they are merged into `main`.

## Required environment variables

The contact form requires these private Cloudflare variables:

- `RESEND_API_KEY`: the private API key supplied by Resend
- `CONTACT_EMAIL`: the address that receives contact messages
- `CONTACT_FROM_EMAIL`: a sender address on a domain verified in Resend

Add them in the Cloudflare Pages project under **Settings → Variables and Secrets**. Store `RESEND_API_KEY` as an encrypted secret. Treat the email settings as private project configuration as well.

Configure the variables for both **Production** and **Preview** if contact forms need to work in preview deployments. Never add their values to GitHub, source files, browser code, screenshots, or support messages.

## Contact form configuration

The browser submits the form to `/api/contact`. Cloudflare Pages discovers `functions/api/contact.ts` and publishes it as a Pages Function.

The function:

- validates every required field;
- rejects oversized or unsafe input;
- uses a hidden spam-trap field;
- limits repeated submissions;
- sends the message through Resend; and
- reads all email credentials from Cloudflare's server-side environment.

After the first Pages deployment, submit one real test message. Confirm that the page reports success and that the message arrives at `CONTACT_EMAIL`. If it does not arrive, review the deployment's Function logs and the Resend activity log.

## Connect a new Cloudflare Pages project

1. Sign in to Cloudflare and open **Workers & Pages**.
2. Select **Create application**, then choose **Pages** and **Connect to Git**.
3. Connect the GitHub account that can access `Anonumia/floorscalc-calculators`.
4. Select the `floorscalc-calculators` repository.
5. Set the production branch and build values exactly as listed above.
6. Add `NODE_VERSION` and the three contact-form variables.
7. Start the first deployment.
8. Wait for the build and deployment to finish successfully.
9. Open the assigned `pages.dev` address and complete the deployment checks below.

Do not attach `floorscalc.com` until the temporary Pages address has passed verification.

## Connect the custom domain

1. Open the verified FloorsCalc Pages project in Cloudflare.
2. Open **Custom domains** and choose **Set up a custom domain**.
3. Enter `floorscalc.com` and follow Cloudflare's DNS instructions.
4. Add `www.floorscalc.com` if the site should support `www` visitors, and configure one hostname to redirect to the preferred hostname.
5. Wait for Cloudflare to show the domain as active and its TLS certificate as ready.
6. Test both HTTP and HTTPS. HTTP should redirect to HTTPS.
7. Recheck the homepage, calculators, contact form, favicon, sitemap, and `robots.txt` on the real domain.

Keep the previous production service available until the Pages deployment and custom domain have both been verified.

## How future updates work

1. Make and review the code change on a non-production branch.
2. Run `npm run build` and `npm test`.
3. Push the branch to GitHub and review the Cloudflare preview deployment.
4. Merge the approved branch into `main`.
5. Cloudflare Pages automatically builds and deploys the new `main` commit.
6. Verify the production deployment.

No Wrangler command, Worker API token, ChatGPT Sites update, or manual deployment command is required.

## Verify a deployment

For every production deployment:

1. Confirm the Cloudflare build finished successfully for the expected Git commit.
2. Open the homepage and all calculator pages.
3. Test one Imperial and one Metric calculation.
4. Test material allowance, Copy Results, Print Results, and the mobile layout.
5. Check the favicon and browser page titles.
6. Open `/robots.txt` and confirm it points to `https://floorscalc.com/sitemap.xml`.
7. Open `/sitemap.xml` and confirm the public pages are listed.
8. Submit a contact-form test and confirm that its email arrives.
9. Check the browser console and Cloudflare Function logs for errors.
10. Confirm `floorscalc.com` uses HTTPS and no assets or links return 404 errors.

## Common troubleshooting

### The build fails

- Confirm the build command is `npm run build`.
- Confirm the output directory is `dist`.
- Confirm the root directory is blank.
- Confirm `NODE_VERSION` is `22.13.0`.
- Open the failed deployment and read the first meaningful error in the build log.

### Cloudflare does not build after a push

- Confirm the Pages project is connected to the correct GitHub repository.
- Confirm automatic production deployments are enabled for `main`.
- Confirm the pushed commit does not contain a Cloudflare build-skip marker.
- Reconnect the Cloudflare GitHub application if repository access was removed.

### A preview deployment is missing

- Confirm preview deployments are enabled for all non-production branches or explicitly include the branch being tested.
- Confirm the branch was pushed to the connected GitHub repository.

### The contact form says it is not configured

- Confirm all three contact variables exist in the same environment being tested: Production or Preview.
- Confirm the variable names use the exact spelling shown above.
- Redeploy after changing environment variables.

### The contact form cannot send email

- Confirm the Resend API key is active.
- Confirm `CONTACT_FROM_EMAIL` uses a domain verified by Resend.
- Review the Pages Function logs and Resend activity log.
- Confirm `CONTACT_EMAIL` is a valid receiving address.

### The site works but the custom domain does not

- Confirm the custom domain is active in the Pages project.
- Confirm Cloudflare DNS shows the expected Pages record and it is proxied.
- Wait for DNS and TLS certificate activation to complete.
- Test the `pages.dev` address to separate a domain problem from an application problem.

### An old page or favicon still appears

- Confirm the latest Git commit was deployed.
- Refresh without cache or open a private browser window.
- Clear Cloudflare cache only when the deployment is correct but stale content remains.
