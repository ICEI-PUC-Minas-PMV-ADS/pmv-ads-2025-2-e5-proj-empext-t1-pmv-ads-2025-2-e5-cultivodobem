import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getUserIdFromLocalStorage() {
  const user = localStorage.getItem("user");
  if (!user) return null;
  return JSON.parse(user)._id;
}