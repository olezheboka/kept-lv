import { motion } from "framer-motion";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-500
                bg-clip-text text-transparent inline-block mb-4"
            >
              SOLĪJUMS
            </motion.div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Politisko solījumu uzskaite
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigācija</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm" suppressHydrationWarning>
                  Sākums
                </Link>
              </li>
              <li>
                <Link href="/promises" className="text-gray-400 hover:text-white transition-colors text-sm" suppressHydrationWarning>
                  Solījumi
                </Link>
              </li>
              <li>
                <Link href="/politicians" className="text-gray-400 hover:text-white transition-colors text-sm" suppressHydrationWarning>
                  Politiķi
                </Link>
              </li>

            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Juridiskā informācija</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm" suppressHydrationWarning>
                  Privātuma politika
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm" suppressHydrationWarning>
                  Lietošanas noteikumi
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            {currentYear} solījums.lv - Politisko solījumu uzskaite
          </p>
        </div>
      </div>
    </footer>
  );
}
