"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export interface SearchableSelectOption {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: SearchableSelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select...",
    searchPlaceholder = "Filter...",
    className,
    disabled = false,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const selectedLabel = options.find((opt) => opt.value === value)?.label;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between bg-[#f6f8fa] border-[#d0d7de] text-sm font-normal text-[#1F2328] shadow-sm hover:bg-[#f3f4f6] hover:text-[#1F2328]",
                        "focus:ring-2 focus:ring-[#0969da] focus:border-[#0969da] focus:outline-none",
                        !value && "text-[#656d76] hover:text-[#656d76]", // Explicit dark gray for placeholder, PERSIST ON HOVER
                        className
                    )}
                >
                    {selectedLabel || placeholder}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50 text-black" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-white border border-[#d0d7de] shadow-lg" align="start">
                <Command className="bg-white">
                    <CommandInput
                        placeholder={searchPlaceholder}
                        className="h-9 text-black placeholder:text-[#656d76]"
                    />
                    <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm text-[#656d76]">No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer aria-selected:bg-[#0969da] aria-selected:text-white group"
                                >
                                    <div className="flex items-center w-full">
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0",
                                                // When selected (hovered), icon should be white. When just checked but not hovered, blue.
                                                "group-aria-selected:text-white text-[#0969da]"
                                            )}
                                        />
                                        <span className={cn(value === option.value && "font-medium", "text-[#1F2328] group-aria-selected:text-white")}>
                                            {option.label}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
