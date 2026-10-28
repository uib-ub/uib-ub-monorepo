import { describe, expect, it } from "vitest";
import { toCurrentColor } from "./current-color.js";

const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${body}</svg>`;

describe("toCurrentColor", () => {
  it("replaces a single explicit fill color", () => {
    const result = toCurrentColor(
      wrap('<path fill="#231f20" d="M0 0h10v10H0z"/>'),
    );
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.data).toContain('fill="currentColor"');
    expect(result.data).not.toContain("#231f20");
  });

  it("covers implicit black fills with a root fill", () => {
    // uib-ub positive style: paths with no fill attribute (default black)
    // plus a fill="none" background rect
    const result = toCurrentColor(
      wrap('<path fill="none" d="M0 0h10v10H0z"/><path d="M1 1h8v8H1z"/>'),
    );
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.data).toContain('fill="none"');
    expect(result.data).toMatch(/<svg[^>]*fill="currentColor"/);
  });

  it("keeps fill=none and replaces inherited group fills", () => {
    const result = toCurrentColor(
      wrap(
        '<g fill="#ffffff"><path d="M1 1h8v8H1z"/></g><path fill="none" d="M0 0h1v1H0z"/>',
      ),
    );
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.data).toContain('fill="currentColor"');
    expect(result.data).toContain('fill="none"');
    expect(result.data).not.toContain("#ffffff");
  });

  it("treats different spellings of the same color as monochrome", () => {
    const result = toCurrentColor(
      wrap(
        '<path fill="#000" d="M0 0h5v10H0z"/><path fill="black" d="M5 0h5v10H5z"/>',
      ),
    );
    expect("error" in result).toBe(false);
  });

  it("fails when the svg has more than one color", () => {
    const result = toCurrentColor(
      wrap(
        '<path fill="#003146" d="M0 0h5v10H0z"/><path fill="#00b6c9" d="M5 0h5v10H5z"/>',
      ),
    );
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("not monochrome");
    expect(result.error).toContain("#003146");
  });

  it("fails on gradient (paint server) fills", () => {
    const result = toCurrentColor(
      wrap('<path fill="url(#grad)" d="M0 0h10v10H0z"/>'),
    );
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("paint server");
  });

  it("fails when there are no fill colors at all", () => {
    const result = toCurrentColor(
      wrap('<path fill="none" d="M0 0h10v10H0z"/>'),
    );
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.error).toContain("no fill colors");
  });
});
