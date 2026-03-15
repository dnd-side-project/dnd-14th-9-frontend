import {
  COOKIE_POLICY_ROUTE,
  FEEDBACK_ROUTE,
  LOGIN_ROUTE,
  PRIVACY_ROUTE,
  ROOT_ROUTE,
  TERMS_ROUTE,
} from "@/lib/routes/route-paths";

import {
  PROFILE_ROUTE_PREFIX,
  SESSION_CREATE_ROUTE,
  SESSION_MEMBER_ONLY_SUFFIXES,
} from "./auth-route-groups";

const KNOWN_PUBLIC_PAGE_ROUTE_PATTERNS = [
  new RegExp(`^${ROOT_ROUTE}$`),
  new RegExp(`^${LOGIN_ROUTE}$`),
  new RegExp(`^${FEEDBACK_ROUTE}$`),
  /^\/session\/\d+$/,
  new RegExp(`^${TERMS_ROUTE}$`),
  new RegExp(`^${PRIVACY_ROUTE}$`),
  new RegExp(`^${COOKIE_POLICY_ROUTE}$`),
];

const PROTECTED_PAGE_ROUTE_PATTERNS = [
  new RegExp(`^${SESSION_CREATE_ROUTE}$`),
  new RegExp(`^${PROFILE_ROUTE_PREFIX}\\/(settings|report|account)$`),
  ...SESSION_MEMBER_ONLY_SUFFIXES.map((suffix) => new RegExp(`^\\/session\\/\\d+\\/${suffix}$`)),
];

export function isKnownPublicPageRoute(pathname: string): boolean {
  return KNOWN_PUBLIC_PAGE_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function isProtectedPageRoute(pathname: string): boolean {
  return PROTECTED_PAGE_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}
