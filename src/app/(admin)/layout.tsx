import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <AdminSidebar />

      {/* Main Content — offset on desktop to account for fixed sidebar */}
      <main className="flex-1 overflow-auto md:ml-0 min-w-0">
        <div className="p-4 pt-16 md:pt-8 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
