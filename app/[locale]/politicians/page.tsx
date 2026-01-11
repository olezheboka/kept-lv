"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PartyBadge } from '@/components/PartyBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { politicians, parties, getPartyById, getPromisesByPolitician } from '@/lib/data';
import { Search } from 'lucide-react';

const Politicians = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedParty, setSelectedParty] = useState<string>('');
    const [showInOffice, setShowInOffice] = useState(false);

    const filteredPoliticians = useMemo(() => {
        let result = [...politicians];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.role.toLowerCase().includes(query)
            );
        }

        if (selectedParty) {
            result = result.filter(p => p.partyId === selectedParty);
        }

        if (showInOffice) {
            result = result.filter(p => p.isInOffice);
        }

        return result;
    }, [searchQuery, selectedParty, showInOffice]);

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
                            Politiķi
                        </h1>
                        <p className="text-muted-foreground">
                            Sekojiet līdzi {politicians.length} Latvijas politiķu solījumiem
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <section className="py-8">
                <div className="container-wide">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1 max-w-md">
                            <Input
                                type="search"
                                placeholder="Meklēt politiķi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>

                        <select
                            value={selectedParty}
                            onChange={(e) => setSelectedParty(e.target.value)}
                            className="h-10 px-3 rounded-lg border border-input bg-background text-sm"
                        >
                            <option value="">Visas partijas</option>
                            {parties.map(party => (
                                <option key={party.id} value={party.id}>{party.name}</option>
                            ))}
                        </select>

                        <Button
                            variant={showInOffice ? 'secondary' : 'outline'}
                            onClick={() => setShowInOffice(!showInOffice)}
                        >
                            Tikai amatā
                        </Button>
                    </div>

                    {/* Results */}
                    <p className="text-sm text-muted-foreground mb-6">
                        Atrasti {filteredPoliticians.length} politiķi
                    </p>

                    {/* Politicians Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredPoliticians.map((politician, index) => {
                            const party = getPartyById(politician.partyId);
                            const politicianPromises = getPromisesByPolitician(politician.id);
                            const keptCount = politicianPromises.filter(p => p.status === 'kept').length;
                            const brokenCount = politicianPromises.filter(p => p.status === 'broken').length;
                            const inProgressCount = politicianPromises.filter(p => p.status === 'in-progress').length;
                            const total = politicianPromises.length;

                            return (
                                <motion.div
                                    key={politician.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.03 }}
                                >
                                    <Link href={`/politicians/${politician.id}`}>
                                        <Card className="group overflow-hidden border-border/50 hover:shadow-elevated hover:border-border transition-all duration-300">
                                            <CardContent className="p-5">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                                                        {party?.logoUrl ? (
                                                            <AvatarImage src={party.logoUrl} alt={party.name} />
                                                        ) : null}
                                                        <AvatarFallback
                                                            className="text-lg font-bold text-white uppercase"
                                                            style={{ backgroundColor: party?.color || '#333' }}
                                                        >
                                                            {party?.abbreviation || '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                                                            {politician.name}
                                                        </h3>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {politician.role}
                                                        </p>
                                                        {politician.isInOffice ? (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-status-kept-bg text-status-kept text-xs font-medium rounded-full">
                                                                Amatā
                                                            </span>
                                                        ) : (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                                                                Bijušais
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {party && (
                                                    <div className="mb-4">
                                                        <PartyBadge party={party} size="sm" />
                                                    </div>
                                                )}

                                                {/* Stats Bar */}
                                                {total > 0 && (
                                                    <div>
                                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                                            <span>{total} solījumi</span>
                                                            <span>{Math.round((keptCount / total) * 100)}% izpildīti</span>
                                                        </div>
                                                        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                                                            {keptCount > 0 && (
                                                                <div
                                                                    className="h-full bg-status-kept"
                                                                    style={{ width: `${(keptCount / total) * 100}%` }}
                                                                />
                                                            )}
                                                            {inProgressCount > 0 && (
                                                                <div
                                                                    className="h-full bg-status-progress"
                                                                    style={{ width: `${(inProgressCount / total) * 100}%` }}
                                                                />
                                                            )}
                                                            {brokenCount > 0 && (
                                                                <div
                                                                    className="h-full bg-status-broken"
                                                                    style={{ width: `${(brokenCount / total) * 100}%` }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
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

export default Politicians;
