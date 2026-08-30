export const calculators = [
  ["general-flooring-calculator","General Flooring Calculator","Find combined room area, allowance, and whole packages."],
  ["tile-calculator","Tile Calculator","Estimate whole tiles and boxes for rectangular surfaces."],
  ["vinyl-plank-calculator","Vinyl Plank Calculator","Plan vinyl plank quantities using product dimensions or box coverage."],
  ["laminate-flooring-calculator","Laminate Flooring Calculator","Estimate laminate planks, required area, and cartons."],
  ["hardwood-flooring-calculator","Hardwood Flooring Calculator","Plan hardwood area and whole cartons using actual product coverage."],
  ["carpet-calculator","Carpet Calculator","Create a preliminary roll-width planning estimate."],
] as const;

export const guides = [
  {
    slug: "how-to-measure-a-room-for-flooring",
    title: "How to Measure a Room for Flooring",
    description: "Measure rectangular, L-shaped, and irregular rooms for flooring, including closets, alcoves, feet and inches, and combined areas.",
    group: "Measuring and area",
    summary: "Turn a room sketch and tape-measure readings into a reliable flooring area, including closets, alcoves, and irregular shapes.",
  },
  {
    slug: "how-to-calculate-flooring-for-multiple-rooms",
    title: "How to Calculate Flooring for Multiple Rooms",
    description: "Calculate flooring for several rooms by measuring each area, combining totals, applying allowance, and converting the result to packages.",
    group: "Measuring and area",
    summary: "Build one project total from several rooms without omitting closets, hallways, or small connecting spaces.",
  },
  {
    slug: "flooring-square-feet-vs-square-yards",
    title: "Flooring Square Feet vs Square Yards",
    description: "Understand square feet, square yards, linear measurements, and square meters with correct flooring conversion formulas and examples.",
    group: "Measuring and area",
    summary: "Convert flooring area correctly and avoid confusing square yards with linear yards or room dimensions.",
  },
  {
    slug: "how-much-extra-flooring-to-buy",
    title: "How Much Extra Flooring Should You Buy?",
    description: "Learn how flooring allowance is calculated, what it can cover, why the percentage varies, and how package rounding affects an order.",
    group: "Allowance and purchasing",
    summary: "Choose an allowance based on the product and project instead of treating one percentage as a universal rule.",
  },
  {
    slug: "flooring-box-carton-coverage",
    title: "How Flooring Box and Carton Coverage Works",
    description: "Use manufacturer box or carton coverage to calculate whole flooring packages and understand required area versus purchased coverage.",
    group: "Allowance and purchasing",
    summary: "Convert required flooring area into whole boxes or cartons using coverage from the exact product packaging.",
  },
  {
    slug: "how-to-calculate-tile-needed",
    title: "How to Calculate Tile Needed for a Room",
    description: "Calculate tile quantities from room and tile dimensions, then account for allowance, whole tiles, boxes, openings, and layout limits.",
    group: "Material-specific planning",
    summary: "Calculate whole tiles and boxes while keeping room area, tile area, allowance, and purchase rounding separate.",
  },
  {
    slug: "how-to-calculate-vinyl-plank-flooring",
    title: "How to Calculate Vinyl Plank Flooring",
    description: "Calculate vinyl plank flooring from room area, plank dimensions, material allowance, and exact box coverage with worked examples.",
    group: "Material-specific planning",
    summary: "Estimate vinyl planks and boxes using actual plank dimensions or the coverage printed on the product box.",
  },
  {
    slug: "how-to-calculate-laminate-flooring",
    title: "How to Calculate Laminate Flooring",
    description: "Calculate laminate flooring area, planks, and whole cartons while accounting for allowance, coverage, layout, and product instructions.",
    group: "Material-specific planning",
    summary: "Move from measured room area to whole laminate cartons without rounding too early or assuming standard coverage.",
  },
  {
    slug: "how-to-calculate-hardwood-flooring",
    title: "How to Calculate Hardwood Flooring",
    description: "Calculate hardwood flooring area and cartons, understand fixed versus random-length boards, and account for project-specific allowance.",
    group: "Material-specific planning",
    summary: "Use actual carton coverage for hardwood and understand when a board-count estimate would create false precision.",
  },
  {
    slug: "how-to-measure-for-carpet",
    title: "How to Measure for Carpet",
    description: "Measure rooms for a preliminary carpet estimate using roll width, runs, and length while recognizing seams and installer layout limits.",
    group: "Material-specific planning",
    summary: "Create a preliminary roll-width estimate and understand why carpet layout requires more than room area alone.",
  },
] as const;

export const guidePath = (slug: string) => `/guides/${slug}`;
