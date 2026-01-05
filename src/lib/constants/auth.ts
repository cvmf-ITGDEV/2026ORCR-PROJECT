export const PROTECTED_ROUTES = {
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
} as const;

export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  AUTH_CALLBACK: "/auth/callback",
} as const;

export const DEFAULT_REDIRECT = {
  AFTER_LOGIN: PROTECTED_ROUTES.DASHBOARD,
  AFTER_LOGOUT: PUBLIC_ROUTES.LOGIN,
  UNAUTHORIZED: PUBLIC_ROUTES.LOGIN,
} as const;

export function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith(PROTECTED_ROUTES.DASHBOARD) ||
    pathname.startsWith(PROTECTED_ROUTES.ADMIN)
  );
}

export function isPublicRoute(pathname: string): boolean {
  return Object.values(PUBLIC_ROUTES).some((route) =>
    pathname.startsWith(route)
  );
}

export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith(PROTECTED_ROUTES.ADMIN);
}
