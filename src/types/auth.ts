import { User as SupabaseUser } from "@supabase/supabase-js";

export enum UserRole {
  ADMIN = "admin",
  PROCESSOR = "processor",
}

export type AuthUser = SupabaseUser;

export interface SessionUser {
  id: string;
  authId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: SessionUser;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}
