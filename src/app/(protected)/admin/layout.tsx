import { requireAdmin } from "@/lib/auth/role-guard";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          Admin Area - You have elevated privileges
        </p>
      </div>
      {children}
    </div>
  );
}
