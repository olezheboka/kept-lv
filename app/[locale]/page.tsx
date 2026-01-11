"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PromiseCard } from "@/components/PromiseCard";

import { StatsPieChart } from "@/components/StatsPieChart";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    promises,

    getPromiseStats,
    getFeaturedPromises,
    getPoliticianById,
} from "@/lib/data";
import { CATEGORIES } from "@/lib/types";
import {
    ArrowRight,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { lv } from "date-fns/locale";

const Index = () => {
    const stats = getPromiseStats();
    const featuredPromises = getFeaturedPromises().slice(0, 4);

    // Get recent updates (sorted by statusUpdatedAt)
    const recentUpdates = [...promises]
        .sort(
            (a, b) =>
                new Date(b.statusUpdatedAt).getTime() -
                new Date(a.statusUpdatedAt).getTime(),
        )
        .slice(0, 5);

    return (
        <div className="flex flex-col bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-red-50/50 via-background to-background border-b border-border/50">
                <div className="container-wide py-10 md:py-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className=""
                        >
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground max-w-3xl mx-auto text-balance">
                                Pārredzama un objektīva platforma, kas uzrauga valdības solījumu
                                izpildi un veicina politisko atbildību.
                            </h1>
                        </motion.div>


                    </div>
                </div>

                {/* Decorative elements - Flag inspired gradient */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
            </section>

            {/* Quick Stats Bar */}
            <section className="border-b border-border bg-card">
                <div className="container-wide py-4">
                    <div className="flex items-center justify-center gap-6 md:gap-12 overflow-x-auto">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-status-kept" />
                            <span className="text-sm font-medium text-foreground">
                                {stats.kept} Izpildīti
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Clock className="h-4 w-4 text-status-progress" />
                            <span className="text-sm font-medium text-foreground">
                                {stats.inProgress} Procesā
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <XCircle className="h-4 w-4 text-status-broken" />
                            <span className="text-sm font-medium text-foreground">
                                {stats.broken} Lauzti
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Promises */}
            <section className="py-16 md:py-20">
                <div className="container-wide">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                Aktuālie solījumi
                            </h2>
                            <p className="text-muted-foreground">
                                Svarīgākie solījumi, ko šobrīd uzraugām
                            </p>
                        </div>
                        <Link href="/promises">
                            <Button variant="ghost" className="hidden md:flex gap-2">
                                Skatīt visus <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {featuredPromises.map((promise, index) => (
                            <PromiseCard key={promise.id} promise={promise} index={index} />
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link href="/promises">
                            <Button variant="outline" className="gap-2">
                                Skatīt visus solījumus <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Statistics & Updates Grid */}
            <section className="py-16 md:py-20 bg-surface-muted border-y border-border/50">
                <div className="container-wide">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Pie Chart */}
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Kopējā statistika
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                Visu solījumu sadalījums pēc statusa
                            </p>
                            <Card className="border-border/50">
                                <CardContent className="p-8">
                                    <StatsPieChart />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Updates */}
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Pēdējie atjauninājumi
                            </h2>
                            <p className="text-muted-foreground mb-8">
                                Jaunākās izmaiņas solījumu statusos
                            </p>
                            <Card className="border-border/50">
                                <CardContent className="p-4">
                                    <div className="space-y-0">
                                        {recentUpdates.map((promise, index) => {
                                            const politician = getPoliticianById(promise.politicianId);
                                            return (
                                                <Link key={promise.id} href={`/promises/${promise.id}`}>
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                                    >
                                                        <StatusBadge
                                                            status={promise.status}
                                                            size="sm"
                                                            showIcon={false}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-foreground line-clamp-1">
                                                                {promise.title}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {politician?.name} •{" "}
                                                                {formatDistanceToNow(
                                                                    new Date(promise.statusUpdatedAt),
                                                                    { addSuffix: true, locale: lv },
                                                                )}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-16 md:py-20">
                <div className="container-wide">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                            Pārlūkot pēc kategorijas
                        </h2>
                        <p className="text-muted-foreground">
                            Izvēlieties jomas, kas jūs interesē visvairāk
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {CATEGORIES.slice(0, 8).map((category, index) => {
                            const count = promises.filter(
                                (p) => p.category === category.id,
                            ).length;
                            return (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/categories/${category.id}`}>
                                        <Card className="group border-border/50 hover:border-accent/50 hover:shadow-medium transition-all duration-300">
                                            <CardContent className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                                        <TrendingUp className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        {count} solījumi
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                                                    {category.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                    {category.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="mt-8 text-center">
                        <Link href="/categories">
                            <Button variant="outline" className="gap-2">
                                Visas kategorijas <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 md:py-20 bg-primary text-primary-foreground">
                <div className="container-wide">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Palīdziet mums uzraudzīt demokrātiju
                        </h2>
                        <p className="text-primary-foreground/80 mb-8 text-lg">
                            Ja pamanāt neprecizitāti vai vēlaties ieteikt jaunu solījumu
                            uzraudzībai, sazinieties ar mums.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/about">
                                <Button size="lg" variant="secondary" className="gap-2">
                                    Uzzināt vairāk
                                </Button>
                            </Link>
                            <Link href="/methodology">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="gap-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                                >
                                    Mūsu metodoloģija
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Index;
