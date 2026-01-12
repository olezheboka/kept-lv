import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Plus, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { promises: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminCategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("admin");
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("manageCategories")}</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage categories and themes.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t("addNew")}
        </Link>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Slug
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Color Class
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Promises
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 align-top font-medium text-foreground">
                  {(category.name as any).lv || (category.name as any).en}
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">
                  {category.slug}
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground text-xs font-mono">
                  {/* Visual preview of gradient/color class */}
                  <span className={`inline-block w-4 h-4 rounded-full bg-gradient-to-r mr-2 align-middle ${category.color}`}></span>
                  {category.color}
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">
                  {category._count.promises}
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={category.id} type="categories" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Tag className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No categories found</p>
            <p className="text-sm text-muted-foreground/60 w-64 mt-1">Get started by creating a new category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
