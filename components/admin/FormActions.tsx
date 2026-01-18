"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormActionsProps {
    loading?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
    className?: string;
}

export function FormActions({
    loading,
    submitLabel = "Save",
    onCancel,
    className
}: FormActionsProps) {
    return (
        <>
            {/* Spacer to prevent content from being hidden behind fixed footer */}
            <div className="h-20" />

            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-50 py-4 px-6 bg-white/80 backdrop-blur-md dark:bg-slate-950/80 border-t flex justify-center",
                className
            )}>
                <div className="w-full max-w-5xl flex items-center justify-end gap-3 px-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="min-w-[100px]"
                    >
                        {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
                        {submitLabel}
                    </Button>
                </div>
            </div>
        </>
    );
}
