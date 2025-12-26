// Type definitions for the application

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
