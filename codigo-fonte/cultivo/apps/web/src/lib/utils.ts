import { redirect } from "@tanstack/react-router";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getUserIdFromLocalStorage() {
	if (typeof window === "undefined") return null;
	const user = localStorage.getItem("user");
	if (!user) return null;
	try {
		return JSON.parse(user)._id;
	} catch (err) {
		console.warn("Failed to parse user from localStorage", err);
		return null;
	}
}

export function ensureAuthenticated() {
  if (typeof window === "undefined") return;

  const userId = getUserIdFromLocalStorage();
  if (!userId) {
    throw redirect({ to: "/login" });
  }
}

export function ensureUserRole(role: string) {
  // If running in a non-browser environment (SSG/SSR or early router code),
  // avoid accessing localStorage which would throw. Allow the route to proceed
  // and let client-side navigation enforce redirects.
  if (typeof window === "undefined") return;

  const userId = getUserIdFromLocalStorage();
  const userRaw = localStorage.getItem("user");

  if (!userId || !userRaw) {
    throw redirect({ to: "/login" });
  }

  let parsed: any = null;
  try {
    parsed = JSON.parse(userRaw);
  } catch (err) {
    console.warn("Failed to parse user from localStorage", err);
  }

  if (!parsed || parsed.tipo_usuario !== role) {
    throw redirect({ to: "/" });
  }
}
