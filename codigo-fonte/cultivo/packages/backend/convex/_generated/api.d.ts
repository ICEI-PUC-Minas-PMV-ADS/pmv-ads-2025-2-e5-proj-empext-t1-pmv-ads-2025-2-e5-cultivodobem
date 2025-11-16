/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analysis from "../analysis.js";
import type * as auth from "../auth.js";
import type * as beanstock from "../beanstock.js";
import type * as chat from "../chat.js";
import type * as classifier from "../classifier.js";
import type * as group from "../group.js";
import type * as harvests from "../harvests.js";
import type * as postComments from "../postComments.js";
import type * as postLikes from "../postLikes.js";
import type * as proposals from "../proposals.js";
import type * as push from "../push.js";
import type * as pushSubscriptions from "../pushSubscriptions.js";
import type * as register from "../register.js";
import type * as upload from "../upload.js";
import type * as user from "../user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analysis: typeof analysis;
  auth: typeof auth;
  beanstock: typeof beanstock;
  chat: typeof chat;
  classifier: typeof classifier;
  group: typeof group;
  harvests: typeof harvests;
  postComments: typeof postComments;
  postLikes: typeof postLikes;
  proposals: typeof proposals;
  push: typeof push;
  pushSubscriptions: typeof pushSubscriptions;
  register: typeof register;
  upload: typeof upload;
  user: typeof user;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
