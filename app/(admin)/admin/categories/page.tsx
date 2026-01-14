import { prisma } from "@/lib/prisma";
import CategoryClientPage from "@/components/admin/categories/CategoryClientPage";

export const dynamic = "force-dynamic";

async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { promises: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <CategoryClientPage initialCategories={categories} />;
}
