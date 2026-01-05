import { getAuthUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { DEFAULT_REDIRECT } from "@/lib/constants/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  if (user) {
    redirect(DEFAULT_REDIRECT.AFTER_LOGIN);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">{children}</div>
    </div>
  );
}
