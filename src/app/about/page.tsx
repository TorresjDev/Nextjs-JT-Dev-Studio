/* eslint-disable @next/next/no-img-element */
import React from "react";
import { getGitHubProfile } from "../services/github";
import { env } from "@/lib/env";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Github, Globe, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AboutPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	// Extract GitHub username if available
	const githubUsername = user?.user_metadata?.user_name || user?.user_metadata?.preferred_username;
	const isGithubUser = !!githubUsername;
	
	let profile = null;

	try {
		if (isGithubUser) {
			profile = await getGitHubProfile(githubUsername);
		} else if (!user) {
			// If not logged in, show the site owner's profile (original behavior)
			profile = await getGitHubProfile();
		}
	} catch (e) {
		console.error("Error fetching github profile:", e);
	}

	return (
		<section
			id="about"
			className="w-full mx-auto max-w-7xl px-4 py-8 md:py-12 md:px-8 space-y-12 min-h-screen overflow-y-auto"
		>
			{/* Profile Header */}
			{profile ? (
				<div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 animate-in fade-in zoom-in duration-500">
					<div className="relative group shrink-0">
						<div className="absolute -inset-1 bg-linear-to-r from-[#DAA520] to-yellow-600 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
						<Image
							src={profile.avatar_url}
							alt="Avatar"
							className="relative rounded-full border-2 border-[#DAA520]/20 shadow-2xl object-cover"
							width={140}
							height={140}
							priority
						/>
					</div>
					
					<div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 max-w-2xl">
						<div>
							<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-[#DAA520] via-yellow-400 to-[#DAA520]">
								{profile.name || profile.login}
							</h1>
							<p className="text-lg md:text-xl text-muted-foreground mt-2 font-light">
								{profile.bio || "Software Developer"}
							</p>
						</div>

						<div className="flex gap-4 items-center">
							<Link
								href={profile.html_url}
								target="_blank"
								rel="noopener noreferrer"
								className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all duration-300 border border-white/5 hover:border-[#DAA520]/50"
							>
								<Github className="w-6 h-6 text-[#DAA520]/80 group-hover:text-[#DAA520]" />
							</Link>
							{profile.blog && (
								<Link
									href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
									target="_blank"
									rel="noopener noreferrer"
									className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all duration-300 border border-white/5 hover:border-[#DAA520]/50"
								>
									<Globe className="w-6 h-6 text-[#DAA520]/80 group-hover:text-[#DAA520]" />
								</Link>
							)}
						</div>
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-xl animate-in fade-in duration-700">
					<div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
						<AlertCircle className="w-10 h-10 text-[#DAA520]/40" />
					</div>
					<h2 className="text-2xl font-bold text-white mb-2">Profile Not Linked</h2>
					<p className="text-white/40 text-center max-w-md mb-8">
						Link your GitHub account during login to see your real-time statistics and contributions here.
					</p>
					<Button asChild className="bg-[#DAA520] hover:bg-[#DAA520]/80 text-black font-bold px-8">
						<Link href="/login">Connect GitHub</Link>
					</Button>
				</div>
			)}

			{/* Bio Section/Placeholder */}
			<div className="relative p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
				<p className="text-lg md:text-xl leading-relaxed text-gray-200/90 font-light text-center md:text-left">
					<span className="mr-2 text-2xl">💻</span>
					{isGithubUser ? (
						`Welcome ${profile?.name || githubUsername}! Here is a quick look at your development activity and profile stats directly from GitHub.`
					) : (
						"I'm a software engineer with hands-on experience in full-stack development. Link your GitHub to showcase your technical footprint here."
					)}
				</p>
			</div>

			{/* GitHub Stats Grid */}
			{(isGithubUser || (!user && profile)) && profile ? (
				<section className="space-y-8 animate-in slide-in-from-bottom-5 duration-700 delay-200">
					<div className="flex justify-center">
						<div className="relative group overflow-hidden rounded-xl border border-white/10 shadow-2xl hover:shadow-[#DAA520]/10 hover:border-[#DAA520]/30 transition-all duration-500 bg-black/40">
							<img 
								src={`https://githubcard.com/${profile.login}.svg?d=ej5sfIat`} 
								alt="GitHub Card" 
								className="w-full max-w-2xl h-auto object-contain transform group-hover:scale-[1.02] transition-transform duration-500" 
							/>
						</div>
					</div>

					<div id="github-contributions" className="flex flex-col items-center gap-4 w-full">
						<h2 className="text-xl md:text-2xl font-bold text-[#DAA520]/90 tracking-wide uppercase">
							Contribution Activity
						</h2>
						<div className="w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 shadow-inner hover:bg-white/[0.07] transition-colors">
							<img
								src={`https://ghchart.rshah.org/DAA520/${profile.login}`}
								alt="GitHub Contributions"
								className="w-full h-auto min-w-[600px] mx-auto opacity-90 hover:opacity-100 transition-opacity"
							/>
						</div>
					</div>
				</section>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-40 grayscale pointer-events-none">
					<div className="h-48 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
						<span className="text-sm font-medium">Stats Card Placeholder</span>
					</div>
					<div className="h-48 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
						<span className="text-sm font-medium">Contribution Chart Placeholder</span>
					</div>
				</div>
			)}
		</section>
	);
}
