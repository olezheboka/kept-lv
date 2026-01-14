import { prisma } from "@/lib/prisma";
import PoliticianClientPage from "@/components/admin/politicians/PoliticianClientPage";

export const dynamic = "force-dynamic";

async function getPoliticians() {
  return prisma.politician.findMany({
    include: {
      party: { select: { name: true } },
      _count: { select: { promises: true } },
    },
    orderBy: { name: "asc" },
  });
}

async function getParties() {
  return prisma.party.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export default async function AdminPoliticiansPage() {
  const [politicians, parties] = await Promise.all([
    getPoliticians(),
    getParties(),
  ]);

  return <PoliticianClientPage initialPoliticians={politicians} parties={parties} />;
}
