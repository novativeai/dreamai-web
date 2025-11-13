/**
 * Application routes - matches Expo app structure
 */
export const ROUTES = {
  // Root
  HOME: "/",

  // Authentication flow
  LOGIN: "/login",
  AGE: "/age",
  AGE_BLOCKED: "/age-blocked",
  TERMS_SERVICE: "/terms-service",

  // Main app
  GENERATOR: "/generator",
  RESULTS: "/results",
  PREMIUM: "/premium",
  BUY_CREDITS: "/buy-credits",
  SETTINGS: "/settings",
  DELETE_ACCOUNT: "/delete-account",

  // Additional screens
  GENERATOR_TIPS: "/generator-tips",
  DOCS: "/docs",

  // 404
  NOT_FOUND: "/not-found",
} as const;

export type RouteValue = typeof ROUTES[keyof typeof ROUTES];

/**
 * Check if user can access a protected route
 */
export function isProtectedRoute(path: string): boolean {
  const protectedRoutes: string[] = [
    ROUTES.GENERATOR,
    ROUTES.RESULTS,
    ROUTES.PREMIUM,
    ROUTES.SETTINGS,
    ROUTES.DELETE_ACCOUNT,
    ROUTES.GENERATOR_TIPS,
  ];
  return protectedRoutes.includes(path);
}

/**
 * Check if route is part of authentication flow
 */
export function isAuthRoute(path: string): boolean {
  const authRoutes = [
    ROUTES.LOGIN,
    ROUTES.AGE,
    ROUTES.AGE_BLOCKED,
    ROUTES.TERMS_SERVICE,
  ];
  return authRoutes.includes(path as RouteValue);
}
