import * as React from "react"
import { cn } from "@/lib/utils"

const Timeline = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col relative", className)}
        {...props}
    />
))
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex gap-x-3 relative pb-8 last:pb-0", className)}
        {...props}
    />
))
TimelineItem.displayName = "TimelineItem"

const TimelineBadge = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm",
            className
        )}
        {...props}
    />
))
TimelineBadge.displayName = "TimelineBadge"

const TimelineConnector = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "absolute left-4 top-8 -bottom-0 w-px bg-border",
            className
        )}
        {...props}
    />
))
TimelineConnector.displayName = "TimelineConnector"

const TimelineContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex-1 pt-1", className)}
        {...props}
    />
))
TimelineContent.displayName = "TimelineContent"

export {
    Timeline,
    TimelineItem,
    TimelineBadge,
    TimelineConnector,
    TimelineContent,
}
