"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface MultiSelectDropdownProps {
    options: { label: string; value: string; color?: string; icon?: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    clearText?: string;
    className?: string;
}

export function MultiSelectDropdown({
    options,
    selected,
    onChange,
    placeholder = "Select items",
    searchPlaceholder = "Search...",
    emptyMessage = "No items found.",
    clearText = "Clear filters",
    className,
}: MultiSelectDropdownProps) {
    const [open, setOpen] = React.useState(false);

    // Filter out any selected values that might not exist in options temporarily (safety check)
    const validSelected = selected.filter((s) =>
        options.some((opt) => opt.value === s)
    );

    const selectedLabels = validSelected.map(
        (s) => options.find((opt) => opt.value === s)?.label
    );

    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((s) => s !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const handleClear = () => {
        onChange([]);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-auto min-h-10 hover:bg-background hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none ring-offset-background data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2", className)}
                >
                    <div className="flex flex-nowrap gap-1 items-center flex-1 min-w-0 overflow-hidden">
                        {selected.length === 0 && (
                            <span className="text-muted-foreground font-normal">
                                {placeholder}
                            </span>
                        )}
                        {selected.length > 0 && selected.length <= 2 && (
                            <div className="flex-1 min-w-0 flex justify-start">
                                <span
                                    className="font-normal truncate block w-full text-left"
                                    style={{
                                        maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
                                        WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
                                    }}
                                >
                                    {selectedLabels.join(", ")}
                                </span>
                            </div>
                        )}
                        {selected.length > 2 && (
                            <Badge variant="secondary" className="mr-1">
                                {selected.length} selected
                            </Badge>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => {
                                const isSelected = selected.includes(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label} // Search by label
                                        onSelect={() => handleSelect(option.value)}
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className={cn("h-4 w-4")} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span>{option.label}</span>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selected.length > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={handleClear}
                                        className="justify-center text-center text-sm font-medium text-muted-foreground hover:text-foreground"
                                    >
                                        {clearText}
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
