"use client";

import { motion } from "framer-motion";

const segments = [
    { text: "Latvijas sabiedrības uzticēšanās politiskajiem institūtiem un politiķiem ir viena no zemākajām Eiropas Savienībā. Politiskajām partijām uzticas tikai ", bold: false },
    { text: "12,51%", bold: true },
    { text: " Latvijas iedzīvotāju, kas ir divas reizes zemāks rādītājs nekā vidēji OECD valstīs (", bold: false },
    { text: "24,5%", bold: true },
    { text: "). Parlamentam uzticas ", bold: false },
    { text: "28,72%", bold: true },
    { text: " iedzīvotāju, bet valdībai — tikai ", bold: false },
    { text: "24,5%", bold: true },
    { text: ".", bold: false },
];

export const QuoteTypewriter = () => {
    // Flatten segments into an array of characters with their styling
    const characters = segments.flatMap((segment) =>
        segment.text.split("").map((char) => ({
            char,
            bold: segment.bold
        }))
    );

    const container = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.015,
                delayChildren: 0.3,
            },
        },
    };

    const child = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    return (
        <motion.p
            className="text-base md:text-lg lg:text-xl text-foreground/90 leading-relaxed pl-8 md:pl-12 italic"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            {characters.map((item, index) => (
                <motion.span
                    key={index}
                    variants={child}
                    className={item.bold ? "text-foreground not-italic font-bold" : ""}
                >
                    {item.char}
                </motion.span>
            ))}
        </motion.p>
    );
};
