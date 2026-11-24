export interface Pt {
  x: number;
  y: number;
}

/**
 * The journey line: it passes through every milestone node and, along each
 * item, bulges out to that item's free side (`sides[i]` = -1 or 1). Both
 * control points of a segment sit on the same side, so the tangents line up
 * at every node and the whole path stays one smooth S-wave.
 *
 * Returns the full `d` plus the prefix ending at each node, so callers can
 * measure how far along the path each milestone is.
 */
export function buildJourney(points: Pt[], sides: number[], opts: { amp: number; startY: number; endY: number }) {
  if (!points.length) return { d: "", prefixes: [] as string[] };
  const { amp, startY, endY } = opts;
  const f = (n: number) => n.toFixed(1);

  let d = `M ${f(points[0].x)} ${f(startY)} L ${f(points[0].x)} ${f(points[0].y)}`;
  const prefixes = [d];
  const ends = [...points.slice(1), { x: points[points.length - 1].x, y: endY }];
  // One vertical handle length for every segment keeps the tangents parallel at each node.
  const k = Math.min(...ends.map((b, i) => b.y - points[i].y).filter((v) => v > 0)) * 0.3;
  ends.forEach((b, i) => {
    const a = points[i];
    const dy = b.y - a.y;
    if (dy <= 0) return;
    const off = sides[i] * amp;
    d += ` C ${f(a.x + off)} ${f(a.y + k)} ${f(b.x + off)} ${f(b.y - k)} ${f(b.x)} ${f(b.y)}`;
    if (i < points.length - 1) prefixes.push(d);
  });
  return { d, prefixes };
}

/**
 * Phone layout: cards alternate edges, leaving a narrow strip beside each.
 * The line runs down the strip next to a card (node → bottom), then swoops
 * across the gap to the other strip for the next card.
 */
export function buildRoad(nodes: Pt[], bottoms: Pt[], endY: number) {
  if (!nodes.length) return { d: "", prefixes: [] as string[] };
  const f = (n: number) => n.toFixed(1);
  let d = `M ${f(nodes[0].x)} 0 L ${f(nodes[0].x)} ${f(nodes[0].y)}`;
  const prefixes = [d];
  nodes.forEach((_, i) => {
    const b = bottoms[i];
    d += ` L ${f(b.x)} ${f(b.y)}`;
    const next = nodes[i + 1];
    if (!next) return;
    const g = (next.y - b.y) * 0.6;
    d += ` C ${f(b.x)} ${f(b.y + g)} ${f(next.x)} ${f(next.y - g)} ${f(next.x)} ${f(next.y)}`;
    prefixes.push(d);
  });
  const last = bottoms[bottoms.length - 1];
  if (endY > last.y) d += ` L ${f(last.x)} ${f(endY)}`;
  return { d, prefixes };
}
