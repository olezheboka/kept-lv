"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Settings, Globe, FileText } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const configSchema = z.object({
    siteName: z.string().min(1, "Site name is required"),
    title: z.string().min(1, "Meta title is required"),
    description: z.string().min(1, "Meta description is required"),
});

type ConfigFormValues = z.infer<typeof configSchema>;

interface ConfigFormProps {
    initialData?: ConfigFormValues;
    onSuccess?: () => Promise<void>;
    onCancel?: () => Promise<void>;
}

export function ConfigForm({ initialData, onSuccess, onCancel }: ConfigFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<ConfigFormValues>({
        resolver: zodResolver(configSchema),
        defaultValues: initialData || {
            siteName: "solījums.lv",
            title: "Solījums.lv - Seko līdzi varas pārstāvju solījumiem un to izpildei",
            description: "Neatkarīga un objektīva platforma, kas atspoguļo valdības solījumu izpildi.",
        },
    });

    async function onSubmit(data: ConfigFormValues) {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to save config");

            toast({
                title: "Configuration Saved",
                description: "System settings have been updated.",
            });

            router.refresh();

            if (onSuccess) {
                await onSuccess();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save configuration.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg text-foreground">General Settings</h3>
                    </div>

                    <div className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="siteName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Site Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. solījums.lv" />
                                    </FormControl>
                                    <FormDescription>
                                        Used in the navigation bar and Open Graph site name using 'siteName'.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg text-foreground">SEO & Metadata</h3>
                    </div>

                    <div className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meta Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Page title for SEO" />
                                    </FormControl>
                                    <FormDescription>
                                        Appears in browser tab and search results.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Meta Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Brief description of the site"
                                            className="resize-none"
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Summary displayed in search results and social shares.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onCancel?.()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="min-w-[140px]">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Configuration
                    </Button>
                </div>
            </form>
        </Form>
    );
}
