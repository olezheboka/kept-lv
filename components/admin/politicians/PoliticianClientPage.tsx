"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { PoliticianForm } from "@/components/admin/politicians/PoliticianForm";

interface Party {
    id: string;
    name: string;
}

interface Politician {
    id: string;
    name: string;
    slug: string;
    role?: string | null;
    bio?: string | null;
    education?: string | null;
    imageUrl?: string | null;
    isActive: boolean;
    partyId?: string | null;
    party?: { name: string } | null;
    updatedAt: string | Date;
    _count: { promises: number };
}

interface PoliticianClientPageProps {
    initialPoliticians: Politician[];
    parties: Party[];
}

export default function PoliticianClientPage({ initialPoliticians, parties }: PoliticianClientPageProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPolitician, setEditingPolitician] = useState<Politician | null>(null);

    const handleCreateSuccess = () => {
        setIsCreateOpen(false);
        router.refresh();
    };

    const handleEditSuccess = () => {
        setEditingPolitician(null);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Politicians"
                description="Manage politicians, their profiles, and affiliations."
                breadcrumbs={[
                    { label: "Overview", href: "/admin" },
                    { label: "Politicians" },
                ]}
                actions={
                    <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Politician
                    </Button>
                }
            />

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-[720px] lg:max-w-[1200px] w-full p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Add New Politician</DialogTitle>
                        <DialogDescription>
                            Create a profile for a politician.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-2 h-[80vh] overflow-y-auto">
                        <PoliticianForm
                            parties={parties}
                            onSuccess={handleCreateSuccess}
                            onCancel={() => setIsCreateOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingPolitician} onOpenChange={(open) => !open && setEditingPolitician(null)}>
                <DialogContent className="max-w-[720px] lg:max-w-[1200px] w-full p-0 overflow-hidden gap-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Edit Politician</DialogTitle>
                        <DialogDescription>
                            Update politician details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-2 h-[80vh] overflow-y-auto">
                        {editingPolitician && (
                            <PoliticianForm
                                initialData={editingPolitician}
                                parties={parties}
                                onSuccess={handleEditSuccess}
                                onCancel={() => setEditingPolitician(null)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search politicians..."
                        className="pl-9 bg-background"
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead className="text-center">Promises</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialPoliticians.map((politician, index) => (
                            <TableRow key={politician.id}>
                                <TableCell className="text-muted-foreground w-[50px]">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={politician.imageUrl || ""} alt={politician.name} />
                                            <AvatarFallback className="text-xs">{politician.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-foreground">{politician.name}</span>
                                            <span className="text-xs text-muted-foreground">Updated {new Date(politician.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {politician.role || "—"}
                                </TableCell>
                                <TableCell>
                                    {politician.party ? (
                                        <Badge variant="secondary" className="font-normal">
                                            {politician.party.name}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-muted-foreground font-normal">
                                            Independent
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-center font-medium">
                                    {politician._count.promises}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                            onClick={() => setEditingPolitician(politician)}
                                        >
                                            Edit
                                        </Button>
                                        <DeleteButton id={politician.id} type="politicians" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {initialPoliticians.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No politicians found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
