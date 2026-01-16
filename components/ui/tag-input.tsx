"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function TagInput({ value = [], onChange, placeholder = "Add tag...", className }: TagInputProps) {
    const [inputValue, setInputValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !value.includes(newTag)) {
                onChange([...value, newTag]);
                setInputValue("");
            }
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(value.filter((tag) => tag !== tagToRemove));
    };

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div
            onClick={handleContainerClick}
            className={cn(
                "flex min-h-[38px] w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background cursor-text",
                isFocused && "ring-2 ring-ring border-ring outline-none",
                className
            )}
        >
            {value.map((tag) => (
                <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 border-none font-normal px-2 py-0.5 h-6 rounded-md text-xs"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeTag(tag);
                        }}
                        className="ml-0.5 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag}</span>
                    </button>
                </Badge>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground text-foreground min-w-[120px] text-sm h-6 p-0"
                placeholder={value.length === 0 ? placeholder : ""}
            />
        </div>
    );
}
