const colors = require("tailwindcss/colors");
const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} \*/
module.exports = {
  content: [
    // app content
    `src/**/*.{js,ts,jsx,tsx}`,
    `pages/**/*.{js,ts,jsx,tsx}`,
    `app/**/*.{js,ts,jsx,tsx}`,
    // include packages if not transpiling
    "../../packages/**/!(node_modules)/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        //sans: ['Merriweather Sans', 'sans-serif']
        sans: ['var(--font-merriweathersans)', ...fontFamily.sans],
        serif: ['var(--font-newsreader)', ...fontFamily.sans],
      },
      colors: {
        brandblue: colors.blue[500],
        brandred: colors.red[500],
        transparent: 'transparent',
        current: 'currentColor',
        black: '#000',
        white: '#fff',
        gray: colors.gray,
        slate: colors.slate,
        neutral: colors.neutral,
        red: colors.red,
        orange: colors.orange,
        blue: colors.blue,
        yellow: colors.yellow,
        green: colors.green,
      },
      gridTemplateColumns: {
        'content': 'minmax(1.2rem, 1fr) 1em minmax(auto, 65ch) 1em minmax(1.2rem, 1fr)',
        'content-sm': 'minmax(1.2rem, 1fr) 1em minmax(42ch, 65ch) 1em minmax(1.2rem, 1fr)',
        '7': 'repeat(7, minmax(0, 1fr))',
        '8': 'repeat(8, minmax(0, 1fr))',
        '9': 'repeat(9, minmax(0, 1fr))',
        '10': 'repeat(10, minmax(0, 1fr))',
        '11': 'repeat(11, minmax(0, 1fr))',
        '12': 'repeat(12, minmax(0, 1fr))',
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '7': 'repeat(7, minmax(0, 1fr))',
        '8': 'repeat(8, minmax(0, 1fr))',
        '9': 'repeat(9, minmax(0, 1fr))',
        '10': 'repeat(10, minmax(0, 1fr))',
        '11': 'repeat(11, minmax(0, 1fr))',
        '12': 'repeat(12, minmax(0, 1fr))',
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      gridRow: {
        'span-7': 'span 7 / span 7',
        'span-8': 'span 8 / span 8',
        'span-9': 'span 9 / span 9',
        'span-10': 'span 10 / span 10',
        'span-11': 'span 11 / span 11',
        'span-12': 'span 12 / span 12',
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
      }
    },
  },
  plugins: [
    require('@headlessui/tailwindcss')
  ],
};
