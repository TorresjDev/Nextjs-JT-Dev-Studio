import { env } from '@/lib/env';

export async function getGitHubProfile() {
	const response = await fetch(
		`https://api.github.com/users/${env.NEXT_GITHUB_USERNAME}`,
		{
			headers: {
				Accept: "application/vnd.github+json",
			},
			next: {
				revalidate: 3600, // Revalidate every 60 seconds
			},
		}
	);

	if (!response.ok) {
		throw new Error("Failed to fetch GitHub profile");
	}

	return response.json();
}
