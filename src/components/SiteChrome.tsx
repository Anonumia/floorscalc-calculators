import type { AnchorHTMLAttributes } from "react";
import { siteConfig } from "../data/site-config";

const Link = ({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
  <a href={href} {...props} />
);

export function SiteHeader() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header>
        <Link
          className="brand"
          href="/"
          style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", whiteSpace: "nowrap" }}
        >
          <img
            src="/favicon.svg"
            alt=""
            width="28"
            height="28"
            aria-hidden="true"
            style={{ display: "block", objectFit: "contain", flex: "0 0 auto" }}
          />
          {siteConfig.name}
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/calculators">Calculators</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/about">About</Link>
        </nav>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <strong>{siteConfig.name}</strong>
      <nav aria-label="Footer navigation">
        <Link href="/calculators">All Calculators</Link>
        <Link href="/guides">Guides</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Use</Link>
      </nav>
      <p>
        © {new Date().getFullYear()} {siteConfig.name}. Free flooring planning
        calculators. Results are estimates, not professional advice.
      </p>
    </footer>
  );
}
