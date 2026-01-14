"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryUI } from '@/lib/db';
import { TrendingUp } from 'lucide-react';
import { SLUG_ICON_MAP } from '@/lib/categoryIcons';

interface CategoriesClientProps {
    categories: (CategoryUI & {
        stats: {
            total: number;
            kept: number;
            partiallyKept: number;
            inProgress: number;
            broken: number;
            notRated: number;
            // partial is deprecated in favor of partiallyKept
            partial?: number;
        }
    })[];
}

export const CategoriesClient = ({ categories }: CategoriesClientProps) => {
    return (
        <div className="flex flex-col bg-background">
            {/* Page Header */}
            <section className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-8 md:py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                            Kategorijas
                        </h1>
                        <p className="text-muted-foreground">
                            Pārlūkojiet solījumus pēc politikas jomas
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-8 md:py-12">
                <div className="container-wide">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {categories.map((category, index) => {
                            const { total, kept, partiallyKept, inProgress, broken, notRated } = category.stats;

                            return (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.03 }}
                                >
                                    <Link href={`/categories/${category.slug}`} className="block h-full">
                                        <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300 h-full">
                                            <CardContent className="p-6 flex flex-col h-full">
                                                {/* Header Step */}
                                                <div className="flex items-center gap-4 mb-6">
                                                    {/* Icon */}
                                                    <div className="shrink-0">
                                                        {category.imageUrl ? (
                                                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                                                                <img
                                                                    src={category.imageUrl}
                                                                    alt={category.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                                                                {(() => {
                                                                    const IconComponent = SLUG_ICON_MAP[category.slug] || TrendingUp;
                                                                    return <IconComponent className="h-6 w-6" />;
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <div>
                                                        <h3 className="text-base font-semibold text-foreground leading-tight group-hover:text-accent transition-colors mb-1">
                                                            {category.name}
                                                        </h3>
                                                        {category.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-1 hidden">
                                                                {category.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stats Bar (Always Visible) */}
                                                <div className="mt-auto">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                                        <span>{total} solījumi</span>
                                                        <span>{total > 0 ? Math.round((kept / total) * 100) : 0}% izpildīti</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                                                        {kept > 0 && (
                                                            <div
                                                                className="h-full bg-status-kept"
                                                                style={{ width: `${(kept / total) * 100}%` }}
                                                            />
                                                        )}
                                                        {partiallyKept > 0 && (
                                                            <div
                                                                className="h-full bg-status-partially"
                                                                style={{ width: `${(partiallyKept / total) * 100}%` }}
                                                            />
                                                        )}
                                                        {inProgress > 0 && (
                                                            <div
                                                                className="h-full bg-status-progress"
                                                                style={{ width: `${(inProgress / total) * 100}%` }}
                                                            />
                                                        )}
                                                        {broken > 0 && (
                                                            <div
                                                                className="h-full bg-status-broken"
                                                                style={{ width: `${(broken / total) * 100}%` }}
                                                            />
                                                        )}
                                                        {notRated > 0 && (
                                                            <div
                                                                className="h-full bg-status-unrated"
                                                                style={{ width: `${(notRated / total) * 100}%` }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};
