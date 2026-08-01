import Link from "next/link";
import Calculator from "../Calculator";
import ContactForm from "../ContactForm";
import { calculators } from "../site-data";
import { siteConfig } from "../site-config";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const calcKinds: Record<string, any> = {
  "general-flooring-calculator": "general",
  "tile-calculator": "tile",
  "vinyl-plank-calculator": "vinyl",
  "laminate-flooring-calculator": "laminate",
  "hardwood-flooring-calculator": "hardwood",
  "carpet-calculator": "carpet",
};
function Header() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header>
        <Link className="brand" href="/">
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
function Footer() {
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

const titles: Record<string, string> = {
  "": "Free Flooring Material Calculators",
  calculators: "All Flooring Calculators",
  guides: "Flooring Measurement Guides",
  about: "About",
  contact: "Contact",
  privacy: "Privacy Policy",
  terms: "Terms of Use",
  ...Object.fromEntries(calculators.map((x) => [x[0], x[1]])),
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  const path = slug.join("/");
  const title = titles[path] || "Page Not Found";
  const description =
    path in calcKinds
      ? calculators.find((x) => x[0] === path)?.[2]
      : path === "guides"
        ? "Practical flooring measurement guidance covering room area, material allowance, box coverage, carpet estimates, units, and rounding."
        : path === "contact"
          ? `Contact ${siteConfig.name} about a calculator or site question.`
          : siteConfig.description;
  return {
    title,
    description,
    alternates: { canonical: `/${path}` },
    openGraph: { title, description, url: `${siteConfig.url}/${path}` },
  };
}
const Cards = () => (
  <div className="cards">
    {calculators.map(([slug, title, desc], i) => (
      <Link
        className={i === 0 ? "card featured" : "card"}
        href={`/${slug}`}
        key={slug}
      >
        <small>{i === 0 ? "Start here" : "Calculator"}</small>
        <h3>{title}</h3>
        <p>{desc}</p>
        <span>Open calculator →</span>
      </Link>
    ))}
  </div>
);
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
      "Estimate hardwood area and cartons, with fixed-board counts only when dimensions are known.",
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
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const p = await params;
  const slug = p.slug?.[0] || "";
  let content;
  if (!slug)
    content = (
      <>
        <section className="hero">
          <p className="eyebrow">{siteConfig.tagline}</p>
          <h1>Measure once. Plan flooring with confidence.</h1>
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
      </>
    );
  else if (slug === "calculators")
    content = (
      <>
        <h1>All flooring calculators</h1>
        <p>
          Six practical tools for the most common flooring material questions.
        </p>
        <Cards />
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
        <Related current={slug} />
      </article>
    );
  } else if (slug === "guides")
    content = (
      <article className="reading">
        <p className="eyebrow">Practical flooring planning</p>
        <h1>Flooring Guides</h1>
        <p>
          Use these concise guides to measure rooms consistently, understand
          material allowances, and interpret flooring quantities before
          purchasing.
        </p>
        <h2 id="measure-room">How to Measure a Room for Flooring</h2>
        <p>
          Sketch the room and divide L-shaped or irregular spaces into
          rectangles. Measure each rectangle at its longest and widest points,
          multiply length by width, then add the areas. Measure closets and
          alcoves separately when they will receive flooring.
        </p>
        <h2 id="material-allowance">
          How Much Flooring Allowance Should You Add?
        </h2>
        <p>
          Material allowance covers cuts, damaged pieces, product defects, and
          layout needs. The calculators use 10% as an editable starting point
          because it is practical for many straightforward rooms, but it is not
          a universal rule. Room shape, installation pattern, manufacturer
          instructions, and installer recommendations may require a different
          percentage.
        </p>
        <h2 id="square-feet-vs-square-yards">Square Feet vs Square Yards</h2>
        <p>
          Hard flooring is commonly measured in square feet, while carpet may
          also be described in square yards. One square yard equals nine square
          feet. Convert square feet to square yards by dividing the total area
          by nine—not by dividing each room dimension by nine.
        </p>
        <h2 id="box-coverage">How Flooring Box Coverage Works</h2>
        <p>
          Box or carton coverage is the finished area the packaged product is
          intended to cover. Coverage differs by manufacturer and product
          because plank, board, or tile dimensions and the number of pieces in
          each box vary. Use the coverage printed on the exact packaging or
          product page rather than assuming a standard box size.
        </p>
        <h2 id="carpet-estimates">
          Why Carpet Estimates Are Different from Boxed Flooring
        </h2>
        <p>
          Carpet is cut from rolls, so room area alone does not determine an
          efficient layout. Roll width, direction, seams, pattern matching,
          doorways, closets, stairs, and installer decisions can change the
          required length. Treat online carpet results as preliminary planning
          estimates.
        </p>
        <h2 id="imperial-vs-metric">Choosing Imperial vs Metric</h2>
        <p>
          Choose the system used by your tape measure and product packaging.
          Imperial mode uses feet, inches, square feet, and square yards where
          useful. Metric mode uses meters, centimeters, and square meters. Keep
          every input in the selected system rather than mixing units.
        </p>
        <h2 id="rounding-up">Why Quantities Are Rounded Up</h2>
        <p>
          Stores normally sell whole tiles, planks, boards, boxes, and cartons.
          A calculated need of 5.01 boxes still requires 6 whole boxes, so
          purchase quantities are rounded up only after the full-precision
          calculation is complete.
        </p>
        <h2 id="measuring-mistakes">Common Measuring Mistakes</h2>
        <p>
          Common errors include omitting closets, mixing feet and inches,
          measuring only one side of an irregular room, rounding dimensions too
          early, and using coverage from a different product. Record each area,
          keep units consistent, and verify the final measurements before
          ordering.
        </p>
        <h2 id="ready-to-calculate">Ready to Calculate?</h2>
        <p>
          Use your measurements with the calculator designed for your flooring
          material.
        </p>
        <Link className="button" href="/calculators">
          View all calculators
        </Link>
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
        <h2>Current practices</h2>
        <p>
          {siteConfig.name} provides browser-based calculators and a contact
          form. We do not currently use Google Analytics, Google AdSense,
          behavioral advertising, or advertising cookies.
        </p>
        <h2>Calculator inputs</h2>
        <p>
          Room dimensions, product measurements, and allowance values are
          processed in your browser for the calculation. They are not submitted
          to us or saved by the site.
        </p>
        <h2>Contact-form submissions</h2>
        <p>
          When you use the contact form, your name, email address, subject,
          message, and technical delivery information are processed to deliver
          and respond to your request. Resend acts as the email delivery
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
          The current calculators do not require tracking cookies. Essential
          hosting or security features may use limited technical storage. Your
          browser lets you review or block cookies, although doing so may affect
          some functions.
        </p>
        <h2>Possible future analytics and advertising</h2>
        <p>
          Google Analytics or Google AdSense may be added in the future, but
          neither is currently enabled. Before enabling them, we will update
          this policy and provide any consent choices required by applicable
          law.
        </p>
        <h2>Third-party services</h2>
        <p>
          Cloud hosting providers deliver the site, and Resend processes
          contact-form email. Those providers process information under their
          own terms and privacy practices.
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
          ask about a submitted message through the Contact page. Legal rights
          may vary by location.
        </p>
        <p>
          {siteConfig.name} is a general-purpose flooring planning website and
          is not directed to children.
        </p>
        <h2>Policy changes</h2>
        <p>
          We may revise this policy when site practices change. The current
          version will remain available on this page without a fabricated
          effective date.
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
  else notFound();
  return (
    <>
      <Header />
      <main id="main">{content}</main>
      <Footer />
    </>
  );
}
