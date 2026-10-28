import { SVGPathData } from "svg-pathdata";
import type { SVGCommand } from "svg-pathdata";

/**
 * Geometric autocrop svgo plugin.
 *
 * Rewrites the viewBox to the exact bounding box of the artwork so logos
 * carry no transparent padding. Replaces the `svgo-autocrop` package,
 * which measured rendered pixels in headless Chrome: in that setup Chrome
 * does not paint beyond the default 800x600 viewport, so any logo wider
 * than 800 units was silently cropped to 800 (e.g. the NB lockup, 1337
 * units wide, came out as `viewBox="0 0 800 182"` with the wordmark cut
 * off).
 *
 * How it works:
 * - Walks the svg AST and accumulates the exact bounding box of all
 *   painted geometry, composing nested `transform` attributes into an
 *   affine matrix. Curve and arc extrema are computed exactly (bezier
 *   derivative roots; arc center parameterization with span-checked
 *   angle extrema) — important because svgo's convertPathData turns
 *   many curves into arc segments, which run just before this plugin.
 * - The result is intersected with the existing viewBox (the svg root
 *   clips overflow, so artwork outside the authored viewBox is invisible)
 *   and snapped outward to integers.
 * - The new viewBox keeps its offset (e.g. "30 0 1324 182") instead of
 *   translating all coordinates to the origin. An offset viewBox is
 *   visually identical and avoids rewriting path data — the old approach
 *   needed a fragile translation pass plus a second optimize() call to
 *   round the float noise it left behind.
 *
 * Anything the computation cannot reason about exactly makes the plugin
 * bail (leave the svg untouched): text, <use>, <image>, remaining
 * <style> blocks, clip-path/mask/filter/marker attributes, non-none
 * strokes, unparseable transforms or path data. Bailing never crops
 * wrongly — the authored viewBox is simply kept.
 */

/** 2x3 affine matrix: (x, y) -> (a*x + c*y + e, b*x + d*y + f). */
interface Matrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

const IDENTITY: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

/** Compose two matrices: `multiply(m, n)` applies m first, then n. */
function multiply(m: Matrix, n: Matrix): Matrix {
  return {
    a: n.a * m.a + n.c * m.b,
    b: n.b * m.a + n.d * m.b,
    c: n.a * m.c + n.c * m.d,
    d: n.b * m.c + n.d * m.d,
    e: n.a * m.e + n.c * m.f + n.e,
    f: n.b * m.e + n.d * m.f + n.f,
  };
}

function applyMatrix(m: Matrix, x: number, y: number): [number, number] {
  return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
}

const TRANSFORM_FN_RE = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;

/**
 * Parse an SVG `transform` attribute into a single matrix, or null when
 * it contains anything unparseable.
 */
