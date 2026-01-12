"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Politician {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: { lv: string; en: string; ru: string };
}

export default function NewPromisePage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    titleLv: "",
    titleEn: "",
    titleRu: "",
    descriptionLv: "",
    descriptionEn: "",
    descriptionRu: "",
    status: "IN_PROGRESS",
    explanationLv: "",
    explanationEn: "",
    explanationRu: "",
    dateOfPromise: "",
    statusUpdatedAt: "",
    politicianId: "",
    categoryId: "",
    sourceType: "VIDEO",
    sourceUrl: "",
    sourceTitleLv: "",
  });

  useEffect(() => {
    fetch("/api/politicians").then((r) => r.json()).then(setPoliticians);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: { lv: formData.titleLv, en: formData.titleEn, ru: formData.titleRu },
        description: formData.descriptionLv
          ? { lv: formData.descriptionLv, en: formData.descriptionEn, ru: formData.descriptionRu }
          : null,
        status: formData.status,
        explanation: formData.explanationLv
          ? { lv: formData.explanationLv, en: formData.explanationEn, ru: formData.explanationRu }
          : null,
        dateOfPromise: new Date(formData.dateOfPromise).toISOString(),
        statusUpdatedAt: formData.statusUpdatedAt ? new Date(formData.statusUpdatedAt).toISOString() : null,
        politicianId: formData.politicianId,
        categoryId: formData.categoryId,
        sources: formData.sourceUrl
          ? [{
            type: formData.sourceType,
            url: formData.sourceUrl,
            title: formData.sourceTitleLv ? { lv: formData.sourceTitleLv, en: "", ru: "" } : null,
          }]
          : [],
      };

      const res = await fetch("/api/promises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/promises");
        router.refresh();
      } else {
        const error = await res.json();
        alert("Failed to create: " + JSON.stringify(error));
      }
    } catch (error) {
      alert("Failed to create promise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white">{t("addNew")} Promise</h1>
        <Link
          href="/admin/promises"
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Promise Text */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Promise Title</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Latvian (Required)
              </label>
              <textarea
                required
                value={formData.titleLv}
                onChange={(e) => setFormData({ ...formData, titleLv: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Solījuma virsraksts latviešu valodā..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                English
              </label>
              <textarea
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Promise title in English..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Russian
              </label>
              <textarea
                value={formData.titleRu}
                onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Заголовок обещания на русском..."
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Description (Optional)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Latvian
              </label>
              <textarea
                value={formData.descriptionLv}
                onChange={(e) => setFormData({ ...formData, descriptionLv: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Pilns apraksts..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                English
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Full description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Russian
              </label>
              <textarea
                value={formData.descriptionRu}
                onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Полное описание..."
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Politician
              </label>
              <select
                required
                value={formData.politicianId}
                onChange={(e) => setFormData({ ...formData, politicianId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              >
                <option value="">Select politician...</option>
                {politicians.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name.lv || c.name.en}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="KEPT">Kept</option>
                <option value="NOT_KEPT">Not Kept</option>
                <option value="PARTIAL">Partial</option>
                <option value="ABANDONED">Abandoned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date of Promise
              </label>
              <input
                type="date"
                required
                value={formData.dateOfPromise}
                onChange={(e) => setFormData({ ...formData, dateOfPromise: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status Updated At
              </label>
              <input
                type="date"
                value={formData.statusUpdatedAt}
                onChange={(e) => setFormData({ ...formData, statusUpdatedAt: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Source */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Source (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Source Type
              </label>
              <select
                value={formData.sourceType}
                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              >
                <option value="VIDEO">Video</option>
                <option value="ARTICLE">Article</option>
                <option value="INTERVIEW">Interview</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="DOCUMENT">Document</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Source URL
              </label>
              <input
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Explanation (Optional)</h2>
          <textarea
            value={formData.explanationLv}
            onChange={(e) => setFormData({ ...formData, explanationLv: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
              text-white placeholder-gray-500 focus:bg-white/20 transition-all"
            placeholder="Why is this promise kept/not kept? Explain..."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/promises"
            className="px-6 py-3 rounded-lg bg-white/10 text-white font-bold
              hover:bg-white/20 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600
              text-white font-bold hover:shadow-lg transition-all
              disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Promise"}
          </button>
        </div>
      </form>
    </div>
  );
}
