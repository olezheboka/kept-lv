"use client";

import { motion } from "framer-motion";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-gray-50/50 border-b border-border/50">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <div className="container-wide py-7 md:py-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight text-balance">
                            Seko līdzi politiķu un amatpersonu solījumiem un to izpildei
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                            Neatkarīga un objektīva platforma, kas atspoguļo valdības solījumu izpildi.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
