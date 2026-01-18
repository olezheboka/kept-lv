"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { mapStatusToUI } from "@/lib/utils";
export function RecentPromisesList({ promises }: { promises: Array<{ id: string; title: string; status: string; politician: { name: string }; category?: { name: string } }> }) {
    return (
        <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">Recent Promises</h2>
                <Link href="/admin/promises">
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                        View All <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>

            <div className="rounded-lg border border-border/50 bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="divide-y divide-border/50">
                    {promises.map((promise) => (
                        <Link
                            key={promise.id}
                            href={`/admin/promises/${promise.id}`}
                            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                        >
                            <div className="min-w-0 pr-4">
                                <p className="font-medium text-sm text-foreground truncate group-hover:text-[#2563EB] transition-colors">
                                    {promise.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                    <span className="font-medium text-foreground/80">{promise.politician.name}</span>
                                    <span className="text-border">•</span>
                                    <span>{promise.category?.name || 'Uncategorized'}</span>
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <StatusBadge status={mapStatusToUI(promise.status)} size="sm" />
                            </div>
                        </Link>
                    ))}
                    {promises.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

