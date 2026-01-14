import { prisma } from "@/lib/prisma";
import PartyClientPage from "@/components/admin/parties/PartyClientPage";

export const dynamic = "force-dynamic";

async function getParties() {
  return prisma.party.findMany({
    include: {
      _count: { select: { politicians: true } },
    },
    orderBy: { name: "asc" },
  });
}

export default async function AdminPartiesPage() {
  const parties = await getParties();
  return <PartyClientPage initialParties={parties} />;
}