function parseTransform(value: string): Matrix | null {
  // Reject attributes with anything else than transform functions
  // separated by whitespace/commas (e.g. editor junk).
  const remainder = value.replace(TRANSFORM_FN_RE, "");
  if (!/^[\s,]*$/.test(remainder)) return null;

  let m = IDENTITY;
  let matched = false;
  for (const match of value.matchAll(TRANSFORM_FN_RE)) {
    matched = true;    const args = match[2]
      .split(/[\s,]+/)
      .filter((part) => part.length > 0)
      .map(Number);
    if (args.some((n) => !Number.isFinite(n))) return null;

    let t: Matrix;
    switch (match[1]) {
      case "matrix":
        if (args.length !== 6) return null;
        t = {
          a: args[0],
          b: args[1],
          c: args[2],
          d: args[3],
          e: args[4],
          f: args[5],
        };
        break;
      case "translate":
        if (args.length < 1 || args.length > 2) return null;
        t = { ...IDENTITY, e: args[0], f: args[1] ?? 0 };
        break;
      case "scale":
        if (args.length < 1 || args.length > 2) return null;
        t = { ...IDENTITY, a: args[0], d: args[1] ?? args[0] };
        break;
      case "rotate": {
        if (args.length !== 1 && args.length !== 3) return null;
        const rad = (args[0] * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rotation: Matrix = { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
        if (args.length === 3) {
          // rotate(theta, cx, cy) == translate(-cx,-cy) rotate(theta) translate(cx,cy)
          t = multiply(
            multiply({ ...IDENTITY, e: -args[1], f: -args[2] }, rotation),
            { ...IDENTITY, e: args[1], f: args[2] },
          );
        } else {
          t = rotation;
        }
        break;
      }
      case "skewX":
        if (args.length !== 1) return null;
        t = { ...IDENTITY, c: Math.tan((args[0] * Math.PI) / 180) };
        break;
      case "skewY":
        if (args.length !== 1) return null;
        t = { ...IDENTITY, b: Math.tan((args[0] * Math.PI) / 180) };
        break;
      default:
        return null;
    }
    // Transform lists apply left-to-right as nested calls: in "A B", B
    // transforms the coordinates first, then A. Accumulate accordingly.
    m = multiply(t, m);
  }
  return matched ? m : null;
}

/** Roots of a*t^2 + b*t + c = 0 strictly within (0, 1). */
function quadraticRootsInUnit(a: number, b: number, c: number): number[] {
  const roots: number[] = [];
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) > 1e-12) {
      const t = -c / b;
      if (t > 0 && t < 1) roots.push(t);
    }
    return roots;
  }
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return roots;
  const squareRoot = Math.sqrt(discriminant);
  for (const t of [(-b + squareRoot) / (2 * a), (-b - squareRoot) / (2 * a)]) {
    if (t > 0 && t < 1) roots.push(t);
  }
  return roots;
}

function cubicAt(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const s = 1 - t;
  return s * s * s * p0 + 3 * s * s * t * p1 + 3 * s * t * t * p2 + t * t * t * p3;
}

function quadraticAt(t: number, p0: number, p1: number, p2: number): number {
  const s = 1 - t;
  return s * s * p0 + 2 * s * t * p1 + t * t * p2;
}

/** Mutable bounding box accumulator (in svg user units). */
class BBox {
  minX = Infinity;
  minY = Infinity;
  maxX = -Infinity;
  maxY = -Infinity;

  get valid(): boolean {
    return this.minX <= this.maxX && this.minY <= this.maxY;
  }

  addPoint(x: number, y: number): void {
    if (x < this.minX) this.minX = x;
    if (x > this.maxX) this.maxX = x;
    if (y < this.minY) this.minY = y;
    if (y > this.maxY) this.maxY = y;
  }

  /**
   * Exact bounds of a cubic bezier segment. The control points must
   * already be in global coordinates: affine transforms map beziers to
   * beziers, so transforming the control points first yields the
   * transformed curve.
   */
  addCubic(
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
  ): void {
    this.addPoint(p0[0], p0[1]);
    this.addPoint(p3[0], p3[1]);
    // x'(t) = 3[(1-t)^2*u + 2t(1-t)*v + t^2*w] with u = p1-p0 etc., so the
    // critical t values are the roots of (u - 2v + w)t^2 + 2(v - u)t + u.
    const extrema = (u: number, v: number, w: number) =>
      quadraticRootsInUnit(u - 2 * v + w, 2 * (v - u), u);
    for (const t of [
      ...extrema(p1[0] - p0[0], p2[0] - p1[0], p3[0] - p2[0]),
      ...extrema(p1[1] - p0[1], p2[1] - p1[1], p3[1] - p2[1]),
    ]) {
      this.addPoint(
        cubicAt(t, p0[0], p1[0], p2[0], p3[0]),
        cubicAt(t, p0[1], p1[1], p2[1], p3[1]),
      );
    }
  }

