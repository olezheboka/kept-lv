import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnimatedMeshBackground } from "@/components/sections/AnimatedMeshBackground";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedMeshBackground />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
