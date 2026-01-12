"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface HeroSectionProps {
  stats?: {
    total: number;
    kept: number;
    notKept: number;
  };
}

export function HeroSection({ stats }: HeroSectionProps) {
  const t = useTranslations("home");

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black
              text-white leading-tight mb-6"
          >
            {t("heroTitle")}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12"
          >
            {t("heroSubtitle")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/promises" suppressHydrationWarning>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl
                  bg-gradient-to-r from-blue-500 to-purple-600
                  text-white font-bold text-lg
                  shadow-lg hover:shadow-xl transition-all"
              >
                {t("viewAllPromises")}
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto"
            >
              <div className="glass-card rounded-2xl p-6">
                <p className="text-4xl md:text-5xl font-black text-white mb-2">
                  {stats.total}
                </p>
                <p className="text-sm md:text-base text-gray-400">
                  {t("totalPromises")}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <p className="text-4xl md:text-5xl font-black text-emerald-400 mb-2">
                  {stats.kept}
                </p>
                <p className="text-sm md:text-base text-gray-400">
                  Kept
                </p>
              </div>
              <div className="glass-card rounded-2xl p-6">
                <p className="text-4xl md:text-5xl font-black text-rose-400 mb-2">
                  {stats.notKept}
                </p>
                <p className="text-sm md:text-base text-gray-400">
                  Not Kept
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border border-white/10 rounded-full" />
      <div className="absolute bottom-20 right-10 w-32 h-32 border border-white/10 rounded-full" />
      <div className="absolute top-1/2 right-20 w-16 h-16 border border-white/10 rounded-full" />
    </section>
  );
}