  /** Exact bounds of a quadratic bezier segment (see addCubic). */
  addQuadratic(
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
  ): void {
    this.addPoint(p0[0], p0[1]);
    this.addPoint(p2[0], p2[1]);
    // x'(t) = 2[(1-t)*u + t*v] with u = p1-p0, v = p2-p1, so the only
    // critical t value is the root of (p0 - 2p1 + p2)t + (p1 - p0) = 0.
    const extrema = (q0: number, q1: number, q2: number) =>
      quadraticRootsInUnit(q0 - 2 * q1 + q2, q1 - q0, 0);
    for (const t of [
      ...extrema(p0[0], p1[0], p2[0]),
      ...extrema(p0[1], p1[1], p2[1]),
    ]) {
      this.addPoint(
        quadraticAt(t, p0[0], p1[0], p2[0]),
        quadraticAt(t, p0[1], p1[1], p2[1]),
      );
    }
  }

  /**
   * Axis-aligned extents of a full ellipse obtained by mapping the
   * ellipse (center cx/cy, radii rx/ry, x-axis rotation phiDeg) through
   * the matrix. Only exact for full ellipses — use addArc for arc
   * segments.
   */
  addEllipse(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    phiDeg: number,
    m: Matrix,
  ): void {
    const [gx, gy] = applyMatrix(m, cx, cy);
    const phi = (phiDeg * Math.PI) / 180;
    const cos = Math.cos(phi);
    const sin = Math.sin(phi);
    // Linear part of the composed map from the unit circle to the
    // transformed ellipse: m.linear * rotate(phi) * scale(rx, ry). The
    // extents of B*(cos t, sin t) are sqrt(B11^2 + B12^2) per axis.
    const b11 = rx * (m.a * cos + m.c * sin);
    const b12 = ry * (m.c * cos - m.a * sin);
    const b21 = rx * (m.b * cos + m.d * sin);
    const b22 = ry * (m.d * cos - m.b * sin);
    const ex = Math.hypot(b11, b12);
    const ey = Math.hypot(b21, b22);
    this.addPoint(gx - ex, gy - ey);
    this.addPoint(gx + ex, gy + ey);
  }

  /**
   * Exact bounds of an elliptical arc segment (center parameterization:
   * center cx/cy, radii rx/ry, x-axis rotation phiDeg, start angle
   * theta1 and signed sweep delta in radians), mapped through the
   * matrix. The arc's x/y extrema sit at fixed angles of the transformed
   * ellipse; each contributes only when it lies within the swept angular
   * range. Endpoints must be added separately by the caller.
   */
  addArc(
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    phiDeg: number,
    theta1: number,
    delta: number,
    m: Matrix,
  ): void {
    const [gx, gy] = applyMatrix(m, cx, cy);
    const phi = (phiDeg * Math.PI) / 180;
    const cos = Math.cos(phi);
    const sin = Math.sin(phi);
    // Linear part of the composed map from the unit circle to the
    // transformed ellipse (see addEllipse).
    const b11 = rx * (m.a * cos + m.c * sin);
    const b12 = ry * (m.c * cos - m.a * sin);
    const b21 = rx * (m.b * cos + m.d * sin);
    const b22 = ry * (m.d * cos - m.b * sin);

    const twoPi = 2 * Math.PI;
    const inSpan = (theta: number): boolean => {
      if (delta > 0) {
        let t = (theta - theta1) % twoPi;
        if (t < 0) t += twoPi;
        return t <= delta;
      }
      let t = (theta - theta1) % twoPi;
      if (t > 0) t -= twoPi;
      return t >= delta;
    };

    // x'/y' of B*(cos t, sin t) are extremal at these angles (and their
    // opposites): x' max at atan2(B12, B11), y' max at atan2(B22, B21).
    const xAxis = Math.atan2(b12, b11);
    const yAxis = Math.atan2(b22, b21);
    for (const theta of [
      xAxis,
      xAxis + Math.PI,
      yAxis,
      yAxis + Math.PI,
    ]) {
      if (!inSpan(theta)) continue;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      this.addPoint(gx + b11 * cosT + b12 * sinT, gy + b21 * cosT + b22 * sinT);
    }
  }
}

/** Thrown when the geometry cannot be computed exactly. */
class Bail extends Error {}

