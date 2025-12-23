import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { ThemeProvider } from "./provider";
import Navigation from "../components/layout/Navigation";
import Footer from "../components/layout/Footer";
import { generateMetadata } from "../lib/metadata";
import { LayoutContent } from "../components/layout/LayoutContent";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = generateMetadata();

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`gradient-background ${inter.className}`}>
				<AuthProvider>
					<Navigation />
					<ThemeProvider
						enableSystem={false}
						disableTransitionOnChange
						attribute="class"
						defaultTheme="dark"
					>
						<LayoutContent>{children}</LayoutContent>
					</ThemeProvider>
					<Footer />
				</AuthProvider>
			</body>
		</html>
	);
}
