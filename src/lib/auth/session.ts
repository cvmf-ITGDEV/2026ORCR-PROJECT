import { createClient } from "@/lib/supabase/server";
import { AuthUser } from "@/types/auth";
import { Session } from "@supabase/supabase-js";

export async function getSession(): Promise<Session | null> {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting auth user:", error);
    return null;
  }
}

export async function validateSession(): Promise<boolean> {
  const session = await getSession();
  return session !== null && session.expires_at
    ? new Date(session.expires_at * 1000) > new Date()
    : false;
}
