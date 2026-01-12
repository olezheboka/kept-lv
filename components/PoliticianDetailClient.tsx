"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/StatusBadge';
import { PartyBadge } from '@/components/PartyBadge';
import { PromiseCard } from '@/components/PromiseCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PromiseStatus, STATUS_CONFIG } from '@/lib/types';
import { ArrowLeft, CheckCircle2, Clock, XCircle, CircleDot, HelpCircle, List } from 'lucide-react';
import { PoliticianUI, PartyUI, PromiseUI } from '@/lib/db';

interface PoliticianDetailClientProps {
    politician: PoliticianUI;
    party: PartyUI | null;
    promises: PromiseUI[];
}

const STATUSES: PromiseStatus[] = ['kept', 'partially-kept', 'in-progress', 'broken', 'not-rated'];

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

    const stats = {
        total: promises.length,
        kept: promises.filter(p => p.status === 'kept').length,
        partiallyKept: promises.filter(p => p.status === 'partially-kept').length,
        inProgress: promises.filter(p => p.status === 'in-progress').length,
        broken: promises.filter(p => p.status === 'broken').length,
        notRated: promises.filter(p => p.status === 'not-rated').length,
    };

    // Calculate percentage for circular progress
    const keptPercentage = stats.total > 0 ? (stats.kept / stats.total) * 100 : 0;
    const circumference = 2 * Math.PI * 70; // r=70
    const strokeDashoffset = circumference - (keptPercentage / 100) * circumference;

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
                                {party && (
                                    <div className="flex items-center gap-3 bg-muted/50 pl-1 pr-4 py-1 rounded-full border border-border/50">
                                        <PartyBadge party={party} size="md" variant="avatar" className="shadow-sm" />
                                        <span className="text-lg font-medium text-foreground/80">
                                            {party.name}
                                        </span>
                                    </div>
                                )}
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
            <section className="py-8 border-b border-border/50">
                <div className="container-wide">
                    {stats.total > 0 ? (
                        <Card className="overflow-hidden border-border/50">
                            <div className="flex flex-col lg:flex-row">
                                {/* Left: Hero (Kept Promises) */}
                                <div className="lg:w-5/12 p-8 border-b lg:border-b-0 lg:border-r border-border/50 bg-gradient-to-br from-muted to-background flex flex-col items-center justify-center text-center">
                                    <div className="relative w-48 h-48 mb-6">
                                        {/* Circular Progress */}
                                        <svg className="w-full h-full transform -rotate-90">
                                            {/* Track Background (Darker for contrast) */}
                                            <circle
                                                cx="96"
                                                cy="96"
                                                r="70"
                                                stroke="currentColor"
                                                strokeWidth="14"
                                                fill="transparent"
                                                className="text-border"
                                            />
                                            {/* Track (Inner Grey) */}
                                            <circle
                                                cx="96"
                                                cy="96"
                                                r="70"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                className="text-muted-foreground/20"
                                            />
                                            {/* Progress (Green) */}
                                            <circle
                                                cx="96"
                                                cy="96"
                                                r="70"
                                                stroke="currentColor"
                                                strokeWidth="12"
                                                fill="transparent"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={strokeDashoffset}
                                                strokeLinecap="round"
                                                className="text-status-kept transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-3xl font-bold text-foreground">
                                                {Math.round(keptPercentage)}%
                                            </span>
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Izpildīti</span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground">
                                        {stats.kept} <span className="text-muted-foreground font-normal">no {stats.total} solījumiem</span>
                                    </h3>
                                </div>

                                {/* Right: Status Grid */}
                                <div className="lg:w-7/12 p-8 bg-background">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 h-full content-center">
                                        {/* All Promises */}
                                        <button
                                            onClick={() => setFilterStatus('all')}
                                            className={`
                                                flex flex-col p-4 rounded-xl border transition-all text-left group
                                                ${filterStatus === 'all'
                                                    ? 'bg-primary/5 border-primary ring-1 ring-primary'
                                                    : 'bg-background border-border/50 hover:bg-muted/50 hover:border-border'}
                                            `}
                                        >
                                            <div className="mb-3 p-2 w-fit rounded-lg bg-primary/10 text-primary">
                                                <List className="h-5 w-5" />
                                            </div>
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 group-hover:text-primary transition-colors">
                                                Visi solījumi
                                            </span>
                                            <span className="text-2xl font-bold text-foreground">
                                                {stats.total}
                                            </span>
                                        </button>

                                        {/* Other Statuses */}
                                        {STATUSES.map((status) => {

                                            // Mapping for icon and color 
                                            // Note: kept is handled separately
                                            const config = {
                                                'kept': { icon: CheckCircle2, color: 'text-status-kept', bg: 'bg-status-kept-bg' },
                                                'partially-kept': { icon: CircleDot, color: 'text-status-partially', bg: 'bg-status-partially-bg' },
                                                'in-progress': { icon: Clock, color: 'text-status-progress', bg: 'bg-status-progress-bg' },
                                                'broken': { icon: XCircle, color: 'text-status-broken', bg: 'bg-status-broken-bg' },
                                                'not-rated': { icon: HelpCircle, color: 'text-status-unrated', bg: 'bg-status-unrated-bg' },
                                            }[status as string] || { icon: HelpCircle, color: 'text-status-unrated', bg: 'bg-status-unrated-bg' };

                                            const Icon = config.icon;
                                            const count = stats[status === 'partially-kept' ? 'partiallyKept' : status === 'in-progress' ? 'inProgress' : status === 'not-rated' ? 'notRated' : status];
                                            const isActive = filterStatus === status;

                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() => setFilterStatus(status)}
                                                    className={`
                                                        flex flex-col p-4 rounded-xl border transition-all text-left group
                                                        ${isActive
                                                            ? 'bg-accent/5 border-accent ring-1 ring-accent'
                                                            : 'bg-background border-border/50 hover:bg-muted/50 hover:border-border'}
                                                    `}
                                                >
                                                    <div className={`mb-3 p-2 w-fit rounded-lg ${config.bg} bg-opacity-20`}>
                                                        <Icon className={`h-5 w-5 ${config.color}`} />
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 group-hover:text-foreground transition-colors">
                                                        {STATUS_CONFIG[status].label}
                                                    </span>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-2xl font-bold text-foreground">
                                                            {count}
                                                        </span>
                                                        <span className="text-sm font-medium text-muted-foreground">
                                                            / {stats.total}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card className="border-border/50">
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    Dati tiek apkopoti...
                                </p>
                            </CardContent>
                        </Card>
                    )}
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
