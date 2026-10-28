import { describe, expect, it } from "vitest";
import { optimize } from "svgo";
import { autocropGeometricPlugin } from "./autocrop.js";

const svg = (body: string, viewBox = "-1000 -1000 2000 2000") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${body}</svg>`;

/** Optimize with only the autocrop plugin and return the resulting viewBox. */
const crop = (input: string): string => {
  const result = optimize(input, { plugins: [autocropGeometricPlugin] });
  expect("error" in result && result.error).toBeFalsy();
  return result.data.match(/viewBox="([^"]*)"/)?.[1] ?? "";
};

describe("autocropGeometricPlugin", () => {
  it("crops transparent padding around a rect", () => {
    expect(crop(svg('<rect x="10" y="20" width="30" height="40"/>'))).toBe(
      "10 20 30 40",
    );
  });

  it("keeps the viewBox offset instead of translating coordinates", () => {
    const result = optimize(
      svg('<rect x="10" y="20" width="30" height="40"/>'),
      { plugins: [autocropGeometricPlugin] },
    );
    // Geometry must be untouched — only the viewBox changes.
    expect(result.data).toContain('x="10"');
    expect(result.data).toContain('width="30"');
    expect(result.data).toMatch(/viewBox="10 20 30 40"/);
  });

  it("computes exact cubic curve extrema", () => {
    // y(t) = -300t(1-t): bulges to y = -75 at t = 0.5, beyond both endpoints.
    expect(crop(svg('<path d="M0 0 C 25 -100 75 -100 100 0"/>'))).toBe(
      "0 -75 100 75",
    );
  });

  it("computes exact quadratic curve extrema", () => {
    // y(t) = -200t(1-t): bulges to y = -50 at t = 0.5.
    expect(crop(svg('<path d="M0 0 Q 50 -100 100 0"/>'))).toBe("0 -50 100 50");
  });

  it("reflects the control point for S commands", () => {
    // First cubic dips to y = -15; the S command reflects (20,-20) about
    // (20,0) to (20,20), so the second cubic rises to y = +15.
    expect(
      crop(svg('<path d="M0 0 C 0 -20 20 -20 20 0 S 40 20 40 0"/>')),
    ).toBe("0 -15 40 30");
  });

  it("reflects the control point for T commands", () => {
    // First quadratic dips to y = -10; T reflects (0,-20) about (20,0)
    // to (40,20), so the second rises to y = +10.
    expect(crop(svg('<path d="M0 0 Q 0 -20 20 0 T 40 0"/>'))).toBe(
      "0 -10 40 20",
    );
  });

  it("handles arcs (full circle from two arc segments)", () => {
    expect(
      crop(svg('<path d="M 50 0 A 50 50 0 0 1 50 100 A 50 50 0 0 1 50 0"/>')),
    ).toBe("0 0 100 100");
  });

  it("computes exact bounds for a half-circle arc (sweep 1)", () => {
    // Half circle from (0,0) to (20,0) bulging up (negative y): the arc
    // spans y -10..0, not the full -10..10 of the ellipse.
    expect(crop(svg('<path d="M 0 0 A 10 10 0 0 1 20 0"/>'))).toBe(
      "0 -10 20 10",
    );
  });

  it("computes exact bounds for a half-circle arc (sweep 0)", () => {
    // Same arc, opposite sweep: bulges down (positive y).
    expect(crop(svg('<path d="M 0 0 A 10 10 0 0 0 20 0"/>'))).toBe(
      "0 0 20 10",
    );
  });

  it("computes exact bounds for a quarter-circle arc", () => {
    // Quarter circle from (10,0) to (20,10) around center (10,10): the
    // full-ellipse extents would wrongly claim x 0..20, y 0..20.
    expect(crop(svg('<path d="M 10 0 A 10 10 0 0 1 20 10"/>'))).toBe(
      "10 0 10 10",
    );
  });

  it("computes exact bounds for a large-arc segment", () => {
    // Large (270 degree) arc from (10,0) to (20,10) around center (20,0),
    // sweeping through (20,-10) and (30,0): bbox (10,-10)-(30,10).
    expect(crop(svg('<path d="M 10 0 A 10 10 0 1 1 20 10"/>'))).toBe(
      "10 -10 20 20",
    );
  });

  it("handles arc segments under a transform", () => {
    // Quarter circle (see above) scaled by 2 and translated by (5,5):
    // local bbox (10,0)-(20,10) maps to (25,5)-(45,25).
    expect(
      crop(
        svg(
          '<g transform="translate(5,5) scale(2)"><path d="M 10 0 A 10 10 0 0 1 20 10"/></g>',
        ),
      ),
    ).toBe("25 5 20 20");
  });

  it("handles circle elements", () => {
    expect(crop(svg('<circle cx="30" cy="40" r="10"/>'))).toBe("20 30 20 20");
  });

  it("handles ellipse elements", () => {
    expect(crop(svg('<ellipse cx="30" cy="40" rx="10" ry="5"/>'))).toBe(
      "20 35 20 10",
    );
  });

  it("handles polyline elements", () => {
    expect(crop(svg('<polyline points="10,10 30,20"/>'))).toBe("10 10 20 10");
  });

  it("handles relative path commands", () => {
    expect(crop(svg('<path d="m10 10 h20 v20 h-20 z"/>'))).toBe("10 10 20 20");
  });

  it("composes nested transforms", () => {
    // Local rect 0..10 x 0..5, scaled by 2 and translated by (10,20).
    expect(
      crop(
        svg(
          '<g transform="translate(10,20) scale(2)"><rect x="0" y="0" width="10" height="5"/></g>',
        ),
      ),
    ).toBe("10 20 20 10");
  });

  it("handles rotate transforms", () => {
    // rotate(90): (x, y) -> (-y, x). Rect corners end up in x -2..0, y 10..15.
    expect(
      crop(
        svg(
          '<g transform="rotate(90)"><rect x="10" y="0" width="5" height="2"/></g>',
        ),
      ),
    ).toBe("-2 10 2 5");
  });

  it("handles rotate transforms with a center", () => {
    // rotate(90, 5, 5): (x, y) -> (10 - y, x). Corners land in x 8..10, y 0..10.
    expect(
      crop(
        svg(
          '<g transform="rotate(90 5 5)"><rect x="0" y="0" width="10" height="2"/></g>',
        ),
      ),
    ).toBe("8 0 2 10");
  });

  it("handles matrix transforms (inkscape pdf export style)", () => {
    // The hvl logos use matrix(1.3333333,0,0,-1.3333333,0,434.64533).
    expect(
      crop(
        svg(
          '<g transform="matrix(1.3333333,0,0,-1.3333333,0,434.64533)"><rect x="0" y="0" width="100" height="50"/></g>',
        ),
      ),
    ).toBe("0 367 134 68");
  });

  it("snaps fractional bounds outward to integers", () => {
    expect(crop(svg('<rect x="10.5" y="10.5" width="20" height="20"/>'))).toBe(
      "10 10 21 21",
    );
  });

  it("skips display=none subtrees", () => {
    expect(
      crop(
        svg(
          '<rect display="none" x="-500" y="-500" width="20" height="20"/><rect x="10" y="10" width="20" height="20"/>',
        ),
      ),
    ).toBe("10 10 20 20");
  });

  it("skips fill=none geometry but keeps walking children", () => {
    expect(
      crop(
        svg(
          '<g fill="none"><rect x="-500" y="-500" width="20" height="20"/><rect fill="black" x="10" y="10" width="20" height="20"/></g>',
        ),
      ),
    ).toBe("10 10 20 20");
  });

  it("skips defs and gradients", () => {
    expect(
      crop(
        svg(
          '<defs><linearGradient id="g"><stop offset="0"/></linearGradient></defs><rect x="10" y="10" width="20" height="20"/>',
        ),
      ),
    ).toBe("10 10 20 20");
  });

  it("never grows beyond the authored viewBox", () => {
    // Artwork overflows the viewBox; the svg root clips it, so the
    // viewBox must keep its edge.
    expect(
      crop(
        svg('<rect x="0" y="0" width="100" height="100"/>', "0 0 50 50"),
      ),
    ).toBe("0 0 50 50");
  });

  it("leaves the svg untouched when nothing can be cropped", () => {
    expect(
      crop(svg('<rect x="0" y="0" width="100" height="100"/>', "0 0 100 100")),
    ).toBe("0 0 100 100");
  });

  it("bails on text elements", () => {
    expect(crop(svg("<text>x</text>"))).toBe("-1000 -1000 2000 2000");
  });

  it("bails on use elements", () => {
    expect(crop(svg('<use href="#x"/>'))).toBe("-1000 -1000 2000 2000");
  });

  it("bails on clip-path attributes", () => {
    expect(
      crop(svg('<rect clip-path="url(#c)" x="10" y="10" width="20" height="20"/>')),
    ).toBe("-1000 -1000 2000 2000");
  });

  it("bails on strokes", () => {
    expect(
      crop(
        svg('<rect stroke="black" stroke-width="2" x="10" y="10" width="20" height="20"/>'),
      ),
    ).toBe("-1000 -1000 2000 2000");
  });

  it("bails on remaining style blocks", () => {
    expect(
      crop(svg("<style>rect{fill:red}</style><rect x='10' y='10' width='20' height='20'/>")),
    ).toBe("-1000 -1000 2000 2000");
  });

  it("bails on unparseable transforms", () => {
    expect(
      crop(
        svg(
          '<g transform="nonsense(1)"><rect x="10" y="10" width="20" height="20"/></g>',
        ),
      ),
    ).toBe("-1000 -1000 2000 2000");
  });

  it("bails on unparseable path data", () => {
    expect(crop(svg('<path d="M0 0 x10"/>'))).toBe("-1000 -1000 2000 2000");
  });
});
