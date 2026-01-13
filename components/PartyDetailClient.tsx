"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PromiseCard } from '@/components/PromiseCard';
import { PerformanceCard } from '@/components/PerformanceCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { ArrowLeft, Globe } from 'lucide-react';
import { PartyUI, PromiseUI } from '@/lib/db';

interface PartyDetailClientProps {
    party: PartyUI | null;
    promises: PromiseUI[];
}

export const PartyDetailClient = ({ party, promises }: PartyDetailClientProps) => {
    const [filterStatus, setFilterStatus] = useState<PromiseStatus | 'all'>('all');

    if (!party) {
        return (
            <div className="flex flex-col bg-background min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Partija nav atrasta</h1>
                    <Link href="/parties" suppressHydrationWarning>
                        <Button>Atpakaļ uz partijām</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const stats = {
        total: promises.length,
        kept: promises.filter(p => p.status === 'kept').length,
        partiallyKept: promises.filter(p => p.status === 'partially-kept').length,
        inProgress: promises.filter(p => p.status === 'in-progress').length,
        broken: promises.filter(p => p.status === 'broken').length,
        notRated: promises.filter(p => p.status === 'not-rated').length,
    };

    const filteredPromises = promises.filter(p =>
        filterStatus === 'all' ? true : p.status === filterStatus
    );

    return (
        <div className="flex flex-col bg-background">
            {/* Breadcrumb */}
            <div className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-4">
                    <Link
                        href="/parties"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        suppressHydrationWarning
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Atpakaļ uz partijām
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
                        className="flex flex-col md:flex-row items-start gap-6"
                    >
                        <div className="flex-1 text-left">
                            {/* Row 1: Name + Initial */}
                            <div className="flex flex-wrap items-center justify-start gap-4 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                    {party.name}
                                </h1>
                                {party.logoUrl ? (
                                    <div className="h-10 w-auto min-w-[40px] relative flex items-center justify-center">
                                        <img
                                            src={party.logoUrl}
                                            alt={party.abbreviation}
                                            className={`h-full w-auto object-contain ${(party.slug === 'prog' || party.slug === 'jv') ? 'p-1' : ''
                                                }`}
                                        />
                                    </div>
                                ) : (
                                    <span className="text-2xl font-bold text-muted-foreground bg-muted px-3 py-1 rounded-lg">
                                        {party.abbreviation}
                                    </span>
                                )}
                            </div>

                            {/* Row 2: Status Badge */}
                            <div className="flex flex-wrap items-center justify-start gap-3 mt-4">
                                {party.isInCoalition ? (
                                    <span className="px-3 py-1 bg-muted/60 text-muted-foreground text-sm font-medium rounded-full border border-border/50">
                                        Koalīcijā
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-muted/60 text-muted-foreground text-sm font-medium rounded-full border border-border/50">
                                        Opozīcijā
                                    </span>
                                )}
                            </div>

                            {/* Row 3: Description & Link */}
                            {(party.description || party.websiteUrl) && (
                                <div className="mt-6 max-w-2xl">
                                    {party.description && (
                                        <p className="text-muted-foreground mb-4 leading-relaxed">
                                            {party.description}
                                        </p>
                                    )}
                                    {party.websiteUrl && (
                                        <a
                                            href={party.websiteUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                                        >
                                            <Globe className="h-4 w-4" />
                                            Partijas mājaslapa
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Performance Section */}
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
                    <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                        {filterStatus === 'all' ? 'Visi solījumi' : STATUS_CONFIG[filterStatus].label}
                        <span className="text-muted-foreground font-normal text-lg">
                            ({filteredPromises.length})
                        </span>
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
                                    {filterStatus === 'all'
                                        ? 'Šai partijai nav reģistrētu solījumu.'
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
