"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
// import { StatusBadge } from '@/components/StatusBadge';
// import { PartyBadge } from '@/components/PartyBadge';
import { PromiseCard } from '@/components/PromiseCard';
import { PerformanceCard } from '@/components/PerformanceCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import { PoliticianUI, PartyUI, PromiseUI } from '@/lib/db';

interface PoliticianDetailClientProps {
    politician: PoliticianUI;
    party: PartyUI | null;
    promises: PromiseUI[];
}



export const PoliticianDetailClient = ({ politician, party, promises }: PoliticianDetailClientProps) => {
    const [filterStatus, setFilterStatus] = useState<PromiseStatus | 'all'>('all');

    if (!politician) {
        return (
            <div className="flex flex-col bg-background min-h-[50vh] items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Politiķis nav atrasta</h1>
                    <Link href="/politicians" suppressHydrationWarning>
                        <Button>Atpakaļ uz politiķiem</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const filteredPromises = promises.filter(p =>
        filterStatus === 'all' ? true : p.status === filterStatus
    );

    // Stats calculation
    const stats = {
        total: promises.length,
        kept: promises.filter(p => p.status === 'kept').length,
        partiallyKept: promises.filter(p => p.status === 'partially-kept').length,
        inProgress: promises.filter(p => p.status === 'in-progress').length,
        broken: promises.filter(p => p.status === 'broken').length,
        cancelled: promises.filter(p => p.status === 'cancelled').length,
    };

    return (
        <div className="flex flex-col bg-background">
            {/* Breadcrumb */}
            <div className="bg-surface-muted border-b border-border/50">
                <div className="container-wide py-4">
                    <Link
                        href="/politicians"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        suppressHydrationWarning
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Atpakaļ uz politiķiem
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
                            {/* Row 1: Name + Party Badge */}
                            <div className="flex flex-wrap items-center justify-start gap-4 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                    {politician.name}
                                </h1>
                                {party && party.logoUrl ? (
                                    <div className="h-9 w-auto min-w-[36px] relative flex items-center justify-center flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={party.logoUrl}
                                            alt={party.abbreviation}
                                            className="h-full w-auto object-contain"
                                        />
                                    </div>
                                ) : party ? (
                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-muted text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                        {party.abbreviation}
                                    </span>
                                ) : null}
                            </div>

                            {/* Row 2: Role + Amatā Badge */}
                            <div className="flex flex-wrap items-center justify-start gap-3 text-lg text-muted-foreground">
                                <span>{politician.role}</span>
                                {politician.isInOffice ? (
                                    <span className="px-2.5 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                                        Amatā
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                                        Bijušais
                                    </span>
                                )}
                            </div>

                            {/* Row 3: Bio */}
                            {politician.bio && (
                                <div className="mt-6 max-w-2xl">
                                    <p className="text-muted-foreground leading-relaxed">
                                        {politician.bio}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Performance Section */}
            <section className="py-4 border-b border-border/50">
                <div className="container-wide">
                    <PerformanceCard
                        stats={stats}
                        filterStatus={filterStatus}
                        onFilterChange={setFilterStatus}
                    />
                </div>
            </section>

            {/* Promises List */}
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
                                        ? 'Šim politiķim nav reģistrētu solījumu.'
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
