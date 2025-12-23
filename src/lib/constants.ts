// Application constants
export const APP_CONFIG = {
	name: "JT Dev Studio",
	description:
		"A comprehensive developer studio built with Next.js, featuring interactive walkthrough guides, project showcases, and cutting-edge development tools.",
	url: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://jt-devstudio.tech",
	author: {
		name: "JT Torres",
		github: "TorresjDev",
		wakatime: "Jtorres",
	},
} as const;

export const ROUTES = {
	home: "/",
	about: "/about",
	guides: "/guides",
	posts: "/posts",
	contact: "/contact",
} as const;

export const GUIDE_CATEGORIES = {
	"version-control": "Version Control",
	nextjs: "Next.js Development",
	sdlc: "SDLC Methodologies",
	database: "Database Design",
} as const;

export const EXTERNAL_LINKS = {
	github: `https://github.com/${APP_CONFIG.author.github}`,
	repository: `https://github.com/${APP_CONFIG.author.github}/Nextjs-App`,
	issues: `https://github.com/${APP_CONFIG.author.github}/Nextjs-App/issues`,
} as const;
