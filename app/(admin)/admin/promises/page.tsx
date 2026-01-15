import { prisma } from "@/lib/prisma";
import PromiseClientPage from "@/components/admin/promises/PromiseClientPage";

export const dynamic = "force-dynamic";

async function getPromises() {
  return prisma.promise.findMany({
    include: {
      politician: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminPromisesPage() {
  const initialPromises = await getPromises();

  return (
    <PromiseClientPage
      initialPromises={initialPromises as any}
    />
  );
}
