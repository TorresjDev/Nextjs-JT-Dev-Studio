// Type definitions for the application

export interface GuideMetadata {
	title: string;
	description: string;
	category: keyof typeof import("../constants").GUIDE_CATEGORIES;
	slug: string;
	author?: string;
	publishedAt?: string;
	updatedAt?: string;
	tags?: string[];
}

export interface GuideContent {
	metadata: GuideMetadata;
	content: string;
	readingTime?: number;
}

export interface NavigationItem {
	label: string;
	href: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	children?: NavigationItem[];
}

export interface SidebarConfig {
	groups: SidebarGroup[];
}

export interface SidebarGroup {
	title: string;
	items: NavigationItem[];
}

export interface LoadingState {
	isLoading: boolean;
	error?: string | null;
}

// Environment variables type safety
export interface EnvironmentVariables {
	NEXT_GITHUB_USERNAME: string;
	WAKATIME_USERNAME: string;
}
