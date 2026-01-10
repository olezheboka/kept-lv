"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";

export default function NewPartyPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nameLv: "",
    nameEn: "",
    nameRu: "",
    slug: "",
    color: "#3B82F6",
    logoUrl: "",
  });

  useEffect(() => {
    if (formData.nameLv && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: slugify(formData.nameLv) }));
    }
  }, [formData.nameLv]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: { lv: formData.nameLv, en: formData.nameEn, ru: formData.nameRu },
        slug: formData.slug || slugify(formData.nameLv),
        color: formData.color,
        logoUrl: formData.logoUrl || null,
      };

      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/parties");
        router.refresh();
      } else {
        const error = await res.json();
        alert("Failed to create: " + JSON.stringify(error));
      }
    } catch (error) {
      alert("Failed to create party");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white">{t("addNew")} Party</h1>
        <Link href="/admin/parties" className="text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Party Name</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Latvian (Required)
              </label>
              <input
                type="text"
                required
                value={formData.nameLv}
                onChange={(e) => setFormData({ ...formData, nameLv: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Partijas nosaukums latviešu valodā"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                English
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Party name in English"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Russian
              </label>
              <input
                type="text"
                value={formData.nameRu}
                onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Название партии на русском"
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Slug
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="party-slug"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20
                    text-white focus:bg-white/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/parties"
            className="px-6 py-3 rounded-lg bg-white/10 text-white font-bold
              hover:bg-white/20 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600
              text-white font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Party"}
          </button>
        </div>
      </form>
    </div>
  );
}
