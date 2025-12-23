import { env } from '@/lib/env';

export async function getGitHubProfile(username?: string) {
	const githubUsername = username || env.NEXT_GITHUB_USERNAME;
	const response = await fetch(
		`https://api.github.com/users/${githubUsername}`,
		{
			headers: {
				Accept: "application/vnd.github+json",
			},
			next: {
				revalidate: 3600, // Revalidate every hour
			},
		}
	);

	if (!response.ok) {
		throw new Error("Failed to fetch GitHub profile");
	}

	return response.json();
}
