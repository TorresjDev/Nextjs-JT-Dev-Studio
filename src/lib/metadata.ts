import { Metadata } from "next";
import { APP_CONFIG } from "./constants";

interface MetadataProps {
	title?: string;
	description?: string;
	image?: string;
	url?: string;
	type?: "website" | "article";
}

export function generateMetadata({
	title,
	description = APP_CONFIG.description,
	image = "/og-image.png",
	url = APP_CONFIG.url,
	type = "website",
}: MetadataProps = {}): Metadata {
	const fullTitle = title ? `${title} | ${APP_CONFIG.name}` : APP_CONFIG.name;

	return {
		title: fullTitle,
		description,
		authors: [{ name: APP_CONFIG.author.name }],
		keywords: [
			"developer",
			"portfolio",
			"next.js",
			"react",
			"typescript",
			"web development",
		],
		openGraph: {
			title: fullTitle,
			description,
			type,
			url,
			siteName: APP_CONFIG.name,
			images: [
				{
					url: image,
					width: 1200,
					height: 630,
					alt: fullTitle,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description,
			images: [image],
			creator: `@${APP_CONFIG.author.github}`,
		},
		alternates: {
			canonical: url,
		},
	};
}

