import { prisma } from "@/lib/prisma";
import PoliticianClientPage from "@/components/admin/politicians/PoliticianClientPage";

export const dynamic = "force-dynamic";

async function getPoliticians() {
  return prisma.politician.findMany({
    include: {
      party: { select: { name: true, id: true } },
      _count: { select: { promises: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminPoliticiansPage() {
  const initialPoliticians = await getPoliticians();

  return (
    <PoliticianClientPage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialPoliticians={initialPoliticians as any}
    />
  );
}
