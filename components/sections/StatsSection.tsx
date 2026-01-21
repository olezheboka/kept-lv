"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { statusConfig } from "@/lib/utils";

interface StatsSectionProps {
  stats: {
    total: number;
    kept: number;
    notKept: number;
    inProgress: number;
    cancelled: number;
    partial: number;
  };
  politicians: number;
  parties: number;
}

export function StatsSection({ stats, politicians, parties }: StatsSectionProps) {
  const t = useTranslations("home");
  const tStatus = useTranslations("status");

  const statItems = [
    {
      value: stats.kept,
      label: tStatus("kept"),
      color: "text-emerald-400",
      icon: statusConfig.KEPT.icon,
    },
    {
      value: stats.notKept,
      label: tStatus("notKept"),
      color: "text-rose-400",
      icon: statusConfig.NOT_KEPT.icon,
    },
    {
      value: stats.inProgress,
      label: tStatus("inProgress"),
      color: "text-amber-400",
      icon: statusConfig.IN_PROGRESS.icon,
    },
    {
      value: stats.partial,
      label: tStatus("partial"),
      color: "text-violet-400",
      icon: statusConfig.PARTIAL.icon,
    },
    {
      value: stats.cancelled,
      label: tStatus("cancelled"),
      color: "text-gray-400",
      icon: statusConfig.CANCELLED.icon,
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-white text-center mb-12"
        >
          {t("statsTitle")}
        </motion.h2>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <span className="text-2xl mb-2 block">{stat.icon}</span>
              <p className={`text-3xl md:text-4xl font-black ${stat.color} mb-2`}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-400 uppercase tracking-wide">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            <p className="text-5xl font-black text-white mb-2">{stats.total}</p>
            <p className="text-gray-400">{t("totalPromises")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            <p className="text-5xl font-black text-white mb-2">{politicians}</p>
            <p className="text-gray-400">Politicians</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-8 text-center"
          >
            <p className="text-5xl font-black text-white mb-2">{parties}</p>
            <p className="text-gray-400">Parties</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
