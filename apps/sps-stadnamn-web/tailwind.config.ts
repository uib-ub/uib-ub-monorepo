import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
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
