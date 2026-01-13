import { motion } from "framer-motion";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500
                bg-clip-text text-transparent inline-block"
            >
              SOLĪJUMS
            </motion.div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Politisko solījumu uzskaite
            </p>
          </div>

          {/* Navigation - Inline */}
          <nav className="flex flex-wrap items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm" suppressHydrationWarning>
              Sākums
            </Link>
            <Link href="/promises" className="text-gray-400 hover:text-white transition-colors text-sm" suppressHydrationWarning>
              Solījumi
            </Link>
            <Link href="/politicians" className="text-gray-400 hover:text-white transition-colors text-sm" suppressHydrationWarning>
              Politiķi
            </Link>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} solījums.lv - Politisko solījumu uzskaite
          </p>
        </div>
      </div>
    </footer>
  );
}

