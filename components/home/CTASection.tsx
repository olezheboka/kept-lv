"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertCircle } from "lucide-react";

export function CTASection() {
    return (
        <section className="py-10 md:py-16 bg-card border-t border-border">
            <div className="container-wide">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="grid md:grid-cols-2 gap-6 md:gap-8"
                >
                    {/* Suggest Promise */}
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 flex flex-col items-start hover:border-primary/20 transition-colors">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                            <Lightbulb className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                            Ieteikt solījumu
                        </h3>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Ir ideja uzlabojumiem vai konkrēts solījums, ko pievienot? Padod ziņu, un mēs izskatīsim.
                        </p>
                        <Link href="mailto:info@solijums.lv?subject=Jauns%20solījums" className="mt-auto" suppressHydrationWarning>
                            <Button size="lg" className="font-semibold">
                                Iesniegt priekšlikumu
                            </Button>
                        </Link>
                    </div>

                    {/* Report Issue */}
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 flex flex-col items-start hover:border-destructive/20 transition-colors">
                        <div className="h-12 w-12 rounded-xl bg-[#DC2626]/10 flex items-center justify-center text-[#DC2626] mb-6">
                            <AlertCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                            Paziņot par problēmu
                        </h3>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            Pamanīji neprecizitāti datos vai tehnisku kļūdu? Dod mums ziņu, lai varam to pēc iespējas ātrāk novērst.
                        </p>
                        <Link href="mailto:support@solijums.lv?subject=Kļūda%20vai%20problēma" className="mt-auto" suppressHydrationWarning>
                            <Button size="lg" variant="outline" className="font-semibold text-[#DC2626] border-[#DC2626] hover:bg-[#DC2626] hover:text-white">
                                Ziņot par kļūdu
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
