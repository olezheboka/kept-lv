"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { PromiseForm } from "@/components/admin/promises/PromiseForm";
import { PoliticianForm } from "@/components/admin/politicians/PoliticianForm";
import { PartyForm } from "@/components/admin/parties/PartyForm";

import { PartyUI, PoliticianUI, CategoryUI } from "@/lib/db";

interface AdminNavbarProps {
    politicians: PoliticianUI[];
    categories: CategoryUI[];
    parties: PartyUI[];
}

export function AdminNavbar({ politicians, categories, parties }: AdminNavbarProps) {
    const router = useRouter();
    const [activeModal, setActiveModal] = useState<"promise" | "politician" | "party" | null>(null);

    const handleSuccess = () => {
        setActiveModal(null);
        router.refresh();
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 md:px-6 flex items-center justify-between">
                {/* Brand - Left */}
                <div className="flex items-center w-[200px] md:w-64 flex-none">
                    <Link href="/admin" className="flex items-center gap-2.5 flex-shrink-0" suppressHydrationWarning>
                        <span className="font-bold text-xl text-[#2563EB]">
                            solījums.lv
                        </span>
                        <span className="text-sm font-medium text-muted-foreground mt-1">/ Admin</span>
                    </Link>
                </div>

                {/* Search - Center */}
                <div className="flex-1 flex justify-center max-w-2xl px-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Meklēt..."
                            className="pl-9 h-10 w-full bg-muted/50 border-transparent focus:border-border focus:bg-background transition-colors"
                        />
                    </div>
                </div>

                {/* Add Action - Right */}
                <div className="flex-none flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" className="gap-2 shrink-0">
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setActiveModal("promise")}>
                                Add promise
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveModal("politician")}>
                                Add politician
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveModal("party")}>
                                Add party
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Modals */}
            <Dialog open={activeModal === "promise"} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Promise</DialogTitle>
                    </DialogHeader>
                    <PromiseForm
                        politicians={politicians}
                        categories={categories}
                        onSuccess={handleSuccess}
                        onCancel={() => setActiveModal(null)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={activeModal === "politician"} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Politician</DialogTitle>
                    </DialogHeader>
                    <PoliticianForm
                        parties={parties}
                        onSuccess={handleSuccess}
                        onCancel={() => setActiveModal(null)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={activeModal === "party"} onOpenChange={(open) => !open && setActiveModal(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Add Party</DialogTitle>
                    </DialogHeader>
                    <PartyForm
                        onSuccess={handleSuccess}
                        onCancel={() => setActiveModal(null)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
