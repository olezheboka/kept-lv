"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PromiseCard } from '@/components/PromiseCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { STATUS_CONFIG, PromiseStatus } from '@/lib/types';
import { PromiseUI, CategoryUI } from '@/lib/db';
import { ArrowLeft, CheckCircle2, Clock, XCircle, CircleDot, TrendingUp } from 'lucide-react';
import { SLUG_ICON_MAP } from '@/lib/categoryIcons';

interface CategoryDetailClientProps {
    category: CategoryUI;
    promises: PromiseUI[];
}

export const CategoryDetailClient = ({ category, promises }: CategoryDetailClientProps) => {

    const stats = {
        total: promises.length,
        kept: promises.filter(p => p.status === 'kept').length,
        partiallyKept: promises.filter(p => p.status === 'partially-kept').length,
        inProgress: promises.filter(p => p.status === 'in-progress').length,
        broken: promises.filter(p => p.status === 'broken').length,
        notRated: promises.filter(p => p.status === 'not-rated').length,
    };

    const statCards = [
        { status: 'kept' as PromiseStatus, count: stats.kept, icon: CheckCircle2, color: 'text-status-kept', bg: 'bg-status-kept-bg' },
        { status: 'partially-kept' as PromiseStatus, count: stats.partiallyKept, icon: CircleDot, color: 'text-status-partially', bg: 'bg-status-partially-bg' },
        { status: 'in-progress' as PromiseStatus, count: stats.inProgress, icon: Clock, color: 'text-status-progress', bg: 'bg-status-progress-bg' },
        { status: 'broken' as PromiseStatus, count: stats.broken, icon: XCircle, color: 'text-status-broken', bg: 'bg-status-broken-bg' },
    ];

    return (
        <div className="flex flex-col bg-background">
            {/* Breadcrumb */}
            <div className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-4">
                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        suppressHydrationWarning
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Atpakaļ uz kategorijām
                    </Link>
                </div>
            </div>

            {/* Hero */}
            <section className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-8 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-start gap-6"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-accent-foreground overflow-hidden shrink-0">
                            {category.imageUrl ? (
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                    {(() => {
                                        const IconComponent = SLUG_ICON_MAP[category.slug] || TrendingUp;
                                        return <IconComponent className="h-8 w-8" />;
                                    })()}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                {category.name}
                            </h1>

                            <p className="text-muted-foreground">{category.description}</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-8 border-b border-border/50">
                <div className="container-wide">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {statCards.map((stat, index) => {
                            const StatIcon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.status}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                >
                                    <Card className="border-border/50">
                                        <CardContent className="p-4 text-center">
                                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${stat.bg} mb-2`}>
                                                <StatIcon className={`h-5 w-5 ${stat.color}`} />
                                            </div>
                                            <div className="text-2xl font-bold text-foreground">{stat.count}</div>
                                            <div className="text-xs text-muted-foreground">{STATUS_CONFIG[stat.status].label}</div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Promises */}
            <section className="py-8 md:py-12">
                <div className="container-wide">
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                        Visi solījumi ({stats.total})
                    </h2>

                    {promises.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {promises.map((promise, index) => (
                                <PromiseCard key={promise.id} promise={promise} index={index} />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-border/50">
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    Šajā kategorijā nav reģistrētu solījumu.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </div>
    );
};