const DRAWING_ELEMENTS = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
]);
const CONTAINER_ELEMENTS = new Set(["g"]);
/** Subtrees that never paint geometry themselves. */
const INERT_ELEMENTS = new Set([
  "defs",
  "title",
  "desc",
  "metadata",
  "linearGradient",
  "radialGradient",
  "pattern",
  "stop",
  "font",
  "font-face",
]);
/**
 * Attributes whose painting effects are not modeled. Everything else
 * unknown (text, use, image, style, filter, mask, nested svg, ...) makes
 * the walk bail via the element whitelist above.
 */
const BAIL_ATTRIBUTES = [
  "clip-path",
  "mask",
  "filter",
  "marker-start",
  "marker-mid",
  "marker-end",
];

/**
 * Endpoint -> center parameterization (W3C SVG spec, appendix F.6.5).
 * Returns the (corrected) radii, the center and the angular span
 * (theta1, signed delta in radians), or null for a degenerate arc (zero
 * radii or coincident endpoints render as a straight line).
 */
function arcCenter(
  x1: number,
  y1: number,
  rX: number,
  rY: number,
  xRot: number,
  largeArcFlag: number,
  sweepFlag: number,
  x2: number,
  y2: number,
): {
  cx: number;
  cy: number;
  rX: number;
  rY: number;
  theta1: number;
  delta: number;
} | null {
  if (x1 === x2 && y1 === y2) return null;
  rX = Math.abs(rX);
  rY = Math.abs(rY);
  if (rX === 0 || rY === 0) return null;
  const phi = (xRot * Math.PI) / 180;
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;
  // Scale the radii up if the endpoint pair cannot be reached otherwise.
  const lambda = (x1p * x1p) / (rX * rX) + (y1p * y1p) / (rY * rY);
  if (lambda > 1) {
    const scale = Math.sqrt(lambda);
    rX *= scale;
    rY *= scale;
  }
  const numerator = rX * rX * rY * rY - rX * rX * y1p * y1p - rY * rY * x1p * x1p;
  const denominator = rX * rX * y1p * y1p + rY * rY * x1p * x1p;
  const factor =
    Math.sqrt(Math.max(0, numerator / denominator)) *
    (largeArcFlag !== sweepFlag ? 1 : -1);
  const cxp = (factor * rX * y1p) / rY;
  const cyp = (-factor * rY * x1p) / rX;
  const cx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const cy = sin * cxp + cos * cyp + (y1 + y2) / 2;

  // Angular span: theta1 at the start point, delta signed so that
  // sweep=1 (positive angle direction) yields delta > 0 and sweep=0
  // yields delta < 0 (W3C SVG spec, appendix F.6.5).
  const theta1 = Math.atan2((y1p - cyp) / rY, (x1p - cxp) / rX);
  const theta2 = Math.atan2((-y1p - cyp) / rY, (-x1p - cxp) / rX);
  let delta = theta2 - theta1;
  if (sweepFlag === 1 && delta < 0) delta += 2 * Math.PI;
  if (sweepFlag === 0 && delta > 0) delta -= 2 * Math.PI;

  return { cx, cy, rX, rY, theta1, delta };
}

