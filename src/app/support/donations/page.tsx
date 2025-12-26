import { Metadata } from "next";
import { DonationsJar } from "@/components/donations/DonationsJar";

export const metadata: Metadata = {
	title: "Support | Jesus Torres - Developer",
	description:
		"Support my development journey with a donation. Every contribution helps me continue building amazing projects and sharing knowledge with the community.",
};

export default function SupportPage() {
	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-4 py-8">
				{/* Hero Section */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-foreground mb-4">
						Support My Journey 🚀
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
						Your support helps me continue developing open-source projects,
						creating educational content, and sharing knowledge with the
						developer community. Every contribution, no matter the size, makes a
						meaningful difference.
					</p>
				</div>

				{/* Donation Section */}
				<div className="max-w-4xl mx-auto mb-12">
					<DonationsJar />
				</div>

				{/* Impact Section */}
				<div className="max-w-3xl mx-auto">
					<h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
						How Your Support Helps 💖
					</h2>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
						<div className="bg-card border border-border rounded-lg p-6 text-center">
							<div className="text-3xl mb-3">🛠️</div>
							<h3 className="font-semibold text-foreground mb-2">
								Open Source Projects
							</h3>
							<p className="text-sm text-muted-foreground">
								Supporting the development and maintenance of free, open-source
								tools and libraries.
							</p>
						</div>

						<div className="bg-card border border-border rounded-lg p-6 text-center">
							<div className="text-3xl mb-3">📚</div>
							<h3 className="font-semibold text-foreground mb-2">
								Educational Content
							</h3>
							<p className="text-sm text-muted-foreground">
								Creating tutorials, guides, and documentation to help other
								developers learn and grow.
							</p>
						</div>

						<div className="bg-card border border-border rounded-lg p-6 text-center">
							<div className="text-3xl mb-3">🌟</div>
							<h3 className="font-semibold text-foreground mb-2">
								Community Building
							</h3>
							<p className="text-sm text-muted-foreground">
								Contributing to developer communities and helping others solve
								coding challenges.
							</p>
						</div>
					</div>

					<div className="text-center">
						<p className="text-muted-foreground mb-6">
							🙏 Thank you for considering supporting my work. Your generosity
							enables me to dedicate more time to creating valuable resources
							for the developer community.
						</p>

						<div className="bg-card border border-border rounded-lg p-6">
							<h3 className="font-semibold text-foreground mb-3">
								✨ Recent Projects You&apos;re Supporting:
							</h3>
							<ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
								<li>• Next.js portfolio with user-generated content</li>
								<li>• Educational blog posts and tutorials</li>
								<li>• Git/GitHub best practices documentation</li>
								<li>• Database design and ERD tutorials</li>
								<li>• Open-source component libraries</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
