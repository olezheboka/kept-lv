import { cn } from "@/lib/utils";

interface EntityBadgeProps {
    children: React.ReactNode;
    variant?: "party" | "coalition";
    className?: string;
}

export function EntityBadge({ children, variant = "party", className }: EntityBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                variant === "party" && "bg-blue-50 text-blue-700 border-blue-100",
                variant === "coalition" && "bg-purple-50 text-purple-700 border-purple-100",
                className
            )}
        >
            {children}
        </span>
    );
}
