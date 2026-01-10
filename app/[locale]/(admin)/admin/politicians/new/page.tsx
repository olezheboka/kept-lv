"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";

interface Party {
  id: string;
  name: { lv: string; en: string; ru: string };
}

export default function NewPoliticianPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    imageUrl: "",
    bioLv: "",
    bioEn: "",
    bioRu: "",
    partyId: "",
  });

  useEffect(() => {
    fetch("/api/parties").then((r) => r.json()).then(setParties);
  }, []);

  useEffect(() => {
    if (formData.name && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: slugify(formData.name) }));
    }
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || slugify(formData.name),
        imageUrl: formData.imageUrl || null,
        bio: formData.bioLv
          ? { lv: formData.bioLv, en: formData.bioEn, ru: formData.bioRu }
          : null,
        partyId: formData.partyId,
      };

      const res = await fetch("/api/politicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/politicians");
        router.refresh();
      } else {
        const error = await res.json();
        alert("Failed to create: " + JSON.stringify(error));
      }
    } catch (error) {
      alert("Failed to create politician");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black text-white">{t("addNew")} Politician</h1>
        <Link href="/admin/politicians" className="text-gray-400 hover:text-white">
          ← Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Jānis Bērziņš"
              />
            </div>

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
                placeholder="janis-berzins"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Party
              </label>
              <select
                required
                value={formData.partyId}
                onChange={(e) => setFormData({ ...formData, partyId: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white focus:bg-white/20 transition-all"
              >
                <option value="">Select party...</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name.lv || p.name.en}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Biography</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Latvian
              </label>
              <textarea
                value={formData.bioLv}
                onChange={(e) => setFormData({ ...formData, bioLv: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Biogrāfija latviešu valodā..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                English
              </label>
              <textarea
                value={formData.bioEn}
                onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20
                  text-white placeholder-gray-500 focus:bg-white/20 transition-all"
                placeholder="Biography in English..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/politicians"
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
            {loading ? "Creating..." : "Create Politician"}
          </button>
        </div>
      </form>
    </div>
  );
}
