'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComponentDocProps {
    title: string;
    path: string;
    description?: string;
    usageCode?: string;
    duplicates?: string[]; // Names of duplicate/similar components
    children: React.ReactNode;
}

export function ComponentDoc({
    title,
    path,
    description,
    usageCode,
    duplicates = [],
    children
}: ComponentDocProps) {
    const [isCodeOpen, setIsCodeOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = () => {
        if (usageCode) {
            navigator.clipboard.writeText(usageCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <Card className={cn("mb-12 overflow-hidden border-border/60 shadow-none", duplicates.length > 0 && "border-yellow-500/50 bg-yellow-500/5")}>
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold font-mono tracking-tight">{title}</CardTitle>
                        <CardDescription className="font-mono text-xs mt-1.5 flex items-center gap-2">
                            <span className="bg-muted px-2 py-0.5 rounded text-foreground/70">{path}</span>
                        </CardDescription>
                    </div>
                    {duplicates.length > 0 && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 gap-1.5">
                            <AlertTriangle className="h-3 w-3" />
                            Potential Unification Candidate
                        </Badge>
                    )}
                </div>

                {description && (
                    <p className="text-sm text-muted-foreground mt-2">{description}</p>
                )}

                {duplicates.length > 0 && (
                    <div className="mt-3 text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-100/50 dark:bg-yellow-900/20 p-2 rounded">
                        <strong>Compare with:</strong> {duplicates.join(", ")}
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Render Area */}
                <div className="p-6 md:p-10 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm min-h-[150px] flex flex-col items-center justify-center gap-6 relative overflow-visible">
                    <div className="absolute inset-0 pattern-grid-lg opacity-[0.02] pointer-events-none" />
                    <div className="w-full max-w-full overflow-auto flex flex-col items-center gap-8">
                        {children}
                    </div>
                </div>

                {/* Code Snippet */}
                {usageCode && (
                    <div className="rounded-md border border-border bg-muted/30">
                        <div
                            className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/50 cursor-pointer"
                            onClick={() => setIsCodeOpen(!isCodeOpen)}
                        >
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Usage Example</span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
                                >
                                    {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    {isCodeOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </Button>
                            </div>
                        </div>
                        {isCodeOpen && (
                            <pre className="p-4 overflow-x-auto text-xs font-mono language-tsx bg-background/50">
                                <code>{usageCode}</code>
                            </pre>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
