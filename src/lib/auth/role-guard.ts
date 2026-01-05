import { getAuthUser } from "./session";
import { SessionUser, UserRole } from "@/types/auth";
import { redirect } from "next/navigation";
import { DEFAULT_REDIRECT } from "@/lib/constants/auth";
import { toSessionUser } from "@/lib/utils/user-mapper";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Insufficient permissions") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return null;
    }

    const { userService } = await import("@/services/user.service");
    const user = await userService.findByAuthId(authUser.id);
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    return toSessionUser(user);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(DEFAULT_REDIRECT.UNAUTHORIZED);
  }

  return user;
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<SessionUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(
      `Access denied. Required roles: ${allowedRoles.join(", ")}`
    );
  }

  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole([UserRole.ADMIN]);
}

export function isAdmin(user: SessionUser): boolean {
  return user.role === UserRole.ADMIN;
}

export function isProcessor(user: SessionUser): boolean {
  return user.role === UserRole.PROCESSOR;
}

export async function checkAuth(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

export async function checkRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
