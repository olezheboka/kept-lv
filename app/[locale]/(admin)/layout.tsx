import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AnimatedMeshBackground } from "@/components/sections/AnimatedMeshBackground";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex">
      <AnimatedMeshBackground />
      <AdminSidebar />
      <main className="flex-1 p-8 relative z-10">{children}</main>
    </div>
  );
}
