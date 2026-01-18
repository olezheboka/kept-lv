import { Suspense } from "react";
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
    <Suspense fallback={<div>Loading...</div>}>
      <PromiseClientPage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialPromises={initialPromises as any}
      />
    </Suspense>
  );
}
