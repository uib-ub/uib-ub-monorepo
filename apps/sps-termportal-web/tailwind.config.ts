import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default <Partial<Config>>{
  theme: {
    screens: {
      xs: "475px",
      ...defaultTheme.screens,
    },
    extend: {
      flexBasis: { GRb: "61.8%", GRs: "38.2%" },
      colors: {
        tpblue: {
          100: "#e2efff",
          200: "#69b9fe",
          300: "#008aff",
          400: "#14417b",
        },
      },
    },
  },

  plugins: [],
};
