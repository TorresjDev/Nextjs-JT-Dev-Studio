import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "Thank You | Jesus Torres - Developer",
	description:
		"Thank you for your generous donation! Your support helps me continue creating valuable developer resources.",
};

export default function ThankYouPage() {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center">
			<div className="container mx-auto px-4">
				<div className="max-w-2xl mx-auto text-center">
					{/* Success Animation/Icon */}
					<div className="text-6xl mb-6">🎉</div>

					<h1 className="text-4xl font-bold text-foreground mb-4">
						Thank You! 🙏
					</h1>

					<p className="text-lg text-muted-foreground mb-8">
						Your generous donation has been received successfully! Your support
						means the world to me and helps keep my projects alive and growing.
					</p>

					<div className="bg-card border border-border rounded-lg p-6 mb-8">
						<h2 className="text-xl font-semibold text-foreground mb-4">
							What happens next?
						</h2>
						<div className="text-left space-y-3 text-muted-foreground">
							<div className="flex items-start gap-3">
								<span className="text-green-500 mt-1">✓</span>
								<span>You&apos;ll receive an email confirmation shortly</span>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-green-500 mt-1">✓</span>
								<span>
									Your donation will directly support ongoing development
									projects
								</span>
							</div>
							<div className="flex items-start gap-3">
								<span className="text-green-500 mt-1">✓</span>
								<span>
									You&apos;re helping create more free resources for the
									developer community
								</span>
							</div>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button asChild>
							<Link href="/">Return to Home</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/posts">Browse Posts</Link>
						</Button>
					</div>

					<div className="mt-8 text-sm text-muted-foreground">
						<p>
							Want to stay updated on my projects? Follow me on{" "}
							<a
								href="https://github.com/TorresjDev"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								GitHub
							</a>
							!
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
