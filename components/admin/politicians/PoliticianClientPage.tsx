"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
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
}

export default function PoliticianClientPage({ initialPoliticians }: PoliticianClientPageProps) {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Politicians"
                description="Manage politicians, their profiles, and affiliations."
                count={initialPoliticians.length}
                breadcrumbs={[
                    { label: "Overview", href: "/admin" },
                    { label: "Politicians" },
                ]}

            />

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
                                        <Link href={`/admin/politicians/${politician.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                            >
                                                Edit
                                            </Button>
                                        </Link>
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

