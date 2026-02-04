"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    className?: string;
    variant?: "default" | "link";
    children?: React.ReactNode;
}

export function BackButton({ className, variant = "default", children }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    if (variant === "link") {
        return (
            <button
                onClick={handleBack}
                className={cn(
                    "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors",
                    className
                )}
                type="button"
            >
                <ArrowLeft className="h-4 w-4" />
                {children || "Atpakaļ"}
            </button>
        );
    }

    return (
        <Button onClick={handleBack} className={className}>
            {children || "Atpakaļ"}
        </Button>
    );
}
