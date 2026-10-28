module.exports = {
  plugins: [
    {
      name: "inlineStyles",
      params: {
        // Also inline selectors used by more than one element (e.g. .st1 on
        // all paths of a negative logo), so no <style> blocks remain.
        onlyMatchedOnce: false,
      },
    },
    // Run after inlineStyles so inlined styles become proper attributes
    "convertStyleToAttrs",
    "removeDimensions",
    {
      name: "prefixIds",
      delim: "--",
    },
    "removeViewBox",
    {
      name: "removeUselessStrokeAndFill",
      params: {
        removeNone: true,
      },
    },
    // Clean up shapes, transforms and coordinate precision before autocrop
    "convertShapeToPath",
    "convertTransform",
    "convertPathData",
    "removeComments",
    "removeMetadata",
    // Crop the viewBox to the artwork's bounding box. This is a marker:
    // optimize.ts swaps it for the geometric autocrop plugin implemented
    // in packages/cli/src/assets/autocrop.ts (it needs the cli's
    // dependencies, which this config cannot require). It replaced the
    // svgo-autocrop package, which measured rendered pixels in headless
    // Chrome and silently cropped any logo wider than the browser's
    // default 800px viewport.
    { name: "autocrop-geometric" },
  ],
};
