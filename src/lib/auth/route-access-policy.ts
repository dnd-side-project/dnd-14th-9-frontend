import {
  PROFILE_ROUTE_PREFIX,
  SESSION_CREATE_ROUTE,
  SESSION_MEMBER_ONLY_SUFFIXES,
} from "./auth-route-groups";

const KNOWN_PUBLIC_PAGE_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/login$/,
  /^\/feedback$/,
  /^\/session\/\d+$/,
  /^\/terms$/,
  /^\/privacy$/,
  /^\/cookie-policy$/,
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
