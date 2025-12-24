import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,
	pageExtensions: ["js", "jsx", "ts", "tsx", "md"],

	// Skip API routes during static generation
	experimental: {
		optimizePackageImports: [
			"@heroui/navbar",
			"@heroui/theme",
			"@radix-ui/react-tooltip",
			"framer-motion",
			"lucide-react",
		],
	},

	// Enhanced image configuration
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "torresjdev.github.io" },
			{ protocol: "https", hostname: "fonts.googleapis.com" },
			{ protocol: "https", hostname: "avatars.githubusercontent.com" },
			{ protocol: "https", hostname: "github-readme-streak-stats.herokuapp.com" },
			{ protocol: "https", hostname: "github-readme-stats.vercel.app" },
			{ protocol: "https", hostname: "ghchart.rshah.org" },
		],
	},

	// Security headers
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000; includeSubDomains",
					},
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
		];
	},
};

export default nextConfig;
