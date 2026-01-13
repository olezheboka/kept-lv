import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Sākums" },
    { href: "/promises", label: "Solījumi" },
    { href: "/politicians", label: "Politiķi" },
    { href: "/about", label: "Par mums" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.includes(href);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" suppressHydrationWarning>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-500
                bg-clip-text text-transparent"
            >
              SOLĪJUMS
            </motion.div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} suppressHydrationWarning>
                <motion.span
                  whileHover={{ y: -2 }}
                  className={`text-base font-medium transition-colors
                    ${isActive(item.href)
                      ? "text-white"
                      : "text-gray-400 hover:text-white"
                    }`}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 mt-1"
                    />
                  )}
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
