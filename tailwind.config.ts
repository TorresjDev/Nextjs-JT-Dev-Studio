import { heroui } from "@heroui/theme";
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,md,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,md,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,md,mdx}",
		"./node_modules/@heroui/theme/dist/components/(button|navbar|ripple|spinner).js",
	],
	theme: {
		extend: {
			animation: {
				flareSpark: "flare-spark 2.5s ease forwards",
			},
			colors: {
				background: "var(--background)",
				foreground: "var(--foreground)",
				sidebar: {
					DEFAULT: "hsl(var(--sidebar-background))",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground": "hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground": "hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
			},
			keyframes: {
				"flare-spark": {
					"0%": { opacity: "0", transform: "scale(0.8)" },
					"77%": { opacity: "0", transform: "scale(0.8)" },
					"82%": { opacity: "1", transform: "scale(1.1)" },
					"88%": { opacity: "0.8", transform: "scale(1.1)" },
					"93%": { opacity: "1", transform: "scale(1)" },
					"100%": { opacity: "1", transform: "scale(1)" },
				},
			},
			typography: () => ({
				DEFAULT: {
					css: {
						"--tw-prose-body": "var(--black)",
						"--tw-prose-headings": "var(--black)",
						"--tw-prose-code": "var(--black)",
						"--tw-prose-pre-code": "var(--white)",
						"--tw-prose-pre-bg": "var(--shadow)",
						"--tw-prose-quotes": "var(--black)",
						"--tw-prose-bold": "var(--black)",
						"--tw-prose-links": "var(--black)",
						"--tw-prose-invert-links": "var(--black)",
						"--tw-prose-invert-body": "var(--black)",
						"--tw-prose-invert-headings": "var(--black)",
						"--tw-prose-invert-code": "var(--black)",
						"--tw-prose-invert-quotes": "var(--black)",
						"--tw-prose-invert-bold": "var(--black)",
						"--tw-prose-invert-pre-code": "var(--white)",
						"--tw-prose-invert-pre-bg": "var(--shadow)",
					},
				},
			}),
		},
	},
	plugins: [
		typography(), // ✅ call as function
		heroui(),
	],
} satisfies Config;
