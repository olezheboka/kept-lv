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
                                {party && party.logoUrl ? (
                                    <div className="h-8 w-auto min-w-[32px] relative flex items-center justify-center flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={party.logoUrl}
                                            alt={party.abbreviation}
                                            className="h-full w-auto object-contain opacity-40"
                                        />
                                    </div>
                                ) : party ? (
                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-muted text-[10px] font-medium text-muted-foreground uppercase tracking-wider opacity-40">
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
                    {stats.total > 0 ? (
                        <Card className="overflow-hidden border-border/50">
                            <div className="flex flex-col lg:flex-row">
                                {/* Left: Hero (Kept Promises) */}
                                <div className="lg:w-5/12 p-6 border-b lg:border-b-0 lg:border-r border-border/50 bg-gradient-to-br from-muted to-background flex flex-col items-center justify-center text-center">
                                    <div className="relative w-32 h-32 mb-4">
                                        {/* Circular Progress */}
                                        <svg className="w-full h-full transform -rotate-90">
                                            {/* Track Background (Darker for contrast) */}
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="48"
                                                stroke="currentColor"
                                                strokeWidth="10"
                                                fill="transparent"
                                                className="text-border"
                                            />
                                            {/* Track (Inner Grey) */}
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="48"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="transparent"
                                                className="text-muted-foreground/20"
                                            />
                                            {/* Progress (Green) */}
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="48"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="transparent"
                                                strokeDasharray={2 * Math.PI * 48}
                                                strokeDashoffset={(2 * Math.PI * 48) - (keptPercentage / 100) * (2 * Math.PI * 48)}
                                                strokeLinecap="round"
                                                className="text-status-kept transition-all duration-1000 ease-out"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-bold text-foreground">
                                                {Math.round(keptPercentage)}%
                                            </span>
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Izpildīti</span>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-bold text-foreground">
                                        {stats.kept} <span className="text-muted-foreground font-normal">no {stats.total} solījumiem</span>
                                    </h3>
                                </div>

                                {/* Right: Status Grid */}
                                <div className="lg:w-7/12 p-6 bg-background">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 h-full content-center">
                                        {/* All Promises */}
                                        <button
                                            onClick={() => setFilterStatus('all')}
                                            className={`
                                                flex flex-col p-3 rounded-lg border transition-all text-left group
                                                ${filterStatus === 'all'
                                                    ? 'bg-primary/5 border-primary ring-1 ring-primary'
                                                    : 'bg-background border-border/50 hover:bg-muted/50 hover:border-border'}
                                            `}
                                        >
                                            <div className="mb-2 p-1.5 w-fit rounded-md bg-primary/10 text-primary">
                                                <List className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5 group-hover:text-primary transition-colors">
                                                Visi solījumi
                                            </span>
                                            <span className="text-xl font-bold text-foreground">
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
                                                        flex flex-col p-3 rounded-lg border transition-all text-left group
                                                        ${isActive
                                                            ? 'bg-accent/5 border-accent ring-1 ring-accent'
                                                            : 'bg-background border-border/50 hover:bg-muted/50 hover:border-border'}
                                                    `}
                                                >
                                                    <div className={`mb-2 p-1.5 w-fit rounded-md ${config.bg} bg-opacity-20`}>
                                                        <Icon className={`h-4 w-4 ${config.color}`} />
                                                    </div>
                                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5 group-hover:text-foreground transition-colors">
                                                        {STATUS_CONFIG[status].label}
                                                    </span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xl font-bold text-foreground">
                                                            {count}
                                                        </span>
                                                        <span className="text-xs font-medium text-muted-foreground">
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
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground text-sm">
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
