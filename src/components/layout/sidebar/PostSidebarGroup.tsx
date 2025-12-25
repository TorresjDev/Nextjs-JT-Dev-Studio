"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "../../ui/sidebar";
import Icon from "../../ui/icon";

export default function PostSidebarGroup() {
	const pathname = usePathname();
	const { isMobile, setOpenMobile } = useSidebar();

	const postLinks = [
		{ title: "Browse Posts", url: "/posts", icon: "📋" },
		{ title: "Create Post", url: "/editor/new", icon: "✏️" },
	];

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Posts</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{postLinks.map((link) => (
						<SidebarMenuItem key={link.url}>
							<div className="flex items-center gap-2 cursor-pointer">
								<SidebarMenuButton asChild isActive={pathname === link.url}>
									<Link
										href={link.url}
										onClick={() => isMobile && setOpenMobile(false)}
									>
										<span className="text-base">{link.icon}</span>
										<span className="ps-2">{link.title}</span>
									</Link>
								</SidebarMenuButton>
							</div>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

