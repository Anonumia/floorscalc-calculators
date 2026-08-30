import type { AnchorHTMLAttributes } from "react";
import Calculator from "./Calculator";
import ContactForm from "./ContactForm";
import { calculators, guides, guidePath } from "../data/site-data";
import { siteConfig } from "../data/site-config";
import { SiteFooter, SiteHeader } from "./SiteChrome";

const Link = ({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
  <a href={href} {...props} />
);

const calcKinds: Record<string, any> = {
  "general-flooring-calculator": "general",
  "tile-calculator": "tile",
  "vinyl-plank-calculator": "vinyl",
  "laminate-flooring-calculator": "laminate",
  "hardwood-flooring-calculator": "hardwood",
  "carpet-calculator": "carpet",
};
const Cards = ({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) => {
  const CardHeading = `h${headingLevel}` as "h2" | "h3";
  return <div className="cards">
    {calculators.map(([slug, title, desc], i) => (
      <Link
        className={i === 0 ? "card featured" : "card"}
        href={`/${slug}`}
        key={slug}
      >
        <small>{i === 0 ? "Start here" : "Calculator"}</small>
        <CardHeading style={{ fontSize: "1.25rem", margin: ".35rem 0" }}>{title}</CardHeading>
        <p>{desc}</p>
        <span>Open calculator →</span>
      </Link>
    ))}
  </div>;
};
const Related = ({ current }: { current: string }) => (
  <section>
    <h2>Related calculators</h2>
    <div className="link-row">
      {calculators
        .filter((x) => x[0] !== current)
        .slice(0, 3)
        .map((x) => (
          <Link href={`/${x[0]}`} key={x[0]}>
            {x[1]}
          </Link>
        ))}
    </div>
  </section>
);

const calculatorGuides: Record<string, string[]> = {
  "general-flooring-calculator": [
    "how-to-measure-a-room-for-flooring",
    "how-to-calculate-flooring-for-multiple-rooms",
    "how-much-extra-flooring-to-buy",
  ],
  "tile-calculator": [
    "how-to-calculate-tile-needed",
    "how-much-extra-flooring-to-buy",
    "flooring-box-carton-coverage",
  ],
  "vinyl-plank-calculator": [
    "how-to-calculate-vinyl-plank-flooring",
    "how-much-extra-flooring-to-buy",
    "flooring-box-carton-coverage",
  ],
  "laminate-flooring-calculator": [
    "how-to-calculate-laminate-flooring",
    "how-much-extra-flooring-to-buy",
    "flooring-box-carton-coverage",
  ],
  "hardwood-flooring-calculator": [
    "how-to-calculate-hardwood-flooring",
    "how-much-extra-flooring-to-buy",
    "flooring-box-carton-coverage",
  ],
  "carpet-calculator": [
    "how-to-measure-for-carpet",
    "flooring-square-feet-vs-square-yards",
    "how-to-measure-a-room-for-flooring",
  ],
};

const RelatedGuides = ({ current }: { current: string }) => (
  <section className="compact-guides">
    <h2>Related guides</h2>
    <div className="link-row">
      {calculatorGuides[current].map((slug) => {
        const guide = guides.find((candidate) => candidate.slug === slug)!;
        return <Link href={guidePath(slug)} key={slug}>{guide.title}</Link>;
      })}
    </div>
  </section>
);
const specific: Record<
  string,
  {
    intro: string;
    method: string;
    example: string;
    tips: string;
    limits: string;
  }
> = {
  "general-flooring-calculator": {
    intro:
      "Combine rectangular rooms and estimate the flooring area and whole packages to purchase.",
    method:
      "Room area = length × width. Add room areas, multiply by the allowance percentage, then add that allowance. Packages = final area ÷ package coverage.",
    example:
      "A 10 ft × 12 ft room is 120 sq ft. At 10%, the allowance is 12 sq ft, so the final requirement is 132 sq ft.",
    tips: "Measure at the widest and longest points. Split L-shaped spaces into rectangles and label each part.",
    limits:
      "This area estimate does not plan board direction, seams, pattern repeats, or irregular cut geometry.",
  },
  "tile-calculator": {
    intro:
      "Estimate whole tiles and boxes for rectangular floors, walls, and backsplashes—without adding grout or adhesive.",
    method:
      "Tile area = length × width. Tiles before allowance = surface area ÷ tile area. Multiply by 1 + allowance rate and round the final tile count up.",
    example:
      "A 100 sq ft surface using 12 in × 12 in tiles needs 100 tiles before allowance and 110 tiles at 10%.",
    tips: "Use the actual tile dimensions, and measure each wall or floor section separately. Confirm whether package coverage includes nominal grout joints.",
    limits:
      "No grout, thinset, spacers, layout centering, or pattern matching is calculated.",
  },
  "vinyl-plank-calculator": {
    intro:
      "Estimate vinyl planks and boxes from room area and actual plank dimensions.",
    method:
      "Plank area = length × width. Divide floor area by plank area, apply material allowance, and round whole planks and boxes up.",
    example:
      "A 12 ft × 15 ft room is 180 sq ft. A 48 in × 6 in plank is 2 sq ft; at 10%, the result is 99 planks.",
    tips: "Use the package coverage printed on the product box whenever available; it is usually the best purchase input.",
    limits:
      "The result does not model stagger rules, plank direction, transitions, or unusable offcuts.",
  },
  "laminate-flooring-calculator": {
    intro: "Plan laminate area, planks, and cartons for one or more rooms.",
    method:
      "Add room areas, apply allowance, then divide by carton coverage. When plank dimensions are used, divide by plank area and round pieces up.",
    example:
      "A 14 ft × 11 ft room is 154 sq ft. With 10%, 169.4 sq ft is required; at 21.5 sq ft per carton, buy 8 cartons.",
    tips: "Check the manufacturer’s listed coverage per carton and installation instructions before purchasing.",
    limits:
      "Plank direction, pattern alignment, damaged locking edges, and room-specific cut reuse are not predicted.",
  },
  "hardwood-flooring-calculator": {
    intro:
      "Estimate hardwood area and whole cartons using the coverage stated for the selected product.",
    method:
      "Final hardwood area = measured area × (1 + allowance rate). Cartons = final area ÷ carton coverage, rounded up.",
    example:
      "A 15 ft × 16 ft room is 240 sq ft. At 10%, 264 sq ft is needed; 20 sq ft cartons produce 14 cartons.",
    tips: "For random-length hardwood, rely on actual carton coverage instead of an estimated board count.",
    limits:
      "Random-length board selection and layout change piece use. Nails, staples, adhesive, barriers, and cost are excluded.",
  },
  "carpet-calculator": {
    intro:
      "Create a preliminary carpet estimate using room rectangles and a selected roll width.",
    method:
      "For each room, runs = ceiling(room width ÷ roll width). Length = runs × room length. Add lengths, apply allowance, then multiply by roll width for roll material area.",
    example:
      "A 10 ft × 12 ft room on a 12 ft roll uses one 10 ft run before allowance; at 10%, estimated length is 11 ft.",
    tips: "Measure closets and alcoves separately. Ask an installer to plan seams and direction before ordering.",
    limits:
      "This conservative strip method does not optimize seam placement or reuse remnants across rooms. It is not installer-grade.",
  },
};
export default function SitePage({ slug = "" }: { slug?: string }) {
  let content;
  if (!slug)
    content = (
      <>
        <section className="hero">
          <p className="eyebrow">{siteConfig.tagline}</p>
          <h1>Measure once.<br />Plan with confidence.</h1>
          <p>
            Six focused calculators with transparent formulas, practical
            defaults, and no pricing or hidden assumptions.
          </p>
          <Link className="button" href="/general-flooring-calculator">
            Calculate flooring area
          </Link>
        </section>
        <section>
          <h2>Choose a calculator</h2>
          <Cards />
        </section>
        <section className="how">
          <h2>How it works</h2>
          <ol>
            <li>Measure each rectangular room.</li>
            <li>Choose a material allowance—10% is the editable default.</li>
            <li>Enter actual package coverage when available.</li>
            <li>
              Verify the result against manufacturer and installer guidance.
            </li>
          </ol>
          <p>
            <strong>Accuracy note:</strong> results are mathematical planning
            estimates. Cuts, defects, patterns, room shape, and installation
            decisions can change actual needs.
          </p>
          <Link href="/guides">Read the measurement guides →</Link>
        </section>
        <section className="guide-discovery">
          <h2>Plan before you calculate</h2>
          <p>
            Learn how to measure a room, combine several areas, and choose a
            project-appropriate material allowance before entering the numbers.
          </p>
          <div className="guide-links">
            <Link href="/guides/how-to-measure-a-room-for-flooring">Measure a room</Link>
            <Link href="/guides/how-to-calculate-flooring-for-multiple-rooms">Combine multiple rooms</Link>
            <Link href="/guides/how-much-extra-flooring-to-buy">Plan extra flooring</Link>
            <Link href="/guides">View all flooring guides →</Link>
          </div>
        </section>
      </>
    );
  else if (slug === "calculators")
    content = (
      <>
        <h1>All flooring calculators</h1>
        <p>
          Six practical tools for the most common flooring material questions.
        </p>
        <Cards headingLevel={2} />
      </>
    );
  else if (calcKinds[slug]) {
    const c = specific[slug];
    content = (
      <article>
        <p className="eyebrow">Free material planning tool</p>
        <h1>{calculators.find((x) => x[0] === slug)?.[1]}</h1>
        <p className="lede">{c.intro}</p>
        <Calculator kind={calcKinds[slug]} />
        <section>
          <h2>Inputs and results</h2>
          <p>
            {calcKinds[slug] === "general"
              ? "Enter each rectangular area, choose Imperial or Metric, and adjust the visible material allowance. Box coverage is optional and should be entered from the manufacturer's product packaging or product page. Results separate measured area, allowance, final area, and whole box quantities."
              : "Enter each rectangular area, choose Imperial or Metric, and adjust the visible material allowance. Product packaging information is optional and should come from the product box, carton, or manufacturer product page. Results separate measured area, allowance, final area, and whole purchase quantities."}
          </p>
          <h2>Limitations and assumptions</h2>
          <p>
            {c.limits} Allowance depends on room shape, pattern, cuts, damage,
            product defects, installer recommendations, and manufacturer
            instructions.
          </p>
          <p className="disclaimer">
            Use this result for planning only. Verify measurements and order
            quantities with the product manufacturer or qualified installer.
          </p>
        </section>
        <RelatedGuides current={slug} />
        <Related current={slug} />
      </article>
    );
  } else if (slug === "guides")
    content = (
      <article className="reading">
        <p className="eyebrow">Practical flooring planning</p>
        <h1>Flooring Guides</h1>
        <p>
          Follow a project from room measurements to a whole-package estimate,
          or go directly to the material-specific guide you need.
        </p>
        <section className="start-here" aria-labelledby="start-here-heading">
          <h2 id="start-here-heading">Start here</h2>
          <ol>
            <li><Link href="/guides/how-to-measure-a-room-for-flooring">Measure each floor area</Link></li>
            <li><Link href="/guides/how-to-calculate-flooring-for-multiple-rooms">Combine applicable rooms</Link></li>
            <li><Link href="/guides/how-much-extra-flooring-to-buy">Choose a material allowance</Link></li>
            <li><Link href="/guides/flooring-box-carton-coverage">Use the exact package coverage</Link></li>
            <li><Link href="/calculators">Open the appropriate calculator</Link></li>
          </ol>
        </section>
        {["Measuring and area", "Allowance and purchasing", "Material-specific planning"].map((group) => (
          <section key={group} aria-labelledby={`guide-group-${group.replaceAll(" ", "-").toLowerCase()}`}>
            <h2 id={`guide-group-${group.replaceAll(" ", "-").toLowerCase()}`}>{group}</h2>
            <div className="guide-list">
              {guides.filter((guide) => guide.group === group).map((guide) => (
                <Link href={guidePath(guide.slug)} key={guide.slug}>
                  <h3>{guide.title}</h3>
                  <p>{guide.summary}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </article>
    );
  else if (slug === "about")
    content = (
      <article className="reading">
        <h1>About {siteConfig.name}</h1>
        <p>
          {siteConfig.name} provides free, simple tools that help homeowners,
          DIY users, landlords, property managers, and installers estimate
          flooring material quantities.
        </p>
        <h2>Our approach</h2>
        <p>
          Every calculator shows its formula, default material allowance,
          rounding method, and limitations. We aim for useful planning—not false
          certainty. Users remain responsible for checking measurements,
          manufacturer instructions, and final quantities.
        </p>
        <h2>What we do not provide</h2>
        <p>
          We do not sell flooring, provide quotes, estimate prices, or replace
          product-specific advice from a manufacturer or qualified installer.
        </p>
        <p>
          {siteConfig.name} is independently developed and is not affiliated
          with any flooring manufacturer or retailer.
        </p>
      </article>
    );
  else if (slug === "contact")
    content = (
      <article className="reading">
        <h1>Contact {siteConfig.name}</h1>
        <p>
          Send a question, correction, or suggestion about the site. For a
          calculation issues, include the calculator name, measurement system
          (Imperial or Metric), your inputs, the result you expected, and the
          result displayed by the calculator.
        </p>
        <ContactForm />
      </article>
    );
  else if (slug === "privacy")
    content = (
      <article className="reading policy">
        <h1>Privacy Policy</h1>
        <p>Last updated: August 10, 2026</p>
        <h2>Current practices</h2>
        <p>
          {siteConfig.name} provides browser-based calculators and a contact
          form. The site uses Google Analytics through its Google tag to
          understand site usage and performance. Google Analytics may process
          information such as visited pages, approximate location, device and
          browser information, and interaction data, subject to consent and
          applicable settings. The deployed site also uses Cloudflare services,
          including aggregate web analytics, hosting, and security features.
          Cloudflare Web Analytics does not use cookies or local storage to
          collect usage metrics. We are also preparing the site to use Google
          AdSense as described below.
        </p>
        <h2>Calculator inputs</h2>
        <p>
          Room dimensions, product measurements, and allowance values are
          processed in your browser for the calculation. They are not submitted
          to us or saved by the site.
        </p>
        <h2>Contact-form submissions</h2>
        <p>
          When you use the contact form, your name (if provided), email address,
          subject, message, and technical delivery information are processed to
          deliver and respond to your request. Brevo acts as the email delivery
          provider. Do not submit sensitive personal information.
        </p>
        <h2>Server logs</h2>
        <p>
          Our hosting provider may process IP address, requested page, date and
          time, browser information, and errors for security, abuse prevention,
          and service reliability.
        </p>
        <h2>Cookies</h2>
        <p>
          The calculators themselves do not require tracking cookies. Hosting,
          security, and advertising services may use cookies or similar
          technologies for functions such as security, measurement, ad
          delivery, frequency control, and fraud prevention. Your browser lets
          you review or block cookies, although doing so may affect some
          functions.
        </p>
        <h2>Advertising and Google AdSense</h2>
        <p>
          We may use Google AdSense to display advertisements. Third-party
          vendors, including Google, may use cookies or similar technologies to
          serve ads based on a visitor&apos;s prior visits to this website or
          other websites, and to deliver, measure, and limit repeated ads.
        </p>
        <p>
          Depending on a visitor&apos;s consent, settings, and applicable law,
          Google may serve personalized or non-personalized ads. Personalized
          ads may use information about prior activity to select relevant ads.
          Non-personalized ads are generally selected using contextual
          information, such as the content being viewed, general location, or
          time of day, but may still use cookies or similar technologies for
          purposes such as frequency capping, aggregated reporting, and fraud
          prevention.
        </p>
        <p>
          Visitors can learn how Google uses information for advertising in
          Google&apos;s <a href="https://policies.google.com/technologies/ads">Advertising policies and technologies</a> information
          and can manage personalized-ad settings through <a href="https://myadcenter.google.com/">My Ad Center</a>.
        </p>
        <h2>Third-party services</h2>
        <p>
          Cloudflare delivers and protects the site and provides aggregate web
          analytics. Google Analytics processes site-usage information through
          the Google tag. Brevo processes contact-form email. Google and its
          advertising partners may process information when Google ads are
          served. These providers process information under their own terms and
          privacy practices.
        </p>
        <h2>Data retention</h2>
        <p>
          Contact messages are retained only as long as reasonably needed to
          respond, maintain records, prevent abuse, or meet legal obligations.
          Hosting and email providers may keep operational logs according to
          their own retention schedules.
        </p>
        <h2>Security</h2>
        <p>
          We use reasonable safeguards, including server-side validation, rate
          limiting, and keeping delivery credentials outside browser code. No
          internet transmission or storage system can be guaranteed completely
          secure.
        </p>
        <h2>Your choices</h2>
        <p>
          You may avoid the contact form, limit cookies through your browser, or
          ask about a submitted message through the Contact page. You may also
          use Google&apos;s advertising controls linked above. Consent choices
          will be provided where required by applicable law. Legal rights may
          vary by location.
        </p>
        <p>
          {siteConfig.name} is a general-purpose flooring planning website and
          is not directed to children.
        </p>
        <h2>Policy changes</h2>
        <p>
          We may revise this policy when site practices change. The current
          version and its last-updated date will remain available on this page.
        </p>
        <h2>Contact</h2>
        <p>
          Use the <Link href="/contact">Contact page</Link> for privacy
          questions.
        </p>
      </article>
    );
  else if (slug === "terms")
    content = (
      <article className="reading policy">
        <h1>Terms of Use</h1>
        <h2>Informational planning estimates</h2>
        <p>
          {siteConfig.name} provides informational material estimates. Results
          are not bids, purchase instructions, engineering advice, or
          professional guarantees.
        </p>
        <h2>Your responsibility</h2>
        <p>
          You are responsible for accurate measurements, suitable inputs, site
          conditions, purchasing decisions, and verification of final
          quantities. Recheck results before relying on them.
        </p>
        <h2>Manufacturer and installer guidance</h2>
        <p>
          Product instructions, stated carton coverage, and manufacturer
          requirements take priority over this site. Consult a qualified
          installer where layout, seams, subfloor conditions, patterns, or
          safety may affect the project.
        </p>
        <h2>Calculator-specific limitations</h2>
        <p>
          Different calculators rely on different assumptions. Carpet
          calculations do not optimize seam placement, roll direction, pattern
          matching, or installer layout. Boxed-flooring calculations cannot
          account for every manufacturer-specific installation requirement,
          product defect, cut, or layout decision.
        </p>
        <h2>Calculation Accuracy</h2>
        <p>
          {siteConfig.name} uses standard mathematical formulas together with
          user-provided measurements. Flooring products, installation methods,
          and manufacturer specifications vary, so users should always verify
          final quantities before purchasing materials.
        </p>
        <h2>No warranty</h2>
        <p>
          The site is provided “as is” and “as available,” without warranties of
          accuracy, availability, fitness for a particular purpose, or
          non-infringement to the extent permitted by law.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          To the extent permitted by law, the site publisher is not liable for
          purchases, shortages, excess material, installation issues, lost
          profits, or indirect or consequential losses arising from use of the
          service.
        </p>
        <h2>Intellectual property</h2>
        <p>
          Site text, design, branding, and original code are protected by
          applicable intellectual-property laws. These terms do not transfer
          ownership rights.
        </p>
        <h2>Acceptable use</h2>
        <p>
          Do not interfere with the service, attempt unauthorized access, submit
          malicious material, abuse the contact form, or scrape, copy, or reuse
          site content in a manner that harms the service or misrepresents its
          results.
        </p>
        <h2>Service changes</h2>
        <p>
          We may correct, change, suspend, or remove features and content.
          Continued use means you accept the version of these terms then
          displayed.
        </p>
        <h2>Contact</h2>
        <p>
          Use the <Link href="/contact">Contact page</Link> for questions about
          these terms.
        </p>
      </article>
    );
  else return null;
  return (
    <>
      <SiteHeader />
      <main id="main">{content}</main>
      <SiteFooter />
    </>
  );
}
