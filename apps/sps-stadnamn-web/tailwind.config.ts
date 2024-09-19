import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/config/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "font-phonetic"
  ],
  theme: {
    extend: {
      fontFamily: {
        garamond: ["EB Garamond"],
        phonetic: ["PhoneticFont"],

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
      accent: {
        50: '#eff8ff',
        100: '#def0ff',
        200: '#b6e2ff',
        300: '#75cdff',
        400: '#2cb5ff',
        500: '#009ffe',
        600: '#007bd4',
        700: '#0061ab',
        800: '#00528d',
        900: '#064574',
        950: '#042b4d',
    },
      neutral: {
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
    },
  },
  plugins: [],
};
export default config;
