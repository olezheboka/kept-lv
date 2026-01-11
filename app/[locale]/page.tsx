"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PromiseCard } from "@/components/PromiseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    promises,
    getFeaturedPromises,
    getPoliticianRankings,
    getPartyRankings,
} from "@/lib/data";
import { RankingCard } from "@/components/RankingCard";
import { CATEGORIES } from "@/lib/types";
import {
    ArrowRight,
    TrendingUp,
    Quote,
} from "lucide-react";

const Index = () => {
    const featuredPromises = getFeaturedPromises().slice(0, 4);

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
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
                                Sekojam līdzi <span className="text-[#9E1B34]">Latvijas</span> politiķu solījumiem.
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                                Pārredzama un objektīva platforma, kas uzrauga valdības solījumu
                                izpildi un veicina politisko atbildību.
                            </p>
                        </motion.div>


                    </div>
                </div>

                {/* Decorative elements - Flag inspired gradient */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
            </section>

            {/* Featured Promises */}
            <section className="pt-8 pb-16 md:pt-12 md:pb-20">
                <div className="container-wide">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                Aktuālie solījumi
                            </h2>

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

            {/* Leaderboards */}
            <section className="py-16 md:py-20 bg-muted/30 border-y border-border/50">
                <div className="container-wide">
                    <div className="grid md:grid-cols-2 gap-8">
                        <RankingCard
                            title="Uzticamākie politiķi"
                            type="politician"
                            data={getPoliticianRankings()}
                        />
                        <RankingCard
                            title="Uzticamākās partijas"
                            type="party"
                            data={getPartyRankings()}
                        />
                    </div>
                </div>
            </section>

            {/* Trust Context Section */}
            <section className="py-12 md:py-16 bg-primary/5">
                <div className="container-wide">
                    <div className="max-w-4xl mx-auto">
                        <blockquote className="relative">
                            <Quote className="absolute -top-2 -left-2 md:-top-4 md:-left-4 h-8 w-8 md:h-12 md:w-12 text-primary/20" />
                            <p className="text-base md:text-lg lg:text-xl text-foreground/90 leading-relaxed pl-8 md:pl-12 italic">
                                Latvijas sabiedrības uzticēšanās politiskajiem institūtiem un politiķiem ir viena no zemākajām Eiropas Savienībā. Politiskajām partijām uzticas tikai <strong className="text-foreground not-italic">12,51%</strong> Latvijas iedzīvotāju, kas ir divas reizes zemāks rādītājs nekā vidēji OECD valstīs (<strong className="text-foreground not-italic">24,5%</strong>). Parlamentam uzticas <strong className="text-foreground not-italic">28,72%</strong> iedzīvotāju, bet valdībai — tikai <strong className="text-foreground not-italic">24,5%</strong>.
                            </p>
                            <footer className="mt-4 pl-8 md:pl-12">
                                <a
                                    href="https://lvportals.lv/skaidrojumi/346761-aptauja-tikai-13-iedzivotaju-uzskata-ka-var-ietekmet-valdibas-lemumus-2022"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    — LV Portāls, 2022
                                </a>
                            </footer>
                        </blockquote>
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
