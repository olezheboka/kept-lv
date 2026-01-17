"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "./StatusBadge";
import { getLocalizedText, formatDate } from "@/lib/utils";
import type { PromiseWithRelations } from "@/types";

interface PromiseCardProps {
  promise: PromiseWithRelations;
}

export function PromiseCard({ promise }: PromiseCardProps) {
  const locale = useLocale();
  const t = useTranslations("common");

  const promiseText = getLocalizedText(promise.title, locale);
  const categoryName = getLocalizedText(promise.category.name, locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="relative overflow-hidden rounded-2xl
        glass-card
        p-8 mb-6
        transition-all duration-300
        group"
    >
      {/* Status Badge - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <StatusBadge status={promise.status} />
      </div>

      {/* Politician Header - Top Left */}
      <div className="flex items-center gap-3 mb-6">
        {promise.politician.imageUrl ? (
          <Image
            src={promise.politician.imageUrl}
            alt={promise.politician.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full border-2 border-white/40 object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full border-2 border-white/40 bg-white/10 flex items-center justify-center">
            <span className="text-xl text-white/60">
              {promise.politician.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-white">
            {promise.politician.name}
          </h3>
          <p className="text-sm text-gray-400">
            {promise.politician.party ? getLocalizedText(promise.politician.party.name, locale) : ""}
          </p>
        </div>
      </div>

      {/* Promise Text */}
      <Link href={`/promises/${promise.id}`}>
        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-6
          group-hover:text-transparent group-hover:bg-gradient-to-r
          group-hover:from-blue-400 group-hover:to-purple-400
          group-hover:bg-clip-text transition-all duration-300
          line-clamp-3">
          {promiseText}
        </h2>
      </Link>

      {/* Meta Information */}
      <div className="flex items-center gap-4 text-gray-300 text-sm mb-6 flex-wrap">
        <span className="flex items-center gap-1">
          <span>📅</span>
          {formatDate(promise.dateOfPromise, locale)}
        </span>
        <span className="flex items-center gap-1">
          <span>🏷️</span>
          {categoryName}
        </span>
        {promise.sources.length > 0 && (
          <span className="flex items-center gap-1">
            <span>📹</span>
            {promise.sources[0].type.toLowerCase()}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link href={`/promises/${promise.id}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 rounded-lg
              bg-gradient-to-r from-blue-500 to-blue-600
              text-white font-semibold
              hover:shadow-lg transition-all"
          >
            {t("readMore")}
          </motion.button>
        </Link>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-6 py-2 rounded-lg
            bg-white/10 border border-white/30
            text-white font-semibold
            hover:bg-white/20 transition-all"
        >
          {t("share")}
        </motion.button>
      </div>

      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0
        group-hover:opacity-100 transition-opacity duration-300
        bg-gradient-to-r from-blue-600/20 to-purple-600/20
        blur-2xl -z-10 pointer-events-none" />
    </motion.div>
  );
}
