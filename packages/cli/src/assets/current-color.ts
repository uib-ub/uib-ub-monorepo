import { optimize } from "svgo";

/**
 * Elements that paint geometry or text and therefore have an effective
 * fill color. Containers like <g> only matter for fill inheritance.
 */
const DRAWING_ELEMENTS = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "use",
]);

export type CurrentColorResult = { data: string } | { error: string };

/**
 * Normalize a fill value for comparison: lowercase, expand 3-digit hex,
 * map the `black` keyword. Only needs to unify spellings of the same color,
 * not approximate different colors.
 */
function normalizeColor(value: string): string {
  const v = value.toLowerCase();
  if (v === "black") return "#000000";
  if (/^#[0-9a-f]{3}$/.test(v)) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  }
  return v;
}

/**
 * Convert a monochrome svg to `currentColor`, so the logo follows the CSS
 * `color` of its surroundings instead of shipping pos/neg color variants.
 *
 * Every effective fill color of a drawing element must be the same single
 * color (`fill="none"` is ignored). On success that color is replaced with
 * `currentColor`; elements relying on the implicit default (black) are
 * covered by a `fill="currentColor"` on the root <svg>. Anything else
 * (multiple colors, paint servers) returns an error so the caller can skip
 * the asset with a clear reason.
 */
export function toCurrentColor(svg: string): CurrentColorResult {
  let error: string | undefined;
  // Assigned to a variable first (like createStripJunkPlugin in convert.ts):
  // svgo's CustomPlugin type does not declare `type`, and an inline object
  // literal would fail excess property checking.
  const plugin = {
    name: "setCurrentColor",
    type: "visitor" as const,
    fn: (root: any) => {
      const colors = new Set<string>();
      let usesDefaultFill = false;

      // Collect the effective fill of every drawing element, tracking
      // inheritance. `root` is the document root (type "root"), its
      // child is the <svg> element.
      const walk = (node: any, inheritedFill: string | undefined): void => {
        if (node.type === "root") {
          for (const child of node.children ?? []) {
            walk(child, inheritedFill);
          }
          return;
        }
        if (node.type !== "element") return;
        const ownFill: string | undefined = node.attributes?.fill;
        const fill = ownFill ?? inheritedFill;
        if (DRAWING_ELEMENTS.has(node.name)) {
          if (fill === undefined) {
            // No fill anywhere in the ancestor chain: SVG default is black
            usesDefaultFill = true;
            colors.add("#000000");
          } else if (fill.startsWith("url(")) {
            if (!error) {
              error = "paint server fill (gradient/pattern) — not monochrome";
            }
          } else if (fill !== "none") {
            colors.add(normalizeColor(fill));
          }
        }
        for (const child of node.children ?? []) {
          walk(child, fill);
        }
      };
      walk(root, undefined);

      if (!error && colors.size === 0) {
        error = "no fill colors found";
      }
      if (!error && colors.size > 1) {
        error = `not monochrome (found ${[...colors].join(", ")})`;
      }
      if (error) return null;

      // Replace every explicit non-none fill with currentColor, and set
      // fill on the root <svg> so elements relying on the implicit
      // default inherit it.
      const mutate = (node: any): void => {
        if (node.type === "root") {
          for (const child of node.children ?? []) mutate(child);
          return;
        }
        if (node.type !== "element") return;
        const fill: string | undefined = node.attributes?.fill;
        if (fill !== undefined && fill !== "none") {
          node.attributes.fill = "currentColor";
        }
        for (const child of node.children ?? []) mutate(child);
      };
      mutate(root);
      if (usesDefaultFill) {
        const svgElement = (root.children ?? []).find(
          (child: any) => child.type === "element" && child.name === "svg",
        );
        if (svgElement) svgElement.attributes.fill = "currentColor";
      }
      return null;
    },
  };
  const result = optimize(svg, { plugins: [plugin] });
  if (error) return { error };
  if ("error" in result && result.error) {
    return { error: String(result.error) };
  }
  return { data: result.data };
}
