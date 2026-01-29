import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    isCompact?: boolean;
}

export const Logo = ({ className, isCompact }: LogoProps) => {
    return (
        <Link href="/" className={cn("flex items-center gap-2.5 flex-shrink-0", className)} suppressHydrationWarning>
            <span
                className={cn(
                    "font-bold text-2xl text-[#2563EB] origin-left transition-all duration-300",
                    isCompact && "scale-75 -translate-x-2.5"
                )}
            >
                solījums.lv
            </span>
        </Link>
    );
};
