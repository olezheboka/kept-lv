"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";

export default function NewCategoryPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nameLv: "",
    nameEn: "",
    nameRu: "",
    slug: "",
    color: "from-blue-500 to-blue-600",
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
      };

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/categories");
        router.refresh();
      } else {
        const error = await res.json();
        alert("Failed to create: " + JSON.stringify(error));
      }
    } catch (error) {
      alert("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const colorOptions = [
    { value: "from-blue-500 to-blue-600", label: "Blue (Economy)" },
    { value: "from-pink-500 to-rose-600", label: "Pink (Healthcare)" },
    { value: "from-green-500 to-emerald-600", label: "Green (Environment)" },
    { value: "from-cyan-500 to-teal-600", label: "Cyan (Infrastructure)" },
    { value: "from-purple-500 to-violet-600", label: "Purple (Education)" },
    { value: "from-red-500 to-orange-600", label: "Red (Security)" },
    { value: "from-slate-500 to-gray-600", label: "Gray (Other)" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white">{t("addNew")} Category</h1>
        <Link href="/admin/categories" className="text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Category Name</h2>
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
                placeholder="Kategorijas nosaukums"
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
                placeholder="Category name"
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
                placeholder="Название категории"
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="category-slug"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              >
                {colorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/categories"
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
            {loading ? "Creating..." : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  );
}
