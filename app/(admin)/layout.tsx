import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-g-gray-50 flex flex-col font-sans">
      <AdminHeader />
      <div className="flex flex-1 pt-16">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
