"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
    words: string[];
    className?: string;
    waitTime?: number;
    eraseSpeed?: number;
    typeSpeed?: number;
}

export function TypewriterText({
    words,
    className,
    waitTime = 3000,
    eraseSpeed = 60,
    typeSpeed = 100,
}: TypewriterTextProps) {
    const elementRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || words.length === 0) return;

        // --- 1. Measure longest word safely ---
        // We need to prevent layout shift by fixing the width to the longest word.
        // We measure this at runtime to account for variable fonts.

        let maxWidth = 0;

        // Using a temporary clone to measure without flashing layout changes
        const tempSpan = document.createElement("span");
        tempSpan.style.visibility = "hidden";
        tempSpan.style.position = "absolute";
        tempSpan.style.whiteSpace = "nowrap";
        // Copy relevant styles to ensure accurate measurement
        const computedStyle = window.getComputedStyle(element);
        tempSpan.style.font = computedStyle.font;
        tempSpan.style.fontWeight = computedStyle.fontWeight;
        tempSpan.style.fontSize = computedStyle.fontSize;
        tempSpan.style.letterSpacing = computedStyle.letterSpacing;
        document.body.appendChild(tempSpan);

        words.forEach(word => {
            tempSpan.textContent = word;
            const width = tempSpan.offsetWidth;
            if (width > maxWidth) {
                maxWidth = width;
            }
        });

        document.body.removeChild(tempSpan);

        // Apply the calculated width and formatting
        element.style.minWidth = `${maxWidth}px`;
        element.style.display = "inline-block";
        element.style.textAlign = "center";

        // --- 2. Animation Logic ---

        // Variables
        let wordIndex = 0;
        let isCancelled = false;
        let timeoutId: NodeJS.Timeout;

        function type(word: string, callback: () => void) {
            let charIndex = 0;

            function step() {
                if (isCancelled) return;

                if (element) {
                    element.textContent = word.substring(0, charIndex + 1);
                }
                charIndex++;

                if (charIndex < word.length) {
                    timeoutId = setTimeout(step, typeSpeed);
                } else {
                    callback();
                }
            }

            step();
        }

        function erase(callback: () => void) {
            if (isCancelled || !element) return;

            let text = element.textContent || "";

            function step() {
                if (isCancelled) return;

                if (text.length > 0) {
                    text = text.substring(0, text.length - 1);
                    if (element) element.textContent = text;
                    timeoutId = setTimeout(step, eraseSpeed);
                } else {
                    // Small pause before typing next word
                    timeoutId = setTimeout(callback, 300);
                }
            }

            step();
        }

        function loop() {
            if (isCancelled) return;

            timeoutId = setTimeout(() => {
                erase(() => {
                    wordIndex = (wordIndex + 1) % words.length;
                    const nextWord = words[wordIndex];
                    type(nextWord, loop);
                });
            }, waitTime);
        }

        // Start animation loop
        loop();

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };
    }, [words, waitTime, eraseSpeed, typeSpeed]);

    return (
        <span
            ref={elementRef}
            className={cn(
                "relative text-primary whitespace-nowrap",
                // Cursor blinking animation
                "after:content-[''] after:inline-block after:w-[2px] after:h-[1.1em] after:bg-primary after:ml-[2px] after:align-bottom after:animate-cursor-blink after:opacity-100",
                className
            )}
            aria-hidden="true"
        >
            {words[0]}
        </span>
    );
}
