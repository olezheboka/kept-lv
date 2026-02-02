
import * as React from "react";
import { Textarea, TextareaProps } from "./textarea";
import { cn } from "@/lib/utils";

export const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, value, onChange, ...props }, ref) => {
        const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

        // Sync forwarded ref
        React.useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

        const adjustHeight = React.useCallback(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            // Reset height to auto to correctly calculate new scrollHeight
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight + 2}px`;
        }, []);

        // Adjust height on mount and value change
        React.useEffect(() => {
            adjustHeight();
        }, [value, adjustHeight]);

        // Adjust height on window resize
        React.useEffect(() => {
            window.addEventListener("resize", adjustHeight);
            return () => window.removeEventListener("resize", adjustHeight);
        }, [adjustHeight]);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            adjustHeight();
            onChange?.(e);
        };

        return (
            <Textarea
                {...props}
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                className={cn("overflow-hidden resize-y", className)}
            />
        );
    }
);

AutoResizeTextarea.displayName = "AutoResizeTextarea";
