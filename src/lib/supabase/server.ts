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

    const res = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('res:', res)
    return res;
  }
  
console.log('HAKDOG')
  const cookieStore = cookies();
console.log('LOLO')
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          ),
      },
    }
  );
}