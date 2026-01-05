import { User } from "@/entities/user.entity";
import { SessionUser, UserRole } from "@/types/auth";

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    authId: user.authId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: (user.role as UserRole) || UserRole.PROCESSOR,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
