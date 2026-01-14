"use client";

import { useState } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PartyForm } from "@/components/admin/parties/PartyForm";

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
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<Party | null>(null);

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
        router.refresh();
    };

    const handleEditSuccess = () => {
        setEditingParty(null);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Parties"
                description="Manage political parties and their details."
                breadcrumbs={[
                    { label: "Overview", href: "/admin" },
                    { label: "Parties" },
                ]}
                actions={
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Party
                    </Button>
                }
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-[720px] lg:max-w-[1200px] w-full p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Add New Party</DialogTitle>
                        <DialogDescription>
                            Enter the details of the party below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-2 h-[80vh] overflow-y-auto">
                        <PartyForm
                            onSuccess={handleCreateSuccess}
                            onCancel={() => setIsCreateOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingParty} onOpenChange={(open) => !open && setEditingParty(null)}>
                <DialogContent className="max-w-[720px] lg:max-w-[1200px] w-full p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Edit Party</DialogTitle>
                        <DialogDescription>
                            Update party information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-2 h-[80vh] overflow-y-auto">
                        {editingParty && (
                            <PartyForm
                                initialData={editingParty}
                                onSuccess={handleEditSuccess}
                                onCancel={() => setEditingParty(null)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setEditingParty(party)}
                                        >
                                            Edit
                                        </Button>
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
