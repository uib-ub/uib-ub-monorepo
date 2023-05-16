import defaultTheme from 'tailwindcss/defaultTheme'
export default {
  theme: {
    fontFamily: {
        sans: ['Noto Sans', 'sans-serif'],
        serif: ['Inria Serif', 'serif'],
        },
    borderRadius: {
        none: "2rem",
        DEFAULT: '2rem',
      },
    colors:{
        primary: {
        DEFAULT: "#560027",
        lighten: "#711f3d",
        lighten2: '#8c3854',
        darken: "#3c0012"
        },
        secondary: {
        DEFAULT: "#BC477B",
        lighten: "#d96295",
        darken: "#9f2b62",
        darken2: "#83034a"
        },
        tertiary: {
        DEFAULT: "#FDF4F5",
        darken1: "#e0d8d9",
        darken2: "#c4bcbd",
        darken3: "#a9a1a2"
        },
        text: {
        DEFAULT: "black",
        lighten: "#2D2D2D"
        },
        canvas:  {
        DEFAULT: "white",
        darken: "#F1F1F1"
        },
        black: "black",
        
        white: "white",
        anchor: "#880E4F",
        gray: {
        DEFAULT: '#757070',
        '50': '#B9B6B6',
        '100': '#B2AEAE',
        '200': '#A39F9F',
        '300': '#948F8F',
        '400': '#858080',
        '500': '#757070',
        '600': '#656161',
        '700': '#565252',
        '800': '#464343',
        '900': '#373434'
        }
    }
}
  
}
