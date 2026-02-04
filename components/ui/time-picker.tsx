"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimePickerProps {
    value?: string;
    onChange: (value: string) => void;
    className?: string;
}

const PRESETS = [
    { label: "Morning", value: "09:00" },
    { label: "Noon", value: "12:00" },
    { label: "Afternoon", value: "15:00" },
    { label: "Evening", value: "18:00" },
];

export function TimePicker({ value = "00:00", onChange, className }: TimePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Parse value
    const [hours, minutes] = value.split(":");
    const selectedHour = parseInt(hours, 10);
    const selectedMinute = parseInt(minutes, 10);

    // Generate options
    const hoursList = Array.from({ length: 24 }, (_, i) => i);
    // Minutes in steps of 5 for cleaner UI (could be 1 if needed, but image implies 05, 10, 15)
    // Image shows "00", "05", "10". So step 5 seems appropriate. 
    // If exact minute needed, user might need another way, but strict 5-min step is common in pickers.
    const minutesList = Array.from({ length: 12 }, (_, i) => i * 5);

    const handleHourClick = (h: number) => {
        const newTime = `${h.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
        onChange(newTime);
    };

    const handleMinuteClick = (m: number) => {
        const newTime = `${selectedHour.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        onChange(newTime);
    };

    // Scroll to selected item on open
    const hourRef = React.useRef<HTMLDivElement>(null);
    const minuteRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            // Logic to scroll to element can be complex in React without specific IDs or refs per item.
            // For now, we rely on user scrolling or simple scrollIntoView if we attached refs to items.
            // Let's settle for just rendering.
        }
    }, [isOpen]);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal bg-background px-3 h-10",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <span>{value}</span>
                    <Clock className="ml-auto h-4 w-4 text-muted-foreground opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4 bg-white dark:bg-slate-950 rounded-xl shadow-xl" align="start">
                {/* Presets */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => {
                                onChange(preset.value);
                                // Optional: Close on preset click? No, allow fine tuning.
                            }}
                            className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#FFF8E7] text-[#5C4033] hover:bg-[#F5E6CC] transition-colors whitespace-nowrap dark:bg-yellow-900/30 dark:text-yellow-100"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Columns Container */}
                <div className="flex gap-8 relative items-start justify-center">

                    {/* Hours Column */}
                    <div className="flex flex-col items-center gap-2 h-[300px]">
                        <span className="text-xs font-medium text-muted-foreground mb-1">Hour</span>
                        <ScrollArea className="h-full w-[60px] pr-2">
                            <div className="flex flex-col gap-1 items-center pb-20">
                                {hoursList.map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => handleHourClick(h)}
                                        className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all",
                                            selectedHour === h
                                                ? "bg-blue-600 text-white font-semibold shadow-sm"
                                                : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        {h.toString().padStart(2, "0")}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Separator */}
                    <div className="pt-8 text-xl font-bold text-muted-foreground self-start mt-2">:</div>

                    {/* Minutes Column */}
                    <div className="flex flex-col items-center gap-2 h-[300px]">
                        <span className="text-xs font-medium text-muted-foreground mb-1">Min</span>
                        <ScrollArea className="h-full w-[60px] pr-2">
                            <div className="flex flex-col gap-1 items-center pb-20">
                                {minutesList.map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => handleMinuteClick(m)}
                                        className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all",
                                            selectedMinute === m
                                                ? "bg-blue-600 text-white font-semibold shadow-sm"
                                                : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        {m.toString().padStart(2, "0")}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                </div>
            </PopoverContent>
        </Popover >
    );
}
