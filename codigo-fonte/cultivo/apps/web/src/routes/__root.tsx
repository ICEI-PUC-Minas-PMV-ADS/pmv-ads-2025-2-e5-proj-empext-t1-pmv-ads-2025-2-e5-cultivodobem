import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import HeaderNavigation from "@/components/header-navigation";
import Loader from "@/components/loader";
import TabNavigation from "@/components/tab-navigation";
import { Toaster } from "@/components/ui/sonner";
import "../index.css";

export type RouterAppContext = {};

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Cultivo do Bem",
			},
			{
				name: "description",
				content: "Aplicação web do Cultivo do Bem",
			},
		],
		links: [
			{
				rel: "icon",
				href: "/favicon.ico",
			},
		],
	}),
});

function RootComponent() {
	const isFetching = useRouterState({
		select: (s) => s.isLoading,
	});

	return (
		<>
			<HeadContent />
			{/* <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      > */}
			<HeaderNavigation />
			{isFetching ? <Loader /> : <Outlet />}
			<TabNavigation />
			<Toaster richColors />
			{/* </ThemeProvider> */}
			{/* <TanStackRouterDevtools position="bottom-left" /> */}
		</>
	);
}
