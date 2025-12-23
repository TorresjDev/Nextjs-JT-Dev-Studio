import React, { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingPage } from "@/components/common/LoadingSpinner";

export default function WalkthroughLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="max-w-full max-h-[93vh] overflow-y-scroll m-1 md:m-2 !text-black">
			<article className="prose prose-slate bg-slate-200 mx-auto p-6 mt-3 flex flex-col !w-[90%] lg:!w-full max-w-[95vw] border-x-4 border-y-2 rounded-md border-x-[#650000] prose-headings:text-gray-900 prose-p:text-gray-800 prose-li:text-gray-800 prose-strong:text-gray-900 prose-a:text-blue-700 prose-code:text-white prose-pre:bg-zinc-800 prose-pre:text-gray-100">
				<ErrorBoundary>
					<Suspense fallback={<LoadingPage />}>{children}</Suspense>
				</ErrorBoundary>
			</article>
		</section>
	);
}
