"use client";
import { Sidebar, SidebarContent, SidebarFooter } from "../../ui/sidebar";
import AboutSidebarGroup from "./AboutSidebarGroup";
import WalkthroughSidebarGroup from "./GuidesSidebarGroup";
// import PostSidebarGroup from "./PostSidebarGroup";
import SupportSidebarGroup from "./SupportSidebarGroup";
import UserMenu from "../UserMenu";

export function SidebarNav() {
	return (
		<Sidebar className="top-[60px]">
			<SidebarContent>
				<AboutSidebarGroup />
				<WalkthroughSidebarGroup />
				{/* <PostSidebarGroup /> */}
				<SupportSidebarGroup />
				{/* need group for ai resume builder*/}
				{/* need group for comments*/}
				{/* need group for themes */}
			</SidebarContent>
			<SidebarFooter className="border-t border-white/5 pb-20 md:pb-4">
				<UserMenu dropdownAlign="left" />
			</SidebarFooter>
		</Sidebar>
	);
}