/** Accumulate the exact bounds of a path's geometry into `box`. */
function addPath(d: string, m: Matrix, box: BBox): void {
  let commands: SVGCommand[];
  try {
    commands = new SVGPathData(d).commands;
  } catch {
    throw new Bail();
  }

  let curX = 0;
  let curY = 0;
  let startX = 0;
  let startY = 0;
  // Last control point of the previous cubic/quadratic segment (for the
  // implicit reflection of S/T), or null after any other command.
  let prevCubic: [number, number] | null = null;
  let prevQuad: [number, number] | null = null;

  const pt = (x: number, y: number): [number, number] => applyMatrix(m, x, y);

  for (const cmd of commands) {
    const rel = "relative" in cmd ? cmd.relative : false;
    switch (cmd.type) {
      case SVGPathData.CLOSE_PATH:
        curX = startX;
        curY = startY;
        prevCubic = null;
        prevQuad = null;
        break;
      case SVGPathData.MOVE_TO: {
        const x = rel ? curX + cmd.x : cmd.x;
        const y = rel ? curY + cmd.y : cmd.y;
        curX = x;
        curY = y;
        startX = x;
        startY = y;
        prevCubic = null;
        prevQuad = null;
        box.addPoint(...pt(x, y));
        break;
      }
      case SVGPathData.LINE_TO: {
        const x = rel ? curX + cmd.x : cmd.x;
        const y = rel ? curY + cmd.y : cmd.y;
        curX = x;
        curY = y;
        prevCubic = null;
        prevQuad = null;
        box.addPoint(...pt(x, y));
        break;
      }
      case SVGPathData.HORIZ_LINE_TO: {
        const x = rel ? curX + cmd.x : cmd.x;
        curX = x;
        prevCubic = null;
        prevQuad = null;
        box.addPoint(...pt(x, curY));
        break;
      }
      case SVGPathData.VERT_LINE_TO: {
        const y = rel ? curY + cmd.y : cmd.y;
        curY = y;
        prevCubic = null;
        prevQuad = null;
        box.addPoint(...pt(curX, y));
        break;
      }
      case SVGPathData.CURVE_TO: {
        const x1 = rel ? curX + cmd.x1 : cmd.x1;
        const y1 = rel ? curY + cmd.y1 : cmd.y1;
        const x2 = rel ? curX + cmd.x2 : cmd.x2;
        const y2 = rel ? curY + cmd.y2 : cmd.y2;
        const x = rel ? curX + cmd.x : cmd.x;
        const y = rel ? curY + cmd.y : cmd.y;
        box.addCubic(pt(curX, curY), pt(x1, y1), pt(x2, y2), pt(x, y));
        curX = x;
        curY = y;
        prevCubic = [x2, y2];
        prevQuad = null;
        break;
      }
      case SVGPathData.SMOOTH_CURVE_TO: {
        const x2 = rel ? curX + cmd.x2 : cmd.x2;
        const y2 = rel ? curY + cmd.y2 : cmd.y2;
        const x = rel ? curX + cmd.x : cmd.x;
        const y = rel ? curY + cmd.y : cmd.y;
        const x1 = prevCubic ? 2 * curX - prevCubic[0] : curX;
        const y1 = prevCubic ? 2 * curY - prevCubic[1] : curY;
        box.addCubic(pt(curX, curY), pt(x1, y1), pt(x2, y2), pt(x, y));
        curX = x;
        curY = y;
        prevCubic = [x2, y2];
        prevQuad = null;
        break;
      }
      case SVGPathData.QUAD_TO: {
        const x1 = rel ? curX + cmd.x1 : cmd.x1;
        const y1 = rel ? curY + cmd.y1 : cmd.y1;
        const x = rel ? curX + cmd.x : cmd.x;
        const y = rel ? curY + cmd.y : cmd.y;
        box.addQuadratic(pt(curX, curY), pt(x1, y1), pt(x, y));
        curX = x;
        curY = y;
        prevQuad = [x1, y1];
        prevCubic = null;
        break;
      }
      case SVGPathData.SMOOTH_QUAD_TO: {
        const x = rel ? curX + cmd.x : cmd.x;
        const y = rel ? curY + cmd.y : cmd.y;
        const x1: number = prevQuad ? 2 * curX - prevQuad[0] : curX;
        const y1: number = prevQuad ? 2 * curY - prevQuad[1] : curY;
        box.addQuadratic(pt(curX, curY), pt(x1, y1), pt(x, y));
        curX = x;
        curY = y;
        prevQuad = [x1, y1];
        prevCubic = null;
        break;
      }
      case SVGPathData.ARC: {
        const x = rel ? curX + cmd.x : cmd.x;
        const y = rel ? curY + cmd.y : cmd.y;
        box.addPoint(...pt(curX, curY));
        box.addPoint(...pt(x, y));
        const center = arcCenter(
          curX,
          curY,
          cmd.rX,
          cmd.rY,
          cmd.xRot,
          cmd.lArcFlag,
          cmd.sweepFlag,
          x,
          y,
        );
        if (center) {
          box.addArc(
            center.cx,
            center.cy,
            center.rX,
            center.rY,
            cmd.xRot,
            center.theta1,
            center.delta,
            m,
          );
        }
        curX = x;
        curY = y;
        prevCubic = null;
        prevQuad = null;
        break;
      }
      default:
        throw new Bail();
    }
  }
}

