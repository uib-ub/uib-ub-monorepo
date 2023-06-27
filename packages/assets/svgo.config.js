const autocrop = require('svgo-autocrop');

module.exports = {
  plugins: [
    "convertStyleToAttrs",
    "inlineStyles",
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
    { // Run autocrop last (you'll get less issues if autocrop runs after the svgo's default 'convertTransform' and 'convertShapeToPath' plugins)
      ...autocrop,
      params: {
        autocrop: true,
        includeWidthAndHeightAttributes: false, // Same as enabling 'removeDimensions' plugin (and disabling 'removeViewBox' plugin).

        //removeClass: true, // Remove 'class' attribute if encountered.
        //removeStyle: true, // Remove 'style'/'font-family' attribute if encountered.
        removeDeprecated: true, // Remove deprecated attributes - like <svg version/baseProfile>/etc.

        //setColor: 'currentColor', // Replace any colors encountered with 'currentColor'.
        //setColorIssue: 'fail' // Fail if more than one color encountered.
      }
    },
  ],
};