"use client";

import * as React from "react";
import { format, setMonth as setDateMonth, setYear as setDateYear, getMonth, getYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

    // Sync month when date changes externally or on selection
    React.useEffect(() => {
        if (date) {
            setMonth(date);
        }
    }, [date]);

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
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-between text-left font-normal bg-background border-input hover:bg-background hover:text-foreground hover:border-blue-500",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    {date ? format(date, "dd.MM.yyyy") : <span>{placeholder}</span>}
                    <CalendarIcon className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
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
    );
}
