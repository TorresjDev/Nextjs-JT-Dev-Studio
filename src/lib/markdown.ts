import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import matter from "gray-matter";
import type { GuideContent, GuideMetadata } from "./types";

/**
 * Process markdown content with frontmatter
 */
export async function processMarkdown(source: string): Promise<GuideContent> {
	const { data, content } = matter(source);

	const processedContent = await remark()
		.use(remarkGfm)
		.use(remarkHtml, { sanitize: true })
		.process(content);

	const htmlContent = processedContent.toString();

	// Calculate reading time (approximate)
	const wordsPerMinute = 200;
	const wordCount = content.split(/\s+/).length;
	const readingTime = Math.ceil(wordCount / wordsPerMinute);

	return {
		metadata: data as GuideMetadata,
		content: htmlContent,
		readingTime,
	};
}

/**
 * Extract frontmatter metadata only
 */
export function extractMetadata(source: string): GuideMetadata {
	const { data } = matter(source);
	return data as GuideMetadata;
}

/**
 * Generate reading time from content
 */
export function calculateReadingTime(content: string): number {
	const wordsPerMinute = 200;
	const wordCount = content.split(/\s+/).length;
	return Math.ceil(wordCount / wordsPerMinute);
}
