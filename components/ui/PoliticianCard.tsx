"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { getLocalizedText } from "@/lib/utils";
import type { PoliticianWithRelations } from "@/types";

interface PoliticianCardProps {
  politician: PoliticianWithRelations;
}

export function PoliticianCard({ politician }: PoliticianCardProps) {
  const locale = useLocale();
  const t = useTranslations("politicians");

  const partyName = politician.party ? getLocalizedText(politician.party.name, locale) : "Independent";
  const promiseCount = politician.promises?.length || 0;

  return (
    <Link href={`/politicians/${politician.id}`} className="group block h-full" suppressHydrationWarning>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.02 }}
        className="relative overflow-hidden rounded-2xl
          glass-card
          p-6
          transition-all duration-300
          group cursor-pointer"
      >
        {/* Party color accent */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: politician.party?.color || "gray" }}
        />

        {/* Politician Image */}
        <div className="flex justify-center mb-4">
          {politician.imageUrl ? (
            <Image
              src={politician.imageUrl}
              alt={politician.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full border-3 border-white/40 object-cover
                group-hover:border-white/60 transition-all"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-3 border-white/40
              bg-white/10 flex items-center justify-center
              group-hover:border-white/60 transition-all">
              <span className="text-3xl text-white/60">
                {politician.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Name & Party */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-white mb-1
            group-hover:text-transparent group-hover:bg-gradient-to-r
            group-hover:from-blue-400 group-hover:to-purple-400
            group-hover:bg-clip-text transition-all">
            {politician.name}
          </h3>
          <p className="text-sm text-gray-400">{partyName}</p>
        </div>

        {/* Promise Stats */}
        <div className="flex justify-center">
          <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <span className="text-2xl font-black text-white">{promiseCount}</span>
            <span className="text-sm text-gray-400 ml-2">{t("promises")}</span>
          </div>
        </div>

        {/* Hover glow */}
        <div className="absolute inset-0 rounded-2xl opacity-0
          group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-r from-blue-600/10 to-purple-600/10
          blur-xl -z-10 pointer-events-none" />
      </motion.div>
    </Link>
  );
}
