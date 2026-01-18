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
        <div className={cn("flex gap-3 pt-4 border-t mt-6", className)}>
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
    );
}