/** Accumulate the bounds of a single drawing element. */
function addElement(node: any, m: Matrix, box: BBox): void {
  const attrs: Record<string, string> = node.attributes ?? {};
  const num = (value: string | undefined): number | null => {
    if (value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  switch (node.name) {
    case "path":
      if (typeof attrs.d !== "string") return;
      addPath(attrs.d, m, box);
      return;
    case "rect": {
      const x = num(attrs.x) ?? 0;
      const y = num(attrs.y) ?? 0;
      const w = num(attrs.width);
      const h = num(attrs.height);
      // Zero/negative sizes are not rendered (negative values are an
      // error per the spec). Rounded corners stay within the box.
      if (w === null || h === null || w <= 0 || h <= 0) return;
      for (const [px, py] of [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ]) {
        box.addPoint(...applyMatrix(m, px, py));
      }
      return;
    }
    case "circle": {
      const cx = num(attrs.cx) ?? 0;
      const cy = num(attrs.cy) ?? 0;
      const r = num(attrs.r);
      if (r === null || r <= 0) return;
      box.addEllipse(cx, cy, r, r, 0, m);
      return;
    }
    case "ellipse": {
      const cx = num(attrs.cx) ?? 0;
      const cy = num(attrs.cy) ?? 0;
      const rx = num(attrs.rx);
      const ry = num(attrs.ry);
      if (rx === null || ry === null || rx <= 0 || ry <= 0) return;
      box.addEllipse(cx, cy, rx, ry, 0, m);
      return;
    }
    case "line": {
      const x1 = num(attrs.x1) ?? 0;
      const y1 = num(attrs.y1) ?? 0;
      const x2 = num(attrs.x2) ?? 0;
      const y2 = num(attrs.y2) ?? 0;
      box.addPoint(...applyMatrix(m, x1, y1));
      box.addPoint(...applyMatrix(m, x2, y2));
      return;
    }
    case "polygon":
    case "polyline": {
      const coords = (attrs.points ?? "").match(
        /[+-]?(\d*\.\d+|\d+\.?)([eE][+-]?\d+)?/g,
      );
      if (!coords) return;
      for (let i = 0; i + 1 < coords.length; i += 2) {
        box.addPoint(...applyMatrix(m, Number(coords[i]), Number(coords[i + 1])));
      }
      return;
    }
  }
}

/**
 * Compute the bounding box of all painted geometry below the root
 * <svg> element. Returns null when nothing paints or throws Bail when
 * the geometry cannot be determined exactly.
 */
function computeArtworkBBox(svgElement: any): BBox | null {
  const box = new BBox();

  const walk = (
    node: any,
    m: Matrix,
    inheritedFill: string,
    inheritedFillOpacity: string,
  ): void => {
    if (node.type !== "element") return;
    const attrs: Record<string, string> = node.attributes ?? {};

    // Subtrees that never paint geometry themselves.
    if (INERT_ELEMENTS.has(node.name)) return;
    // Whitelist: anything else (text, use, image, style, filter, nested
    // svg, editor junk, ...) cannot be measured exactly.
    if (!DRAWING_ELEMENTS.has(node.name) && !CONTAINER_ELEMENTS.has(node.name)) {
      throw new Bail();
    }
    // Hidden subtrees do not render.
    if (
      attrs.display === "none" ||
      attrs.visibility === "hidden" ||
      attrs.opacity === "0"
    ) {
      return;
    }
    // Painting effects that extend or clip beyond the geometry.
    for (const attr of BAIL_ATTRIBUTES) {
      const value = attrs[attr];
      if (value !== undefined && value !== "" && value !== "none") {
        throw new Bail();
      }
    }
    if (attrs.stroke !== undefined && attrs.stroke !== "none") {
      throw new Bail();
    }

    let childMatrix = m;
    if (attrs.transform !== undefined) {
      const t = parseTransform(attrs.transform);
      if (t === null) throw new Bail();
      // The element's own transform applies to its local coordinates
      // first, then the accumulated ancestor transform.
      childMatrix = multiply(t, m);
    }

    const fill = attrs.fill ?? inheritedFill;
    const fillOpacity = attrs["fill-opacity"] ?? inheritedFillOpacity;
    const paints = fill !== "none" && fillOpacity !== "0";

    if (paints && DRAWING_ELEMENTS.has(node.name)) {
      addElement(node, childMatrix, box);
    }

    for (const child of node.children ?? []) {
      walk(child, childMatrix, fill, fillOpacity);
    }
  };

  // The svg default fill is black, so the inherited fill starts unset.
  for (const child of svgElement.children ?? []) {
    walk(child, IDENTITY, "", "");
  }
  return box.valid ? box : null;
}

function parseViewBox(value: string): [number, number, number, number] | null {
  const parts = value.trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [minX, minY, width, height] = parts;
  if (!(width > 0) || !(height > 0)) return null;
  return [minX, minY, width, height];
}

/**
 * svgo plugin: crop the viewBox to the artwork's bounding box.
 *
 * optimize.ts swaps this in for the `{ name: "autocrop-geometric" }`
 * marker in packages/assets/svgo.config.js, keeping the plugin order
 * declared there.
 */
export const autocropGeometricPlugin = {
  name: "autocrop-geometric",
  type: "visitor" as const,
  fn: (root: any) => {
    const svgElement = (root.children ?? []).find(
      (child: any) => child.type === "element" && child.name === "svg",
    );
    if (!svgElement) return null;
    const viewBoxAttr = svgElement.attributes?.viewBox;
    if (typeof viewBoxAttr !== "string") return null;
    const viewBox = parseViewBox(viewBoxAttr);
    if (viewBox === null) return null;

    let box: BBox | null;
    try {
      box = computeArtworkBBox(svgElement);
    } catch (error) {
      if (error instanceof Bail) return null;
      throw error;
    }
    if (box === null) return null;

    // The svg root clips overflow: artwork outside the authored viewBox
    // is never rendered, so crop only within it.
    const xMin = Math.max(box.minX, viewBox[0]);
    const yMin = Math.max(box.minY, viewBox[1]);
    const xMax = Math.min(box.maxX, viewBox[0] + viewBox[2]);
    const yMax = Math.min(box.maxY, viewBox[1] + viewBox[3]);
    if (!(xMax > xMin) || !(yMax > yMin)) return null;

    // Snap outward to integers (the same granularity the pixel-based
    // svgo-autocrop cropped at), tolerating floating point noise from
    // transform math (e.g. cos(90°) = 6.1e-17 must not round an exact
    // boundary to a whole extra unit).
    const EPSILON = 1e-9;
    const x = Math.floor(xMin + EPSILON);
    const y = Math.floor(yMin + EPSILON);
    const width = Math.ceil(xMax - EPSILON) - x;
    const height = Math.ceil(yMax - EPSILON) - y;
    if (!(width > 0) || !(height > 0)) return null;
    const cropped = `${x} ${y} ${width} ${height}`;
    if (cropped === viewBoxAttr.trim()) return null;

    svgElement.attributes.viewBox = cropped;
    // Fixed sizes would fight the new viewBox. removeDimensions should
    // already have removed them (this mirrors svgo-autocrop's
    // includeWidthAndHeightAttributes: false).
    delete svgElement.attributes.width;
    delete svgElement.attributes.height;
    return null;
  },
};
