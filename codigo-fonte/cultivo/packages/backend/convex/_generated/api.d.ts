/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analysis from "../analysis.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as classifier from "../classifier.js";
import type * as group from "../group.js";
import type * as harvests from "../harvests.js";
import type * as postComments from "../postComments.js";
import type * as postLikes from "../postLikes.js";
import type * as register from "../register.js";
import type * as upload from "../upload.js";
import type * as user from "../user.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analysis: typeof analysis;
  auth: typeof auth;
  chat: typeof chat;
  classifier: typeof classifier;
  group: typeof group;
  harvests: typeof harvests;
  postComments: typeof postComments;
  postLikes: typeof postLikes;
  register: typeof register;
  upload: typeof upload;
  user: typeof user;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
