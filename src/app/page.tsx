import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAuthUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await getAuthUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">Technical Governance Framework</h1>
          <p className="text-muted-foreground">
            Next.js 14 + React 18 + TypeScript + TailwindCSS + shadcn/ui + Supabase + TypeORM
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="lg">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </div>

        {user && (
          <p className="text-sm text-muted-foreground">
            Logged in as {user.email}
          </p>
        )}
      </div>
    </main>
  );
}
