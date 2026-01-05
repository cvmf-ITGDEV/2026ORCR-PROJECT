"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DEFAULT_REDIRECT } from "@/lib/constants/auth";
import { AuthResult, SignInData, SignUpData } from "@/types/auth";
import { toSessionUser } from "@/lib/utils/user-mapper";

export async function signIn(data: SignInData): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    const { data: authData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (signInError) {
      return {
        success: false,
        error: signInError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Authentication failed",
      };
    }

    const { userService } = await import("@/services/user.service");
    const user = await userService.syncUser(authData.user);

    revalidatePath("/", "layout");

    return {
      success: true,
      user: toSessionUser(user),
    };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during sign in",
    };
  }
}

export async function signUp(data: SignUpData): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    const { data: authData, error: signUpError } =
      await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

    if (signUpError) {
      return {
        success: false,
        error: signUpError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "Registration failed",
      };
    }

    const { userService } = await import("@/services/user.service");
    const user = await userService.syncUser(authData.user, {
      firstName: data.firstName,
      lastName: data.lastName,
    });

    return {
      success: true,
      user: toSessionUser(user),
    };
  } catch (error) {
    console.error("Sign up error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration",
    };
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Sign out error:", error);
  }

  redirect(DEFAULT_REDIRECT.AFTER_LOGOUT);
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
