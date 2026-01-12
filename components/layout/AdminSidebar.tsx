"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Tag,
  LogOut,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/admin/promises", icon: FileText, labelKey: "managePromises" },
  { href: "/admin/politicians", icon: Users, labelKey: "managePoliticians" },
  { href: "/admin/parties", icon: Building2, labelKey: "manageParties" },
  { href: "/admin/categories", icon: Tag, labelKey: "manageCategories" },
];

export function AdminSidebar() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname.endsWith("/admin");
    }
    return pathname.includes(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-background border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight text-foreground">KEPT Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{t(item.labelKey as any)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Site</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>{tCommon("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
