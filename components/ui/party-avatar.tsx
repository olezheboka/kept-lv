
import { cn } from "@/lib/utils";

interface PartyAvatarProps {
    abbreviation: string;
    name?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    color?: string;
}

const sizeClasses = {
    sm: "h-5 w-5 text-[8px]",
    md: "h-7 w-7 text-[9px]",
    lg: "h-8 w-8 text-[11px]",
    xl: "h-10 w-10 text-xs",
};

export function PartyAvatar({ abbreviation, size = "md", className, color }: PartyAvatarProps) {
    // Ensure abbreviation is short enough, or handle it? 
    // User asked for "widely used party abbreviations", assuming they fit.
    // We'll trust the DB abbreviation for now, maybe truncate if really long.

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center font-bold flex-shrink-0 uppercase tracking-tight overflow-hidden",
                !color && "bg-muted text-muted-foreground border border-border/50",
                color && "text-white border-2 border-white",
                sizeClasses[size],
                className
            )}
            style={color ? { backgroundColor: color } : undefined}
        >
            <span className="truncate px-0.5">{abbreviation}</span>
        </div>
    );
}
