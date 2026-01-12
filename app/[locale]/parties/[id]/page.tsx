"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PromiseCard } from '@/components/PromiseCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPartyById, getPromisesByParty, parties } from '@/lib/data';
import { PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { ArrowLeft, CheckCircle2, Clock, XCircle, CircleDot, HelpCircle } from 'lucide-react';

const PartyDetail = () => {
    const params = useParams();
    const id = params?.id as string;
    const party = id ? getPartyById(id) : undefined;

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

    const partyPromises = getPromisesByParty(party.id);

    const stats = {
        total: partyPromises.length,
        kept: partyPromises.filter(p => p.status === 'kept').length,
        partiallyKept: partyPromises.filter(p => p.status === 'partially-kept').length,
        inProgress: partyPromises.filter(p => p.status === 'in-progress').length,
        broken: partyPromises.filter(p => p.status === 'broken').length,
        notRated: partyPromises.filter(p => p.status === 'not-rated').length,
    };

    const statCards = [
        { status: 'kept' as PromiseStatus, count: stats.kept, icon: CheckCircle2, color: 'text-status-kept', bg: 'bg-status-kept-bg' },
        { status: 'partially-kept' as PromiseStatus, count: stats.partiallyKept, icon: CircleDot, color: 'text-status-partially', bg: 'bg-status-partially-bg' },
        { status: 'in-progress' as PromiseStatus, count: stats.inProgress, icon: Clock, color: 'text-status-progress', bg: 'bg-status-progress-bg' },
        { status: 'broken' as PromiseStatus, count: stats.broken, icon: XCircle, color: 'text-status-broken', bg: 'bg-status-broken-bg' },
        { status: 'not-rated' as PromiseStatus, count: stats.notRated, icon: HelpCircle, color: 'text-status-unrated', bg: 'bg-status-unrated-bg' },
    ];

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
                        className="flex flex-col md:flex-row items-center md:items-start gap-6"
                    >
                        <div className="flex-1 text-center md:text-left">
                            {/* Row 1: Name + Initial */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                                    {party.name}
                                </h1>
                                <span className="text-2xl font-bold text-muted-foreground bg-muted px-3 py-1 rounded-lg">
                                    {party.abbreviation}
                                </span>
                            </div>

                            {/* Row 2: Status Badge */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
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
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-8 border-b border-border/50">
                <div className="container-wide">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
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
                                                <Icon className={`h-5 w-5 ${stat.color}`} />
                                            </div>
                                            <div className="text-2xl font-bold text-foreground">{stat.count}</div>
                                            <div className="text-xs text-muted-foreground">{STATUS_CONFIG[stat.status].label}</div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Progress Bar */}
                    {stats.total > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="mt-6"
                        >
                            <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                                {stats.kept > 0 && (
                                    <div
                                        className="h-full bg-status-kept transition-all duration-500"
                                        style={{ width: `${(stats.kept / stats.total) * 100}%` }}
                                    />
                                )}
                                {stats.partiallyKept > 0 && (
                                    <div
                                        className="h-full bg-status-partially transition-all duration-500"
                                        style={{ width: `${(stats.partiallyKept / stats.total) * 100}%` }}
                                    />
                                )}
                                {stats.inProgress > 0 && (
                                    <div
                                        className="h-full bg-status-progress transition-all duration-500"
                                        style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                                    />
                                )}
                                {stats.broken > 0 && (
                                    <div
                                        className="h-full bg-status-broken transition-all duration-500"
                                        style={{ width: `${(stats.broken / stats.total) * 100}%` }}
                                    />
                                )}
                                {stats.notRated > 0 && (
                                    <div
                                        className="h-full bg-status-unrated transition-all duration-500"
                                        style={{ width: `${(stats.notRated / stats.total) * 100}%` }}
                                    />
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Promises */}
            <section className="py-8 md:py-12">
                <div className="container-wide">
                    <h2 className="text-2xl font-bold text-foreground mb-6">
                        Visi solījumi ({stats.total})
                    </h2>

                    {partyPromises.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {partyPromises.map((promise, index) => (
                                <PromiseCard key={promise.id} promise={promise} index={index} />
                            ))}
                        </div>
                    ) : (
                        <Card className="border-border/50">
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    Šai partijai nav reģistrētu solījumu.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </div>
    );
};

export default PartyDetail;
