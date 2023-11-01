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
          100: "#e2efff", // rgb(226, 239, 255)
          200: "#69b9fe", // rgb(105, 185, 254)
          300: "#008aff", // rgb(0, 138, 255)
          400: "#14417b", // rgb(20, 65, 123)
        },
      },
      boxShadow: {
        tphalo: "0px 0px 1px 0.18rem rgb(105, 185, 254, 0.5)", // #69b9fe
      },
    },
  },
  plugins: [],
};
