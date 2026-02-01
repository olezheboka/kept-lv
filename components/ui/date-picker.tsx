"use client";

import * as React from "react";
import { format, setMonth as setDateMonth, setYear as setDateYear, getMonth, getYear, parse, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({ date, setDate, className, placeholder = "dd.MM.yyyy" }: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const [month, setMonth] = React.useState<Date>(date || new Date());
    const [inputValue, setInputValue] = React.useState("");

    // Sync input value when date changes externally
    React.useEffect(() => {
        if (date) {
            setInputValue(format(date, "dd.MM.yyyy"));
            setMonth(date);
        } else {
            setInputValue("");
        }
    }, [date]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        const parsedDate = parse(value, "dd.MM.yyyy", new Date());
        if (isValid(parsedDate)) {
            setDate(parsedDate);
            setMonth(parsedDate);
        } else {
            if (value === "") {
                setDate(undefined);
            }
            // If invalid but not empty, we don't clear the date prop immediately
            // to allow typing. Validation should be handled by the form.
        }
    };

    const years = Array.from({ length: 101 }, (_, i) => 1950 + i);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handleYearChange = (year: string) => {
        const newMonth = setDateYear(month, parseInt(year));
        setMonth(newMonth);
    };

    const handleMonthChange = (monthStep: string) => {
        const monthIndex = months.indexOf(monthStep);
        const newMonth = setDateMonth(month, monthIndex);
        setMonth(newMonth);
    };

    return (
        <div className={cn("relative", className)}>
            <Input
                value={inputValue}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="pr-10" // Make room for the icon
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full w-10 px-0 rounded-l-none text-muted-foreground hover:bg-transparent"
                    >
                        <CalendarIcon className="h-4 w-4" />
                        <span className="sr-only">Pick a date</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <div className="flex gap-2 p-3 pb-0">
                        <Select
                            value={getYear(month).toString()}
                            onValueChange={handleYearChange}
                        >
                            <SelectTrigger className="h-8 w-[90px]">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {years.map((y) => (
                                    <SelectItem key={y} value={y.toString()}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={months[getMonth(month)]}
                            onValueChange={handleMonthChange}
                        >
                            <SelectTrigger className="h-8 w-[110px]">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((m) => (
                                    <SelectItem key={m} value={m}>
                                        {m}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Calendar
                        mode="single"
                        month={month}
                        onMonthChange={setMonth}
                        selected={date}
                        onSelect={(d) => {
                            setDate(d);
                            setOpen(false);
                            // Input value update is handled by useEffect
                        }}
                        initialFocus
                    />
                    <div className="flex items-center justify-between p-3 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                                setDate(undefined);
                                setOpen(false);
                            }}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => {
                                const now = new Date();
                                setDate(now);
                                setMonth(now);
                                setOpen(false);
                            }}
                        >
                            Today
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
