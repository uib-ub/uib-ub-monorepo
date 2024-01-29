import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        garamond: ["EB Garamond"]

      },
      colors: {
       primary: {
        50: '#fdf3f3',
        100: '#fce4e4',
        200: '#facfce',
        300: '#f5adac',
        400: '#ed7e7c',
        500: '#e15452',
        600: '#cf3c3a',
        700: '#ad2a28',
        800: '#8f2625',
        900: '#772625',
        950: '#40100f',
      },
      slate: {
        50: '#f6f5f4',
        100: '#eae6e1',
        200: '#d7d3d1',
        300: '#bcb7b3',
        400: '#a39a95',
        500: '#8e8580',
        600: '#827773',
        700: '#6c6360',
        800: '#5a5553',
        900: '#494646',
        950: '#282524',
    },
    },
      backgroundImage: {
        "gradient-radial": "radial-gradient(circle, rose-500, rose-900)",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, rose-500, rose-900)",
      },
    },
  },
  plugins: [],
};
export default config;
