/* eslint-disable @next/next/no-img-element */
import React from "react";
import { getGitHubProfile } from "../services/github";
import { env } from "@/lib/env";
import Image from "next/image";
import Link from "next/link";

export default async function AboutPage() {
	const profile = await getGitHubProfile();

	return (
		<section
			id="about"
			className="w-full mx-auto max-w-7xl px-4 py-8 md:py-12 md:px-8 space-y-12 min-h-screen overflow-y-auto"
		>
			{/* Profile Header */}
			<div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 animate-in fade-in zoom-in duration-500">
				<div className="relative group shrink-0">
					<div className="absolute -inset-1 bg-linear-to-r from-[#DAA520] to-yellow-600 rounded-full blur opacity-30 group-hover:opacity-70 transition duration-500"></div>
					<Image
						src={profile.avatar_url}
						alt="GitHub Avatar"
						className="relative rounded-full border-2 border-[#DAA520]/20 shadow-2xl object-cover"
						width={140}
						height={140}
						priority
					/>
				</div>
				
				<div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 max-w-2xl">
					<div>
						<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-[#DAA520] via-yellow-400 to-[#DAA520]">
							{profile.name}
						</h1>
						<p className="text-lg md:text-xl text-muted-foreground mt-2 font-light">
							{profile.bio}
						</p>
					</div>

					<div className="flex gap-4 items-center">
						<Link
							href={profile.html_url}
							target="_blank"
							rel="noopener noreferrer"
							className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all duration-300 border border-white/5 hover:border-[#DAA520]/50"
						>
							<Image
								src="https://torresjdev.github.io/Nextjs-Asset-Host/assets/icons/social/github.svg"
								alt="GitHub"
								width={24}
								height={24}
								className="opacity-80 hover:opacity-100"
							/>
						</Link>
						<Link
							href="https://linkedin.com/in/torresjdev"
							target="_blank"
							rel="noopener noreferrer"
							className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 transition-all duration-300 border border-white/5 hover:border-[#DAA520]/50"
						>
							<Image
								src="https://torresjdev.github.io/Nextjs-Asset-Host/assets/icons/social/linkedIn.svg"
								alt="LinkedIn"
								width={24}
								height={24}
								className="opacity-80 hover:opacity-100"
							/>
						</Link>
					</div>
				</div>
			</div>

			{/* Bio Section */}
			<div className="relative p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
				<p className="text-lg md:text-xl leading-relaxed text-gray-200/90 font-light">
					<span className="mr-2 text-2xl">💻</span>
					I&#39;m a software engineer with hands-on experience in full-stack
					development, system design, and database work. My background in Computer
					Information Systems gives me the foundation to understand both the
					technical and business side of software projects.
				</p>
			</div>

			{/* GitHub Stats Grid */}
			<section className="space-y-8 animate-in slide-in-from-bottom-5 duration-700 delay-200">
				<div className="flex justify-center">
					<div className="relative group overflow-hidden rounded-xl border border-white/10 shadow-2xl hover:shadow-[#DAA520]/10 hover:border-[#DAA520]/30 transition-all duration-500 bg-black/40">
						<img 
							src={`https://githubcard.com/${env.NEXT_GITHUB_USERNAME}.svg?d=ej5sfIat`} 
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
							src={`https://ghchart.rshah.org/DAA520/${env.NEXT_GITHUB_USERNAME}`}
							alt="GitHub Contributions"
							className="w-full h-auto min-w-[600px] mx-auto opacity-90 hover:opacity-100 transition-opacity"
						/>
					</div>
				</div>
			</section>
		</section>
	);
}
