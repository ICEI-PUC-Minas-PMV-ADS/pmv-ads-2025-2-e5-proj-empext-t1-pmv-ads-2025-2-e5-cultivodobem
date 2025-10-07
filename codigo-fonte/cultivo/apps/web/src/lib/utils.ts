import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { redirect } from "@tanstack/react-router";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserIdFromLocalStorage() {
  const user = localStorage.getItem("user");
  if (!user) return null;
  return JSON.parse(user)._id;
}

export function ensureAuthenticated() {
  const userId = getUserIdFromLocalStorage();
  if (!userId) {
    throw redirect({
      to: "/login",
    });
  }
}
