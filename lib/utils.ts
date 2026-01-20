import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale: string = "lv"): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === "lv" ? "lv-LV" : locale === "ru" ? "ru-RU" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[āàáâãäå]/g, "a")
    .replace(/[ēèéêë]/g, "e")
    .replace(/[īìíîï]/g, "i")
    .replace(/[ōòóôõö]/g, "o")
    .replace(/[ūùúûü]/g, "u")
    .replace(/[čć]/g, "c")
    .replace(/[šś]/g, "s")
    .replace(/[žź]/g, "z")
    .replace(/[ķ]/g, "k")
    .replace(/[ļ]/g, "l")
    .replace(/[ņ]/g, "n")
    .replace(/[ģ]/g, "g")
    .replace(/[ŗ]/g, "r")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .trim();
}

export function getLocalizedText(
  json: { lv?: string; en?: string; ru?: string } | null | undefined,
  locale: string
): string {
  if (!json) return "";
  const localeKey = locale as keyof typeof json;
  return json[localeKey] || json.lv || json.en || "";
}

export function convertToEmbedUrl(url: string): string {
  // YouTube
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  return url;
}

export const statusConfig = {
  KEPT: {
    icon: "✓",
    label: { lv: "IZPILDĪTS", en: "KEPT", ru: "ВЫПОЛНЕНО" },
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/20",
    border: "border-emerald-400/50",
    text: "text-emerald-400",
  },
  NOT_KEPT: {
    icon: "✗",
    label: { lv: "NEIZPILDĪTS", en: "NOT KEPT", ru: "НЕ ВЫПОЛНЕНО" },
    gradient: "from-rose-500 to-red-600",
    bg: "bg-rose-500/20",
    border: "border-rose-400/50",
    text: "text-rose-400",
  },
  IN_PROGRESS: {
    icon: "⟳",
    label: { lv: "PROCESĀ", en: "IN PROGRESS", ru: "В ПРОЦЕССЕ" },
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/20",
    border: "border-amber-400/50",
    text: "text-amber-400",
  },
  ABANDONED: {
    icon: "∅",
    label: { lv: "PAMESTS", en: "ABANDONED", ru: "ЗАБРОШЕНО" },
    gradient: "from-slate-500 to-gray-600",
    bg: "bg-slate-500/20",
    border: "border-slate-400/50",
    text: "text-slate-400",
  },
  PARTIAL: {
    icon: "◐",
    label: { lv: "DAĻĒJI", en: "PARTIAL", ru: "ЧАСТИЧНО" },
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-500/20",
    border: "border-violet-400/50",
    text: "text-violet-400",
  },
  CANCELLED: {
    icon: "⊘",
    label: { lv: "ATCELTS", en: "CANCELLED", ru: "ОТМЕНЕНО" },
    gradient: "from-gray-500 to-slate-600",
    bg: "bg-gray-500/20",
    border: "border-gray-400/50",
    text: "text-gray-400",
  },
} as const;

// Map Prisma status to UI status
export function mapStatusToUI(status: string): "kept" | "partially-kept" | "in-progress" | "broken" | "cancelled" {
  const statusMap: Record<string, "kept" | "partially-kept" | "in-progress" | "broken" | "cancelled"> = {
    KEPT: "kept",
    NOT_KEPT: "broken",
    IN_PROGRESS: "in-progress",
    PARTIAL: "partially-kept",
    ABANDONED: "cancelled",
    CANCELLED: "cancelled",
  };
  return statusMap[status] || "cancelled";
}

export type PromiseStatusType = keyof typeof statusConfig;
