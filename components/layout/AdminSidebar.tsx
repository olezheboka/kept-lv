"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", icon: "📊", labelKey: "dashboard" },
  { href: "/admin/promises", icon: "📜", labelKey: "managePromises" },
  { href: "/admin/politicians", icon: "👤", labelKey: "managePoliticians" },
  { href: "/admin/parties", icon: "🏛️", labelKey: "manageParties" },
  { href: "/admin/categories", icon: "🏷️", labelKey: "manageCategories" },
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
    <aside className="w-64 min-h-screen glass border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" suppressHydrationWarning>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500
              bg-clip-text text-transparent"
          >
            KEPT Admin
          </motion.div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} suppressHydrationWarning>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors font-medium
                    ${isActive(item.href)
                      ? "bg-white/20 text-white"
                      : "text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{t(item.labelKey as any)}</span>
                </motion.div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <Link href="/" suppressHydrationWarning>
          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg
              text-gray-400 hover:bg-white/10 hover:text-white
              transition-colors font-medium mb-2"
          >
            <span>🌐</span>
            <span>View Site</span>
          </motion.div>
        </Link>
        <motion.button
          whileHover={{ x: 4 }}
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
            text-gray-400 hover:bg-rose-500/20 hover:text-rose-400
            transition-colors font-medium"
        >
          <span>🚪</span>
          <span>{tCommon("logout")}</span>
        </motion.button>
      </div>
    </aside>
  );
}
