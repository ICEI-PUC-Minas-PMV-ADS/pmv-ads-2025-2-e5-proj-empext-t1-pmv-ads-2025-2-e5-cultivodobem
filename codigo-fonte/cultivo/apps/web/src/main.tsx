import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import ReactDOM from "react-dom/client";
import Loader from "./components/loader";
import { routeTree } from "./routeTree.gen";
import React from "react";
import ConvexErrorBoundary from "./components/ConvexErrorBoundary";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

// If the Convex URL isn't set (e.g. missing env var in production), show
// a clear message instead of letting the runtime throw an opaque 404/NOT_FOUND
// from the Convex client. This helps debugging deployed builds (like Vercel)
// when environment variables were not configured.
if (!convexUrl || convexUrl.length === 0) {
	const rootElement = document.getElementById("app");
	if (!rootElement) {
		throw new Error("Root element not found");
	}
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f3ed]">
			<div className="max-w-xl w-full bg-white shadow-lg rounded-lg p-6 text-center">
				<h1 className="text-2xl font-bold mb-2 text-[#7c6a5c]">Configuração Ausente</h1>
				<p className="text-[#7c6a5c] mb-4">
					A aplicação não encontrou a variável de ambiente <code>VITE_CONVEX_URL</code>.
					Defina essa variável no ambiente de execução (por exemplo, nas Environment
					Variables do Vercel) com a URL do seu projeto Convex para habilitar o
					backend.
				</p>
				<div className="flex justify-center gap-2">
					<a
						href="/"
						className="inline-block px-4 py-2 bg-[#ffa726] text-white rounded font-semibold"
					>
						Voltar
					</a>
				</div>
			</div>
		</div>
	);
	// stop further initialization
} else {
		const convex = new ConvexReactClient(convexUrl);

		const router = createRouter({
			routeTree,
			defaultPreload: "intent",
			defaultPendingComponent: () => <Loader />,
			context: {},
			Wrap: function WrapComponent({ children }: { children: React.ReactNode }) {
				return <ConvexProvider client={convex}>{children}</ConvexProvider>;
			},
		});

		const rootElement = document.getElementById("app");

		if (!rootElement) {
			throw new Error("Root element not found");
		}

		if (!rootElement.innerHTML) {
			const root = ReactDOM.createRoot(rootElement);
			root.render(
				<ConvexErrorBoundary>
					<RouterProvider router={router} />
				</ConvexErrorBoundary>
			);
		}
}

	// Keep a minimal ambient declaration so the router type is registered for other files.
	declare module "@tanstack/react-router" {
	  interface Register {
	    router: any;
	  }
	}
