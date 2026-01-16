"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Party {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    isCoalition: boolean;
    updatedAt: string | Date;
    _count: { politicians: number };
}

interface PartyClientPageProps {
    initialParties: Party[];
}

export default function PartyClientPage({ initialParties }: PartyClientPageProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Parties"
                description="Manage political parties and their details."
                count={initialParties.length}
                breadcrumbs={[
                    { label: "Overview", href: "/admin" },
                    { label: "Parties" },
                ]}

            />

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search parties..."
                        className="pl-9 bg-background"
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Coalition</TableHead>
                            <TableHead>Politicians</TableHead>
                            <TableHead className="w-[130px]">Updated</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialParties.map((party) => (
                            <TableRow key={party.id}>
                                <TableCell className="font-medium text-foreground">
                                    {party.name}
                                </TableCell>
                                <TableCell>
                                    {party.isCoalition ? (
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 border-0 font-normal">Yes</Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10 border-0 font-normal">No</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {party._count.politicians}
                                </TableCell>
                                <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                                    {new Date(party.updatedAt).toLocaleDateString("lv-LV", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link href={`/admin/parties/${party.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                            >
                                                Edit
                                            </Button>
                                        </Link>
                                        <DeleteButton id={party.id} type="parties" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {initialParties.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No parties found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

