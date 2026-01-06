import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieOptions = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

let boltValue = true;
export function createClient() {
  if (boltValue) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  const cookieStore = cookies();
  
export function createClient() {
  console.log('Hakdog')
  const cookieStore = cookies();
  console.log('Cookie:', cookieStore)
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieOptions[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component
          }
        },
      },
    }
  );
}
}
