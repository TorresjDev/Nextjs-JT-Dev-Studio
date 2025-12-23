import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "./provider";
import { Suspense } from "react";
import Navigation from "../components/layout/Navigation";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { SidebarNav } from "../components/layout/sidebar/SidebarNav";
import Footer from "../components/layout/Footer";
import { generateMetadata } from "../lib/metadata";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = generateMetadata();

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`gradient-background ${inter.className}`}>
				<Navigation />
				<ThemeProvider
					enableSystem={false}
					disableTransitionOnChange
					attribute="class"
					defaultTheme="dark"
				>
					<SidebarProvider>
						<div className="flex max-h-full max-w-full w-full">
							<aside>
								<SidebarNav />
							</aside>
							<main className="w-full flex flex-1 mx-2 mt-24 sm:mt-20 md:mt-16 p-3 md:p-1 transition-all duration-300 ease-in-out md:ml-[15rem] group-data-[state=collapsed]/sidebar-wrapper:md:ml-[3rem]">
								<SidebarTrigger />
								<section className="w-full flex flex-col mx-auto min-h-[95vh] overflow-y-auto px-2">
									<Suspense
										fallback={<div className="animate-spin">Loading...</div>}
									>
										{children}
									</Suspense>{" "}
								</section>
							</main>
						</div>
					</SidebarProvider>
				</ThemeProvider>
				<Footer />
			</body>
		</html>
	);
}
