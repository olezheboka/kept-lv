import { AlertCircle } from "lucide-react";

interface FormErrorProps {
    message?: string;
}

export function FormError({ message }: FormErrorProps) {
    if (!message) return null;

    return (
        <div className="flex items-center gap-1 mt-1.5 text-[#cf222e] text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5 fill-[#cf222e] text-white" />
            <span>{message}</span>
        </div>
    );
}
