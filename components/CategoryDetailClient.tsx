"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { PromiseCard } from '@/components/PromiseCard';
// import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { STATUS_CONFIG, PromiseStatus } from '@/lib/types';
import { PromiseUI, CategoryUI } from '@/lib/db';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { SLUG_ICON_MAP } from '@/lib/categoryIcons';

interface CategoryDetailClientProps {
    category: CategoryUI;
    promises: PromiseUI[];
}

import { useState } from 'react';
import { PerformanceCard } from '@/components/PerformanceCard';

interface CategoryDetailClientProps {
    category: CategoryUI;
    promises: PromiseUI[];
}

export const CategoryDetailClient = ({ category, promises }: CategoryDetailClientProps) => {
    const [filterStatus, setFilterStatus] = useState<PromiseStatus | 'all'>('all');

    const stats = {
        total: promises.length,
        kept: promises.filter(p => p.status === 'kept').length,
        partiallyKept: promises.filter(p => p.status === 'partially-kept').length,
        inProgress: promises.filter(p => p.status === 'in-progress').length,
        broken: promises.filter(p => p.status === 'broken').length,
        notRated: promises.filter(p => p.status === 'not-rated').length,
    };

    const filteredPromises = filterStatus === 'all'
        ? promises
        : promises.filter(p => p.status === filterStatus);

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
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden shrink-0">
                            {category.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={category.imageUrl}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-blue-600">
                                    {(() => {
                                        const IconComponent = SLUG_ICON_MAP[category.slug] || TrendingUp;
                                        return <IconComponent className="h-8 w-8 md:h-10 md:w-10" />;
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
                    <PerformanceCard
                        stats={stats}
                        filterStatus={filterStatus}
                        onFilterChange={setFilterStatus}
                    />
                </div>
            </section>

            {/* Promises */}
            <section className="py-8 md:py-12">
                <div className="container-wide">
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                        {filterStatus === 'all'
                            ? `Visi solījumi (${stats.total})`
                            : `${STATUS_CONFIG[filterStatus].label} (${filteredPromises.length})`}
                    </h2>

                    {filteredPromises.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredPromises.map((promise, index) => (
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
