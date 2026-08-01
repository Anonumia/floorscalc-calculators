export type Unit = "imperial" | "metric";
export type Room = { name?: string; length: number; width: number };
export const DEFAULT_ALLOWANCE = 10;
const ceilQuantity = (value:number) => Math.ceil(value - 1e-10);
export const roomArea = (r: Room) => r.length * r.width;
export function areaResult(rooms: Room[], allowance = DEFAULT_ALLOWANCE, coverage?: number) {
  if (!rooms.length || rooms.some(r => !Number.isFinite(r.length) || !Number.isFinite(r.width) || r.length <= 0 || r.width <= 0)) throw new Error("Enter positive room dimensions.");
  if (!Number.isFinite(allowance) || allowance < 0 || allowance > 50) throw new Error("Material allowance must be between 0% and 50%.");
  if (coverage !== undefined && (!Number.isFinite(coverage) || coverage <= 0)) throw new Error("Package coverage must be greater than zero.");
  const areas = rooms.map(roomArea), measured = areas.reduce((a,b)=>a+b,0), allowanceArea = measured * allowance / 100, finalArea = measured + allowanceArea;
  return { areas, measured, allowanceArea, finalArea, packages: coverage ? ceilQuantity(finalArea / coverage) : undefined };
}
export function pieceResult(rooms: Room[], pieceLength: number, pieceWidth: number, allowance = DEFAULT_ALLOWANCE, piecesPerBox?: number, boxCoverage?: number) {
  if (pieceLength <= 0 || pieceWidth <= 0) throw new Error("Enter positive product dimensions.");
  if (piecesPerBox !== undefined && piecesPerBox <= 0) throw new Error("Pieces per box must be greater than zero.");
  const base = areaResult(rooms, allowance, boxCoverage), pieceArea = pieceLength * pieceWidth;
  const before = base.measured / pieceArea, total = ceilQuantity(before * (1 + allowance / 100));
  return { ...base, pieceArea, before, allowancePieces: before * allowance / 100, total, packages: piecesPerBox ? ceilQuantity(total / piecesPerBox) : base.packages };
}
export function carpetResult(rooms: Room[], rollWidth: number, allowance = DEFAULT_ALLOWANCE) {
  if (rollWidth <= 0) throw new Error("Roll width must be greater than zero.");
  const base = areaResult(rooms, allowance);
  const rawLength = rooms.reduce((sum,r) => sum + ceilQuantity(r.width / rollWidth) * r.length, 0);
  const length = rawLength * (1 + allowance / 100), materialArea = length * rollWidth;
  return { ...base, rollWidth, rawLength, length, materialArea };
}
export const inchesToFeet = (n:number) => n / 12;
export const centimetersToMeters = (n:number) => n / 100;
