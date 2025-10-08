import axios from "axios";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

export const convexClient = axios.create({
  baseURL: CONVEX_URL,
});
