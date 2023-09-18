window.MathJax = {
  options: {
    menuOptions: {
      settings: {
        assistiveMml: true, // true to enable assitive MathML
        collapsible: false, // true to enable collapsible math
        explorer: true, // true to enable the expression explorer
      },
    },
    enableExplorer: true, // set to false to disable the explorer

    a11y: {
      speech: true, // switch on speech output
      braille: false, // switch on Braille output
      subtitles: true, // show speech as a subtitle
      viewBraille: false, // display Braille output as subtitles

      backgroundColor: "Blue", // color for background of selected sub-expression
      backgroundOpacity: 12, // opacity for background of selected sub-expression
      foregroundColor: "Black", // color to use for text of selected sub-expression
      //      foregroundOpacity: 100, // opacity for text of selected sub-expression

      //  highlight: "Flame", // type of highlighting for collapsible sub-expressions
      //       flame: true, // color collapsible sub-expressions
      //    hover: false, // show collapsible sub-expression on mouse hovering

      //    treeColoring: true, // tree color expression

      magnification: "Keyboard", // type of magnification
      magnify: "400%", // percentage of magnification of zoomed expressions
      keyMagnifier: true, // switch on magnification via key exploration
      mouseMagnifier: false, // switch on magnification via mouse hovering
      align: "top", // placement of magnified expression

      //    infoType: false, // show semantic type on mouse hovering
      //    infoRole: false, // show semantic role on mouse hovering
      //    infoPrefix: false, // show speech prefixes on mouse hovering
    },
  },
};
