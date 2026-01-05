import { createClient } from "@/lib/supabase/server";
import { userService } from "@/services/user.service";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(
        new URL("/login?error=auth_callback_failed", requestUrl.origin)
      );
    }

    if (data.user) {
      try {
        await userService.syncUser(data.user);
      } catch (syncError) {
        console.error("Error syncing user:", syncError);
      }
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
