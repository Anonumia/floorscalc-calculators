"use client";
import { useRef, useState } from "react";
import {
  areaResult,
  carpetResult,
  inchesToFeet,
  centimetersToMeters,
  pieceResult,
  type Room,
  type Unit,
} from "./calculations";

type Kind = "general" | "tile" | "vinyl" | "laminate" | "hardwood" | "carpet";
const labels: Record<Kind, string> = {
  general: "General flooring",
  tile: "Tile",
  vinyl: "Vinyl plank",
  laminate: "Laminate",
  hardwood: "Hardwood",
  carpet: "Carpet",
};
const calculatorTitles: Record<Kind, string> = {
  general: "General Flooring Calculator",
  tile: "Tile Calculator",
  vinyl: "Vinyl Plank Calculator",
  laminate: "Laminate Calculator",
  hardwood: "Hardwood Calculator",
  carpet: "Carpet Calculator",
};
const fmt = (n: number) => Number(n.toFixed(2)).toLocaleString();
const selectNumericValue = (event: React.FocusEvent<HTMLInputElement>) =>
  event.currentTarget.select();
const withoutLeadingZeros = (value: string) =>
  value.replace(/^0+(?=\d)/, "");
const normalizedNumericChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const normalized = withoutLeadingZeros(event.currentTarget.value);
  if (normalized !== event.currentTarget.value) event.currentTarget.value = normalized;
  return normalized;
};
const normalizeNumericInput = (event: React.FormEvent<HTMLInputElement>) => {
  const input = event.currentTarget;
  const normalized = withoutLeadingZeros(input.value);
  input.value = normalized;
  queueMicrotask(() => {
    if (input.value !== normalized && Number(input.value) === Number(normalized)) {
      input.value = normalized;
    }
  });
};
const preventLeadingZero = (event: React.KeyboardEvent<HTMLInputElement>) => {
  const input = event.currentTarget;
  if (/^[0-9]$/.test(event.key) && input.value === "0" && input.selectionStart === input.selectionEnd) {
    event.preventDefault();
    input.value = event.key;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
};
const differsFromWhole = (raw: number, whole: number) =>
  Math.abs(whole - raw) > 1e-10;
const pieceTerms: Record<"tile" | "vinyl" | "laminate" | "hardwood", { singular: string; plural: string }> = {
  tile: { singular: "tile", plural: "tiles" },
  vinyl: { singular: "plank", plural: "planks" },
  laminate: { singular: "plank", plural: "planks" },
  hardwood: { singular: "board", plural: "boards" },
};
const laminateDefaults = {
  imperial: { length: 47.25, width: 7.5 },
  metric: { length: 120, width: 19 },
};
const unitCopy: Record<
  Kind,
  Record<Unit, { method: string; example: string; tips: string }>
> = {
  general: {
    imperial: {
      method:
        "Room area (sq ft) = length (ft) × width (ft). Add the room areas, calculate the material allowance, and add it to the measured area. Boxes = final material area ÷ coverage per box.",
      example:
        "Room: 10 ft × 12 ft. Measured area: 120 sq ft. Material allowance: 10%. Allowance amount: 12 sq ft. Final material area: 132 sq ft.",
      tips: "Measure each room in feet at its widest and longest points. Split L-shaped spaces into rectangles.",
    },
    metric: {
      method:
        "Room area (m²) = length (m) × width (m). Add the room areas, calculate the material allowance, and add it to the measured area. Boxes = final material area ÷ coverage per box.",
      example:
        "Room: 3 m × 4 m. Measured area: 12 m². Material allowance: 10%. Allowance amount: 1.2 m². Final material area: 13.2 m².",
      tips: "Measure each room in meters at its widest and longest points. Split L-shaped spaces into rectangles.",
    },
  },
  tile: {
    imperial: {
      method:
        "Tile area in square feet = tile length (in) × tile width (in) ÷ 144. Tiles before allowance = surface area (sq ft) ÷ tile area (sq ft). Apply the allowance and round the final tile and box counts up.",
      example:
        "A 10 ft × 10 ft surface is 100 sq ft. A 12 in × 12 in tile is 1 sq ft. At 10%, the result is 110 whole tiles; 12 tiles per box requires 10 boxes.",
      tips: "Measure surfaces in feet and enter actual tile dimensions in inches. Check the coverage or tile count printed on the box.",
    },
    metric: {
      method:
        "Tile area in square meters = tile length (cm) × tile width (cm) ÷ 10,000. Tiles before allowance = surface area (m²) ÷ tile area (m²). Apply the allowance and round final tile and box counts up.",
      example:
        "A 3 m × 4 m surface is 12 m². A 30 cm × 30 cm tile is 0.09 m². At 10%, the result is 147 whole tiles after rounding up.",
      tips: "Measure surfaces in meters and enter actual tile dimensions in centimeters. Check the square-meter coverage or tile count printed on the box.",
    },
  },
  vinyl: {
    imperial: {
      method:
        "Plank area in square feet = plank length (in) × plank width (in) ÷ 144. Divide floor area (sq ft) by plank area, apply allowance, and round whole planks and boxes up.",
      example:
        "A 12 ft × 15 ft room is 180 sq ft. A 48 in × 6 in plank is 2 sq ft. At 10%, the result is 99 whole planks; 10 planks per box requires 10 boxes.",
      tips: "Use room measurements in feet and plank dimensions in inches. Prefer the square-foot coverage printed on the product box when available.",
    },
    metric: {
      method:
        "Plank area in square meters = plank length (cm) × plank width (cm) ÷ 10,000. Divide floor area (m²) by plank area, apply allowance, and round whole planks and boxes up.",
      example:
        "A 4 m × 5 m room is 20 m². A 120 cm × 20 cm plank is 0.24 m². At 10%, the result is 92 whole planks after rounding up.",
      tips: "Use room measurements in meters and plank dimensions in centimeters. Prefer the square-meter coverage printed on the product box when available.",
    },
  },
  laminate: {
    imperial: {
      method:
        "Add room areas in square feet, apply the allowance, then divide by carton coverage in square feet. When plank dimensions are used, divide by plank area and round pieces up.",
      example:
        "A 14 ft × 11 ft room is 154 sq ft. At 10%, 169.4 sq ft is required. With 21.5 sq ft per carton, buy 8 cartons.",
      tips: "Measure rooms in feet, enter planks in inches, and check the manufacturer’s square-foot coverage per carton.",
    },
    metric: {
      method:
        "Add room areas in square meters, apply the allowance, then divide by carton coverage in square meters. When plank dimensions are used, divide by plank area and round pieces up.",
      example:
        "A 4 m × 3 m room is 12 m². At 10%, 13.2 m² is required. With 2.2 m² per carton, buy 6 cartons.",
      tips: "Measure rooms in meters, enter planks in centimeters, and check the manufacturer’s square-meter coverage per carton.",
    },
  },
  hardwood: {
    imperial: {
      method:
        "Final hardwood area (sq ft) = measured area × (1 + allowance rate). Cartons = final area (sq ft) ÷ carton coverage (sq ft), rounded up.",
      example:
        "A 15 ft × 16 ft room is 240 sq ft. At 10%, 264 sq ft is required. With 20 sq ft per carton, buy 14 cartons.",
      tips: "For random-length hardwood, use the square-foot coverage printed on the carton instead of estimating a board count.",
    },
    metric: {
      method:
        "Final hardwood area (m²) = measured area × (1 + allowance rate). Cartons = final area (m²) ÷ carton coverage (m²), rounded up.",
      example:
        "A 4 m × 5 m room is 20 m². At 10%, 22 m² is required. With 2 m² per carton, buy 11 cartons.",
      tips: "For random-length hardwood, use the square-meter coverage printed on the carton instead of estimating a board count.",
    },
  },
  carpet: {
    imperial: {
      method:
        "For each room, runs = ceiling(room width in feet ÷ roll width in feet). Length in feet = runs × room length. Add run lengths, apply allowance, then multiply by roll width for square feet of roll material.",
      example:
        "A 10 ft × 12 ft room on a 12 ft roll uses one 10 ft run before allowance. At 10%, estimated carpet length is 11 ft and roll material is 132 sq ft (14.67 sq yd).",
      tips: "Measure rooms and roll width in feet. An installer should confirm roll direction, seams, and pattern matching.",
    },
    metric: {
      method:
        "For each room, runs = ceiling(room width in meters ÷ roll width in meters). Length in meters = runs × room length. Add run lengths, apply allowance, then multiply by roll width for square meters of roll material.",
      example:
        "A 3 m × 4 m room on a 4 m roll uses one 3 m run before allowance. At 10%, estimated carpet length is 3.3 m and roll material is 13.2 m².",
      tips: "Measure rooms and roll width in meters. An installer should confirm roll direction, seams, and pattern matching.",
    },
  },
};
export default function Calculator({ kind }: { kind: Kind }) {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [unit, setUnit] = useState<Unit>("imperial"),
    [rooms, setRooms] = useState<Room[]>([
      { name: "Room 1", length: 10, width: 12 },
    ]);
  const [allowance, setAllowance] = useState(10),
    [productL, setProductL] = useState(
      kind === "tile"
        ? 12
        : kind === "laminate"
          ? laminateDefaults.imperial.length
          : 48,
    ),
    [productW, setProductW] = useState(
      kind === "tile"
        ? 12
        : kind === "laminate"
          ? laminateDefaults.imperial.width
          : 6,
    );
  const [packMode, setPackMode] = useState("coverage"),
    [packValue, setPackValue] = useState(""),
    [rollWidth, setRollWidth] = useState(12),
    [copied, setCopied] = useState(false);
  const areaUnit = unit === "imperial" ? "sq ft" : "m²",
    lengthUnit = unit === "imperial" ? "ft" : "m";
  function update(i: number, key: keyof Room, value: string) {
    setRooms(
      rooms.map((r, j) =>
        j === i ? { ...r, [key]: key === "name" ? value : Number(withoutLeadingZeros(value)) } : r,
      ),
    );
  }
  let result: any = null;
  const validation: string[] = [];
  try {
    const coverage = packValue === "" ? undefined : Number(packValue);
    if (kind === "carpet") result = carpetResult(rooms, rollWidth, allowance);
    else if (kind === "general" || kind === "hardwood")
      result = areaResult(rooms, allowance, coverage);
    else {
      const factor = unit === "imperial" ? inchesToFeet : centimetersToMeters;
      result = pieceResult(
        rooms,
        factor(productL),
        factor(productW),
        allowance,
        packMode === "pieces" && coverage ? coverage : undefined,
        packMode === "coverage" ? coverage : undefined,
      );
    }
  } catch (e) {
    validation.push((e as Error).message);
  }
  const changeUnit = (nextUnit: Unit) => {
    setUnit(nextUnit);
    if (kind === "laminate") {
      setProductL(laminateDefaults[nextUnit].length);
      setProductW(laminateDefaults[nextUnit].width);
    }
  };
  const terms =
    kind === "tile" ||
    kind === "vinyl" ||
    kind === "laminate" ||
    kind === "hardwood"
      ? pieceTerms[kind]
      : null;
  const rawPieceTotal = result?.before
    ? result.before * (1 + allowance / 100)
    : undefined;
  const pieceWasRounded =
    rawPieceTotal !== undefined && differsFromWhole(rawPieceTotal, result.total);
  const coverage = packValue === "" ? undefined : Number(packValue);
  const rawPackageTotal =
    result?.packages && coverage
      ? packMode === "pieces" && !["general", "hardwood"].includes(kind)
        ? result.total / coverage
        : result.finalArea / coverage
      : undefined;
  const packageWasRounded =
    rawPackageTotal !== undefined &&
    differsFromWhole(rawPackageTotal, result.packages);
  const packageTerm = kind === "hardwood" || kind === "laminate" ? "cartons" : "boxes";
  const systemName = unit === "imperial" ? "Imperial" : "Metric";
  const productUnit = unit === "imperial" ? "in" : "cm";
  const planningDisclaimer = kind === "carpet"
    ? "Planning estimate only. An installer should confirm roll direction, seams, pattern matching, and layout."
    : "Planning estimate only. Confirm product coverage and installation requirements before purchasing.";
  const resultLines = result ? [
    ...result.areas.map((a: number, i: number) => `${rooms[i].name || `Area ${i + 1}`}: ${fmt(a)} ${areaUnit}`),
    `Combined measured area: ${fmt(result.measured)} ${areaUnit}`,
    ...(unit === "imperial" ? [`Measured area in square yards: ${fmt(result.measured / 9)} sq yd`] : []),
    `Material allowance (${allowance}%): ${fmt(result.allowanceArea)} ${areaUnit}`,
    `Final material area: ${fmt(result.finalArea)} ${areaUnit}`,
    ...(result.pieceArea ? [
      `Individual ${terms?.singular} area: ${fmt(result.pieceArea)} ${areaUnit}`,
      `${terms?.plural[0].toUpperCase()}${terms?.plural.slice(1)} before allowance: ${fmt(result.before)}`,
      `Additional ${terms?.plural} from allowance: ${fmt(result.allowancePieces)}`,
      `Whole ${terms?.plural} required: ${result.total}${pieceWasRounded ? " (rounded up)" : ""}`,
    ] : []),
    ...(result.packages ? [`Whole ${packageTerm} required: ${result.packages}${packageWasRounded ? ` (rounded up to whole ${packageTerm})` : ""}`] : []),
    ...(kind === "carpet" ? [
      `Selected roll width: ${fmt(result.rollWidth)} ${lengthUnit}`,
      `Estimated carpet roll length: ${fmt(result.length)} ${lengthUnit}`,
      `Estimated roll material: ${fmt(result.materialArea)} ${areaUnit}`,
    ] : []),
  ] : [];
  const inputLines = [
    ...rooms.map((room, i) => `${room.name || `Room ${i + 1}`}: ${fmt(room.length)} ${lengthUnit} × ${fmt(room.width)} ${lengthUnit}`),
    ...(!["general", "carpet"].includes(kind) ? [`${terms?.singular[0].toUpperCase()}${terms?.singular.slice(1)} dimensions: ${fmt(productL)} ${productUnit} × ${fmt(productW)} ${productUnit}`] : []),
    ...(kind === "carpet" ? [`Carpet roll width: ${fmt(rollWidth)} ${lengthUnit}`] : []),
    ...(packValue !== "" ? [`${packMode === "pieces" && !["general", "hardwood"].includes(kind) ? `${kind === "tile" ? "Tiles" : "Planks"} per ${packageTerm.slice(0, -1)}` : `Coverage per ${packageTerm.slice(0, -1)}`}: ${packValue}${packMode === "coverage" || ["general", "hardwood"].includes(kind) ? ` ${areaUnit}` : ""}`] : []),
    `Material allowance: ${allowance}%`,
  ];
  const copyResults = async () => {
    if (!result) return;
    const disclaimerLines = planningDisclaimer.split(/(?<=only\.) /);
    const text = ["FloorsCalc", calculatorTitles[kind], `Measurement system: ${systemName}`, "Inputs", ...inputLines, "Result Breakdown", ...resultLines, ...disclaimerLines].join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };
  const stickyPrimary = result ? kind === "general" || kind === "hardwood"
    ? `Final area: ${fmt(result.finalArea)} ${areaUnit}${result.packages ? ` · ${result.packages} ${packageTerm}` : ""}`
    : kind === "carpet"
      ? `Roll length: ${fmt(result.length)} ${lengthUnit} · Material: ${fmt(result.materialArea)} ${areaUnit}`
      : `${result.total} ${terms?.plural}${result.packages ? ` · ${result.packages} ${packageTerm}` : ""}` : "";
  const printRow = (line: string, index: number) => {
    const separator = line.indexOf(":");
    const label = separator === -1 ? line : line.slice(0, separator);
    const value = separator === -1 ? "" : line.slice(separator + 1).trim();
    return <div className="print-row" key={index}><dt>{label}</dt><dd>{value}</dd></div>;
  };
  return (
    <section className={`calculator${result ? " has-sticky-result" : ""}`} aria-labelledby="tool-title">
      <h2 id="tool-title">{labels[kind]} calculator</h2>
      <form noValidate>
        <fieldset className="unit-toggle">
          <legend>Measurement system</legend>
          <label>
            <input
              type="radio"
              checked={unit === "imperial"}
              onChange={() => changeUnit("imperial")}
            />{" "}
            Imperial
          </label>
          <label>
            <input
              type="radio"
              checked={unit === "metric"}
              onChange={() => changeUnit("metric")}
            />{" "}
            Metric
          </label>
        </fieldset>
        <h3>Rooms or areas</h3>
        {rooms.map((r, i) => (
          <div className="room" key={i}>
            <label>
              Room name{" "}
              <input
                value={r.name || ""}
                onChange={(e) => update(i, "name", e.target.value)}
              />
            </label>
            <label>
              Length ({lengthUnit}){" "}
              <input
                type="number"
                min="0.01"
                max="10000"
                step="any"
                value={r.length}
                onChange={(e) => update(i, "length", normalizedNumericChange(e))}
                onInput={normalizeNumericInput}
                onKeyDown={preventLeadingZero}
                onFocus={selectNumericValue}
                required
              />
            </label>
            <label>
              Width ({lengthUnit}){" "}
              <input
                type="number"
                min="0.01"
                max="10000"
                step="any"
                value={r.width}
                onChange={(e) => update(i, "width", normalizedNumericChange(e))}
                onInput={normalizeNumericInput}
                onKeyDown={preventLeadingZero}
                onFocus={selectNumericValue}
                required
              />
            </label>
            {rooms.length > 1 && (
              <button
                type="button"
                className="text-button"
                onClick={() => setRooms(rooms.filter((_, j) => i !== j))}
              >
                Remove room
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="secondary"
          onClick={() =>
            setRooms([
              ...rooms,
              { name: `Room ${rooms.length + 1}`, length: 10, width: 10 },
            ])
          }
        >
          Add another room
        </button>
        {!["general", "carpet"].includes(kind) && (
          <div className="product">
            <h3>
              {kind === "hardwood"
                ? "Fixed board dimensions (optional)"
                : "Product dimensions"}
            </h3>
            <label>
              Length ({unit === "imperial" ? "in" : "cm"}){" "}
              <input
                type="number"
                min="0.01"
                step="any"
                value={productL}
                onChange={(e) => setProductL(Number(normalizedNumericChange(e)))}
                onInput={normalizeNumericInput}
                onKeyDown={preventLeadingZero}
                onFocus={selectNumericValue}
              />
            </label>
            <label>
              Width ({unit === "imperial" ? "in" : "cm"}){" "}
              <input
                type="number"
                min="0.01"
                step="any"
                value={productW}
                onChange={(e) => setProductW(Number(normalizedNumericChange(e)))}
                onInput={normalizeNumericInput}
                onKeyDown={preventLeadingZero}
                onFocus={selectNumericValue}
              />
            </label>
          </div>
        )}
        {kind === "carpet" ? (
          <label>
            Carpet roll width ({lengthUnit}){" "}
            <input
              type="number"
              min="0.01"
              step="any"
              value={rollWidth}
              onChange={(e) => setRollWidth(Number(normalizedNumericChange(e)))}
              onInput={normalizeNumericInput}
              onKeyDown={preventLeadingZero}
              onFocus={selectNumericValue}
            />
          </label>
        ) : kind === "general" ? (
          <label>
            Coverage per box ({areaUnit}) — optional{" "}
            <input
              type="number"
              min="0.01"
              step="any"
              placeholder={
                unit === "imperial" ? "Example: 22.45" : "Example: 2.09"
              }
              value={packValue}
              onChange={(e) => setPackValue(normalizedNumericChange(e))}
              onInput={normalizeNumericInput}
              onKeyDown={preventLeadingZero}
              onFocus={selectNumericValue}
            />
            <small>
              {unit === "imperial"
                ? "Enter the coverage printed on one flooring box or shown on the product page. Leave blank if you only need the total flooring area."
                : "Enter the square-meter coverage printed on one flooring box or shown on the product page. Leave blank if you only need the total flooring area."}
            </small>
          </label>
        ) : kind === "hardwood" ? (
          <label>
            Coverage per carton ({areaUnit}) — optional{" "}
            <input
              type="number"
              min="0.01"
              step="any"
              placeholder={unit === "imperial" ? "Example: 20" : "Example: 2"}
              value={packValue}
              onChange={(e) => setPackValue(normalizedNumericChange(e))}
              onInput={normalizeNumericInput}
              onKeyDown={preventLeadingZero}
              onFocus={selectNumericValue}
            />
            <small>
              Enter the coverage printed on one hardwood carton or shown on the
              manufacturer product page. Leave blank if you only need the total
              hardwood area.
            </small>
          </label>
        ) : (
          <div>
            <label>
              {kind === "laminate" ? "Carton entry method" : "Box entry method"}{" "}
              <select
                value={packMode}
                onChange={(e) => setPackMode(e.target.value)}
              >
                <option value="coverage">
                  Coverage per {kind === "laminate" ? "carton" : "box"}
                </option>
                <option value="pieces">
                  {kind === "tile" ? "Tiles" : "Planks"} per{" "}
                  {kind === "laminate" ? "carton" : "box"}
                </option>
              </select>
            </label>
            <label>
              {packMode === "coverage"
                ? `Coverage per ${kind === "laminate" ? "carton" : "box"} (${areaUnit})`
                : `${kind === "tile" ? "Tiles" : "Planks"} per ${kind === "laminate" ? "carton" : "box"}`}{" "}
              — optional{" "}
              <input
                type="number"
                min="0.01"
                step="any"
                value={packValue}
                onChange={(e) => setPackValue(normalizedNumericChange(e))}
                onInput={normalizeNumericInput}
                onKeyDown={preventLeadingZero}
                onFocus={selectNumericValue}
              />
              <small>
                {kind === "tile"
                  ? "Use the tile count or coverage printed on the product box or manufacturer product page."
                  : kind === "laminate"
                    ? "Use the plank count or coverage printed on the laminate carton or manufacturer product page."
                    : "Use the plank count or coverage printed on the vinyl flooring box or manufacturer product page."}
              </small>
            </label>
          </div>
        )}
        <label>
          Material allowance (%){" "}
          <input
            type="number"
            min="0"
            max="50"
            step="0.1"
            value={allowance}
            onChange={(e) => setAllowance(Number(normalizedNumericChange(e)))}
            onInput={normalizeNumericInput}
            onKeyDown={preventLeadingZero}
            onFocus={selectNumericValue}
          />
          <small>
            10% is a recommended starting point, not a hidden assumption.
          </small>
        </label>
        {validation.map((x, i) => (
          <p className="error" role="alert" key={i}>
            {x}
          </p>
        ))}
        <div className="actions">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setUnit("imperial");
              setRooms([{ name: "Room 1", length: 10, width: 12 }]);
              setAllowance(10);
              setProductL(
                kind === "tile"
                  ? 12
                  : kind === "laminate"
                    ? laminateDefaults.imperial.length
                    : 48,
              );
              setProductW(
                kind === "tile"
                  ? 12
                  : kind === "laminate"
                    ? laminateDefaults.imperial.width
                    : 6,
              );
              setPackMode("coverage");
              setPackValue("");
              setRollWidth(12);
            }}
          >
            Reset
          </button>
        </div>
      </form>
      {result && (
        <div className="results screen-results" id="result-breakdown" ref={resultsRef} aria-live="polite">
          <h3>Result breakdown</h3>
          <dl>
            {result.areas.map((a: number, i: number) => (
              <div key={i}>
                <dt>{rooms[i].name || `Area ${i + 1}`}</dt>
                <dd>
                  {fmt(a)} {areaUnit}
                </dd>
              </div>
            ))}
            <div>
              <dt>Combined measured area</dt>
              <dd>
                {fmt(result.measured)} {areaUnit}
              </dd>
            </div>
            {unit === "imperial" && (
              <div>
                <dt>Measured area in square yards</dt>
                <dd>{fmt(result.measured / 9)} sq yd</dd>
              </div>
            )}
            <div>
              <dt>Material allowance ({allowance}%)</dt>
              <dd>
                {fmt(result.allowanceArea)} {areaUnit}
              </dd>
            </div>
            <div>
              <dt>Final material area</dt>
              <dd>
                {fmt(result.finalArea)} {areaUnit}
              </dd>
            </div>
            {result.pieceArea && (
              <>
                <div>
                  <dt>Individual {terms?.singular} area</dt>
                  <dd>
                    {fmt(result.pieceArea)} {areaUnit}
                  </dd>
                </div>
                <div>
                  <dt>{terms?.plural[0].toUpperCase()}{terms?.plural.slice(1)} before allowance</dt>
                  <dd>{fmt(result.before)}</dd>
                </div>
                <div>
                  <dt>Additional {terms?.plural} from allowance</dt>
                  <dd>{fmt(result.allowancePieces)}</dd>
                </div>
                <div>
                  <dt>Whole {terms?.plural} required</dt>
                  <dd>
                    {result.total}
                    {pieceWasRounded ? " (rounded up)" : ""}
                  </dd>
                </div>
              </>
            )}
            {result.packages && (
              <div>
                <dt>
                  Whole{" "}
                  {kind === "hardwood" || kind === "laminate"
                    ? "cartons"
                    : "boxes"}{" "}
                  required
                </dt>
                <dd>
                  {result.packages}
                  {packageWasRounded
                    ? ` (rounded up to whole ${
                        kind === "hardwood" || kind === "laminate"
                          ? "cartons"
                          : "boxes"
                      })`
                    : ""}
                </dd>
              </div>
            )}
            {kind === "carpet" && (
              <>
                <div>
                  <dt>Selected roll width</dt>
                  <dd>
                    {fmt(result.rollWidth)} {lengthUnit}
                  </dd>
                </div>
                <div>
                  <dt>Estimated carpet length</dt>
                  <dd>
                    {fmt(result.length)} {lengthUnit}
                  </dd>
                </div>
                <div>
                  <dt>Estimated roll material</dt>
                  <dd>
                    {fmt(result.materialArea)} {areaUnit}
                  </dd>
                </div>
              </>
            )}
          </dl>
          <div className="result-actions">
            <button type="button" onClick={copyResults}>Copy Results</button>
            <button type="button" className="print-results" onClick={() => window.print()}>Print Results</button>
          </div>
          <p className="copy-status" role="status" aria-live="polite">{copied ? "Copied!" : ""}</p>
          {kind === "carpet" && (
            <p className="notice">
              <strong>Planning estimate:</strong> actual requirements may change
              with roll direction, orientation, seams, pattern matching,
              doorways, closets, hallways, stairs, irregular shapes, and
              installer layout decisions.
            </p>
          )}
        </div>
      )}
      {result && (
        <section className="print-summary" aria-label="Printable calculation summary">
          <header className="print-report-header">
            <p className="print-brand">FloorsCalc</p>
            <h1>{calculatorTitles[kind]}</h1>
          </header>
          <h2>Measurement System</h2>
          <p className="print-system">{systemName}</p>
          <h3>Inputs</h3>
          <dl>{inputLines.map(printRow)}</dl>
          <h3>Result Breakdown</h3>
          <dl>{resultLines.map(printRow)}</dl>
          <div className="print-disclaimer">{planningDisclaimer.split(/(?<=only\.) /).map((line, i) => <p key={i}>{line}</p>)}</div>
          <p className="print-url">www.floorscalc.com</p>
        </section>
      )}
      {result && (
        <button
          type="button"
          className="mobile-sticky-result"
          aria-label={`View result breakdown. ${stickyPrimary}`}
          onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        >
          <span>Current result</span><strong>{stickyPrimary}</strong>
        </button>
      )}
      <div className="unit-content" data-unit={unit}>
        <h2>Exact calculation method</h2>
        <p>
          {unitCopy[kind][unit].method}{" "}
          {kind === "general"
            ? "Internal calculations retain full precision. Box quantities are rounded up to the next whole box when box coverage is provided."
            : kind === "carpet"
              ? "Internal calculations retain full precision. Estimated roll lengths and material quantities are displayed as planning values."
              : kind === "tile"
                ? "Internal calculations retain full precision. Final tile and box quantities are rounded up only when a whole purchase quantity requires it."
                : kind === "vinyl"
                  ? "Internal calculations retain full precision. Final plank and box quantities are rounded up only when a whole purchase quantity requires it."
                  : kind === "laminate"
                    ? "Internal calculations retain full precision. Final plank and carton quantities are rounded up only when a whole purchase quantity requires it."
                    : "Internal calculations retain full precision. Final board and carton quantities are rounded up only when a whole purchase quantity requires it."}
        </p>
        <h2>Worked example</h2>
        <p>{unitCopy[kind][unit].example}</p>
        <h2>Measurement tips</h2>
        <p>{unitCopy[kind][unit].tips}</p>
      </div>
    </section>
  );
}
