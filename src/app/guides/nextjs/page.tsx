import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

interface Guide {
	name: string;
	path: string;
	description: string;
}

async function getNextJsGuides(): Promise<Guide[]> {
	const nextjsPath = path.join(process.cwd(), "src", "app", "guides", "nextjs");

	const guides: Guide[] = [];

	try {
		const items = await fs.readdir(nextjsPath, { withFileTypes: true });

		for (const item of items) {
			if (item.isDirectory()) {
				// Check if there's a walkthrough.md in subdirectory
				const walkthrough = path.join(nextjsPath, item.name, "walkthrough.md");
				const exists = await fs
					.access(walkthrough)
					.then(() => true)
					.catch(() => false);

				if (exists) {
					guides.push({
						name: item.name.replace(/-/g, " "),
						path: `nextjs/${item.name}`,
						description: getGuideDescription(item.name),
					});
				}
			} else if (item.name === "walkthrough.md") {
				// Direct walkthrough file
				guides.push({
					name: "Next.js Fundamentals",
					path: "nextjs",
					description: "Core concepts and fundamentals of Next.js framework",
				});
			}
		}
	} catch (error) {
		console.error("Error reading Next.js guides:", error);
	}

	return guides;
}

function getGuideDescription(guide: string): string {
	const descriptions: Record<string, string> = {
		component: "Building reusable React components in Next.js applications",
		routing: "Understanding Next.js app router and navigation patterns",
		"api-routes": "Creating and managing API endpoints in Next.js",
		styling: "Styling strategies with CSS, Tailwind, and CSS-in-JS",
		deployment: "Deploying Next.js applications to various platforms",
	};

	return (
		descriptions[guide] || `Learn about ${guide.replace(/-/g, " ")} in Next.js`
	);
}

export default async function NextJsPage() {
	const guides = await getNextJsGuides();

	return (
		<div className="max-w-4xl mx-auto p-6">
			{/* Breadcrumb */}
			<nav className="flex mb-8" aria-label="Breadcrumb">
				<ol className="inline-flex items-center space-x-1 md:space-x-3">
					<li className="inline-flex items-center">
						<Link
							href="/guides"
							className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
						>
							🏠 Guides
						</Link>
					</li>
					<li aria-current="page">
						<div className="flex items-center">
							<svg
								className="mx-1 w-3 h-3 text-gray-400"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
									clipRule="evenodd"
								></path>
							</svg>
							<span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
								Next.js
							</span>
						</div>
					</li>
				</ol>
			</nav>

			{/* Header */}
			<div className="text-center mb-12">
				<h1 className="text-4xl font-bold text-gray-900 mb-4">
					⚡ Next.js Guides
				</h1>
				<p className="text-xl text-gray-600 max-w-2xl mx-auto">
					Master the React framework for production. Learn modern development
					patterns, performance optimization, and deployment strategies.
				</p>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				<div className="bg-blue-50 rounded-lg p-6 text-center">
					<div className="text-2xl font-bold text-blue-600 mb-2">
						{guides.length}
					</div>
					<div className="text-sm text-gray-600">Available Guides</div>
				</div>
				<div className="bg-green-50 rounded-lg p-6 text-center">
					<div className="text-2xl font-bold text-green-600 mb-2">React</div>
					<div className="text-sm text-gray-600">Framework Mastery</div>
				</div>
				<div className="bg-purple-50 rounded-lg p-6 text-center">
					<div className="text-2xl font-bold text-purple-600 mb-2">SSR</div>
					<div className="text-sm text-gray-600">Server-Side Rendering</div>
				</div>
			</div>

			{/* Featured Topics */}
			<div className="bg-linear-to-r from-blue-500 to-purple-600 rounded-lg p-8 mb-12 text-white">
				<h2 className="text-2xl font-semibold mb-4">🚀 Why Learn Next.js?</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h3 className="font-semibold mb-2">⚡ Performance First</h3>
						<p className="text-blue-100 text-sm">
							Built-in optimizations for images, fonts, and code splitting
						</p>
					</div>
					<div>
						<h3 className="font-semibold mb-2">🔄 Full-Stack Ready</h3>
						<p className="text-blue-100 text-sm">
							API routes, middleware, and server-side rendering capabilities
						</p>
					</div>
					<div>
						<h3 className="font-semibold mb-2">📱 Developer Experience</h3>
						<p className="text-blue-100 text-sm">
							Hot reloading, TypeScript support, and intuitive file-based
							routing
						</p>
					</div>
					<div>
						<h3 className="font-semibold mb-2">🌐 Production Ready</h3>
						<p className="text-blue-100 text-sm">
							Deploy anywhere with Vercel, Netlify, or traditional hosting
						</p>
					</div>
				</div>
			</div>

			{/* Guides List */}
			<div className="space-y-6">
				<h2 className="text-2xl font-semibold text-gray-900 mb-6">
					📚 Available Guides
				</h2>

				{guides.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-gray-500">
							No guides available yet. Check back soon!
						</p>
					</div>
				) : (
					<div className="grid gap-6">
						{guides.map((guide) => (
							<Link
								key={guide.path}
								href={`/guides/${guide.path}`}
								className="block bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
							>
								<div className="p-6">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<h3 className="text-lg font-semibold text-gray-900 mb-2">
												{guide.name.replace(/\b\w/g, (l) => l.toUpperCase())}
											</h3>
											<p className="text-gray-600 mb-4">{guide.description}</p>
											<div className="flex items-center text-sm text-blue-600">
												<span>Read Guide</span>
												<svg
													className="ml-1 w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 5l7 7-7 7"
													/>
												</svg>
											</div>
										</div>
										<div className="ml-4 shrink-0">
											<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
												<span className="text-lg">⚡</span>
											</div>
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>

			{/* Learning Path */}
			<div className="mt-12 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
				<h2 className="text-2xl font-semibold text-gray-900 mb-4">
					🎯 Recommended Learning Path
				</h2>
				<div className="space-y-4">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
							1
						</div>
						<span className="text-gray-700">
							Start with Next.js fundamentals and project setup
						</span>
					</div>
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
							2
						</div>
						<span className="text-gray-700">
							Learn component architecture and reusability patterns
						</span>
					</div>
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
							3
						</div>
						<span className="text-gray-700">
							Master routing, API routes, and full-stack development
						</span>
					</div>
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
							4
						</div>
						<span className="text-gray-700">
							Deploy and optimize for production environments
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
