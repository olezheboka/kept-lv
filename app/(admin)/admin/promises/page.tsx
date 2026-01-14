import { prisma } from "@/lib/prisma";
import PromiseClientPage from "@/components/admin/promises/PromiseClientPage";

export const dynamic = "force-dynamic";

async function getPromises() {
  return prisma.promise.findMany({
    include: {
      politician: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getPoliticians() {
  return prisma.politician.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export default async function AdminPromisesPage() {
  const [promises, politicians, categories] = await Promise.all([
    getPromises(),
    getPoliticians(),
    getCategories(),
  ]);

  return <PromiseClientPage
    initialPromises={promises as any}
    politicians={politicians}
    categories={categories}
  />;
}
