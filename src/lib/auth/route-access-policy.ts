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
  /^\/session\/create$/,
  /^\/profile\/settings$/,
  /^\/profile\/report$/,
  /^\/profile\/account$/,
  /^\/session\/\d+\/waiting$/,
  /^\/session\/\d+\/result$/,
  /^\/session\/\d+\/reports$/,
];

export function isKnownPublicPageRoute(pathname: string): boolean {
  return KNOWN_PUBLIC_PAGE_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export function isProtectedPageRoute(pathname: string): boolean {
  return PROTECTED_PAGE_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}
