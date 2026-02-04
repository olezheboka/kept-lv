"use client";

import { useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { motion } from 'framer-motion';
import { PromiseCard } from '@/components/PromiseCard';
import { Card, CardContent } from '@/components/ui/card';
import { STATUS_CONFIG, PromiseStatus } from '@/lib/types';
import { PromiseUI, CategoryUI } from '@/lib/db';
import { TrendingUp } from 'lucide-react';
import { SLUG_ICON_MAP } from '@/lib/categoryIcons';
import { PerformanceCard } from '@/components/PerformanceCard';
import { Button } from '@/components/ui/button';
import { RichTextViewer } from '@/components/ui/rich-text-viewer';

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
        pending: promises.filter(p => p.status === 'pending').length,
        broken: promises.filter(p => p.status === 'broken').length,
        cancelled: promises.filter(p => p.status === 'cancelled').length,
    };

    const filteredPromises = filterStatus === 'all'
        ? promises
        : promises.filter(p => p.status === filterStatus);

    return (
        <div className="flex flex-col bg-background">
            {/* Breadcrumb */}
            <div className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-4">
                    <BackButton variant="link" />
                </div>
            </div>

            {/* Hero */}
            <section className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-8 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-4 md:flex md:flex-row md:items-start md:gap-6"
                    >
                        <div className="w-9 h-9 md:w-20 md:h-20 rounded-xl bg-blue-50 flex items-center justify-center overflow-hidden shrink-0">
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
                                        return <IconComponent className="h-5 w-5 md:h-10 md:w-10" />;
                                    })()}
                                </div>
                            )}
                        </div>
                        <div className="contents md:block">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground self-center">
                                {category.name}
                            </h1>

                            <div className="col-span-2 text-muted-foreground text-lg">
                                {category.description && <RichTextViewer value={category.description} />}
                            </div>
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
                    <h2 className="font-bold text-foreground mb-6 flex items-center gap-2">
                        {filterStatus === 'all' ? 'Visi solījumi' : STATUS_CONFIG[filterStatus].label}
                        <span className="text-muted-foreground font-normal text-lg">
                            ({filteredPromises.length})
                        </span>
                    </h2>

                    {filteredPromises.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredPromises.map((promise, index) => (
                                <PromiseCard key={promise.id} promise={promise} index={index} />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-border/50">
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    {filterStatus === 'all'
                                        ? 'Šajā kategorijā nav reģistrētu solījumu.'
                                        : `Nav atrasti solījumi ar statusu "${STATUS_CONFIG[filterStatus].label}".`}
                                </p>
                                {filterStatus !== 'all' && (
                                    <Button variant="outline" onClick={() => setFilterStatus('all')} className="mt-4">
                                        Rādīt visus solījumus
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </div>
    );
};
