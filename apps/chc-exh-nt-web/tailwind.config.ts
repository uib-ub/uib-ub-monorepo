import typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/app/**/*.{ts,tsx,js,jsx}",
		"./src/sanity/**/*.{ts,tsx,js,jsx}"
	],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'var(--font-merriweathersans)'
				],
				serif: [
					'var(--font-newsreader)'
				]
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			gridTemplateColumns: {
				'content': 'minmax(1.2rem, 1fr) 1em minmax(auto, 65ch) 1em minmax(1.2rem, 1fr)',
				'content-sm': 'minmax(1.2rem, 1fr) 1em minmax(42ch, 65ch) 1em minmax(1.2rem, 1fr)',
			},
		}
	},
	future: {
		hoverOnlyWhenSupported: true,
	},
	plugins: [typography, require("tailwindcss-animate")],
} satisfies Config;
