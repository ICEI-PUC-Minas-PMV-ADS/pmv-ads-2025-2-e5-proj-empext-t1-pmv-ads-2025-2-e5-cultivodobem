import { redirect } from "@tanstack/react-router";
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

export function ensureAuthenticated() {
  const userId = getUserIdFromLocalStorage();
  if (!userId) {
    throw redirect({
      to: "/login",
    });
  }
}

export function ensureUserRole(role: string) {
  const userId = getUserIdFromLocalStorage();
  const user = localStorage.getItem("user");

  if (!userId || !user) {
    throw redirect({
      to: "/login",
    });
  }

  console.log(JSON.parse(user).tipo_usuario);

  if (!(JSON.parse(user).tipo_usuario === role)) {
    throw redirect({
      to: "/",
    });
  }
}
