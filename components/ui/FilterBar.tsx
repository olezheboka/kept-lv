"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLocalizedText } from "@/lib/utils";
import type { PromiseStats, LocalizedText } from "@/types";

interface FilterBarProps {
  politicians: { id: string; name: string }[];
  categories: { id: string; name: LocalizedText; slug: string }[];
  parties: { id: string; name: LocalizedText; slug: string }[];
  stats: PromiseStats;
}

export function FilterBar({ politicians, categories, stats }: FilterBarProps) {
  const locale = useLocale();
  const t = useTranslations("promises");
  const tStatus = useTranslations("status");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "all",
    politician: searchParams.get("politician") || "",
    category: searchParams.get("category") || "",
    party: searchParams.get("party") || "",
    search: searchParams.get("search") || "",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
  });

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "all") {
        params.set(k, v);
      }
    });

    router.push(`?${params.toString()}`);
  };

  const statusOptions = [
    { value: "all", label: t("filterByStatus"), color: "gray" },
    { value: "KEPT", label: tStatus("kept"), color: "emerald" },
    { value: "NOT_KEPT", label: tStatus("notKept"), color: "rose" },
    { value: "IN_PROGRESS", label: tStatus("inProgress"), color: "amber" },
    { value: "PARTIAL", label: tStatus("partial"), color: "violet" },
    { value: "CANCELLED", label: tStatus("cancelled"), color: "gray" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-20 z-40 glass-card rounded-2xl p-8 mb-12"
    >
      <h3 className="text-2xl font-bold text-white mb-6">
        {t("filterByStatus")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
            Status
          </label>
          <div className="flex flex-col gap-2">
            {statusOptions.map((option) => (
              <motion.label
                key={option.value}
                whileHover={{ x: 4 }}
                className="flex items-center gap-3 cursor-pointer
                  p-2 rounded-lg hover:bg-white/5 transition-all"
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={filters.status === option.value}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className="w-5 h-5 accent-blue-500 cursor-pointer"
                />
                <span className="text-white font-medium">{option.label}</span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Politician Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
            {t("filterByPolitician")}
          </label>
          <motion.select
            whileFocus={{ scale: 1.02 }}
            value={filters.politician}
            onChange={(e) => updateFilter("politician", e.target.value)}
            className="w-full bg-white/10 rounded-lg border border-white/20
              px-4 py-3 text-white
              hover:bg-white/15 focus:bg-white/20
              transition-all font-medium"
          >
            <option value="">{t("filterByPolitician")}</option>
            {politicians.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </motion.select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
            {t("filterByCategory")}
          </label>
          <motion.select
            whileFocus={{ scale: 1.02 }}
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="w-full bg-white/10 rounded-lg border border-white/20
              px-4 py-3 text-white
              hover:bg-white/15 focus:bg-white/20
              transition-all font-medium"
          >
            <option value="">{t("filterByCategory")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {getLocalizedText(c.name, locale)}
              </option>
            ))}
          </motion.select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
            {t("dateFrom")}
          </label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="w-full bg-white/10 rounded-lg border border-white/20
              px-4 py-3 text-white
              hover:bg-white/15 focus:bg-white/20
              transition-all font-medium"
          />
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
            {t("searchPlaceholder")}
          </label>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="search"
            placeholder={t("searchPlaceholder")}
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full bg-white/10 rounded-lg border border-white/20
              px-4 py-3 text-white placeholder-gray-500
              hover:bg-white/15 focus:bg-white/20
              transition-all font-medium"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-white/10
        grid grid-cols-3 md:grid-cols-5 gap-4">
        <div className="text-center">
          <p className="text-2xl font-black text-emerald-400">{stats.kept}</p>
          <p className="text-xs text-gray-400 uppercase">{tStatus("kept")}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-rose-400">{stats.notKept}</p>
          <p className="text-xs text-gray-400 uppercase">{tStatus("notKept")}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-amber-400">{stats.inProgress}</p>
          <p className="text-xs text-gray-400 uppercase">{tStatus("inProgress")}</p>
        </div>
        <div className="text-center hidden md:block">
          <p className="text-2xl font-black text-violet-400">{stats.partial}</p>
          <p className="text-xs text-gray-400 uppercase">{tStatus("partial")}</p>
        </div>
        <div className="text-center hidden md:block">
          <p className="text-2xl font-black text-gray-400">{stats.cancelled}</p>
          <p className="text-xs text-gray-400 uppercase">{tStatus("cancelled")}</p>
        </div>
      </div>
    </motion.div>
  );
}
