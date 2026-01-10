"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { statusConfig, type PromiseStatusType } from "@/lib/utils";

interface StatusBadgeProps {
  status: PromiseStatusType;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const locale = useLocale();
  const config = statusConfig[status];

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
  };

  const iconSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center rounded-full
        bg-gradient-to-r ${config.gradient}
        text-white font-black
        uppercase tracking-widest
        shadow-lg
        border border-white/30
        ${sizeClasses[size]}
      `}
    >
      <span className={iconSizes[size]}>{config.icon}</span>
      <span>{config.label[locale as keyof typeof config.label] || config.label.en}</span>
    </motion.div>
  );
}
