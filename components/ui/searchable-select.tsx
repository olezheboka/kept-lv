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
    icon?: React.ElementType;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select...",
    searchPlaceholder = "Filter...",
    className,
    disabled = false,
    icon: Icon,
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
                        "w-full justify-between bg-background border-input text-sm font-normal text-foreground hover:bg-background hover:text-foreground hover:border-blue-500",
                        "focus:ring-2 focus:ring-ring focus:border-ring focus:outline-none",
                        !value && "text-muted-foreground hover:text-muted-foreground",
                        className
                    )}
                >
                    <div className="flex items-center gap-2 truncate">
                        {Icon && <Icon className="h-4 w-4 shrink-0 opacity-50" />}
                        <span className="truncate">{selectedLabel || placeholder}</span>
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-popover border border-border shadow-lg" align="start">
                <Command className="bg-popover text-popover-foreground">
                    <CommandInput
                        placeholder={searchPlaceholder}
                        className="h-9 text-foreground placeholder:text-muted-foreground"
                    />
                    <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground group"
                                >
                                    <div className="flex items-center w-full">
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0",
                                                "text-primary"
                                            )}
                                        />
                                        <span className={cn(value === option.value && "font-medium", "text-foreground group-aria-selected:text-accent-foreground")}>
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
