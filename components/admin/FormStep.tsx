import { cn } from "@/lib/utils";

interface FormStepProps {
    step: number;
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string; // Allow additional styling
}

export function FormStep({ step, title, description, children, className }: FormStepProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-border/40 py-8", className)}>
            <div className="md:col-span-4 lg:col-span-3">
                <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium text-sm border border-border/50">
                        {step}
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-foreground leading-tight">{title}</h3>
                        {description && (
                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="md:col-span-8 lg:col-span-9 max-w-2xl">
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
