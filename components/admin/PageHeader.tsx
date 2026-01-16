"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    count?: number;
    breadcrumbs?: BreadcrumbItem[];
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    count,
    breadcrumbs = [],
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-8", className)}>
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center text-sm text-muted-foreground mb-1">
                    <Link href="/admin" className="hover:text-foreground transition-colors">
                        Admin
                    </Link>
                    {breadcrumbs.map((item, index) => (
                        <div key={index} className="flex items-center">
                            <ChevronRight className="w-4 h-4 mx-1.5 text-muted-foreground/50" />
                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-foreground font-medium cursor-default">
                                    {item.label}
                                </span>
                            )}
                        </div>
                    ))}
                </nav>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                        {count !== undefined && (
                            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-zinc-800 dark:text-zinc-400">
                                {count}
                            </Badge>
                        )}
                    </div>
                    {description && (
                        <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
}
