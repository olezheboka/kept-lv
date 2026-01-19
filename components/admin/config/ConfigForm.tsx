"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormActions } from "@/components/admin/FormActions";
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
import { Globe, FileText } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const configSchema = z.object({
    siteName: z.string().min(1, "Site name is required"),
    title: z.string().min(1, "Meta title is required"),
    description: z.string().min(1, "Meta description is required"),
    ogImageUrl: z.string().optional(),
    faviconUrl: z.string().optional(),
    keywords: z.string().optional(),
    twitterHandle: z.string().optional(),
    googleVerificationId: z.string().optional(),
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
            ogImageUrl: "",
            faviconUrl: "",
            keywords: "",
            twitterHandle: "",
            googleVerificationId: "",
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

            if (!res.ok) throw new Error("Failed to save");

            toast({
                title: "Configuration Saved",
                description: "System settings have been updated.",
            });

            router.refresh();

            if (onSuccess) {
                await onSuccess();
            }
        } catch {
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
                    <p className="text-sm text-gray-500">Configure global application settings. These affect how the site behaves and what&apos;s displayed to users.</p>
                    <p className="text-sm text-muted-foreground">Kategoriju &apos;svarīguma&apos; koeficienti (1.0 = standarta)</p>

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
                                        Used in the navigation bar and Open Graph site name using &apos;siteName&apos;.
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

                        <FormField
                            control={form.control}
                            name="ogImageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Social Image URL (OG Image)</FormLabel>
                                    <div className="flex gap-4 items-start">
                                        <FormControl className="flex-1">
                                            <Input {...field} placeholder="https://example.com/share-image.jpg" />
                                        </FormControl>
                                        {field.value && (
                                            <div className="border rounded-md overflow-hidden w-24 h-14 shrink-0 bg-muted/50 flex items-center justify-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={field.value}
                                                    alt="OG Preview"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <FormDescription>
                                        Full URL to an image (1200x630px recommended) for social media previews.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="faviconUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Favicon URL</FormLabel>
                                    <div className="flex gap-4 items-start">
                                        <FormControl className="flex-1">
                                            <Input {...field} placeholder="https://example.com/favicon.ico" />
                                        </FormControl>
                                        {field.value && (
                                            <div className="border rounded-md overflow-hidden w-10 h-10 shrink-0 bg-muted/50 flex items-center justify-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={field.value}
                                                    alt="Favicon Preview"
                                                    className="w-6 h-6 object-contain"
                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <FormDescription>
                                        URL to the site icon (ICO, PNG, or SVG).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="keywords"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Keywords</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="politics, promises, latvia" />
                                    </FormControl>
                                    <FormDescription>
                                        Comma-separated list of keywords.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg text-foreground">Social & Verification</h3>
                    </div>

                    <div className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="twitterHandle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Twitter Handle</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="@username" />
                                    </FormControl>
                                    <FormDescription>
                                        Used for Twitter Cards attribution.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="googleVerificationId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Google Verification ID</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Content of the google-site-verification meta tag" />
                                    </FormControl>
                                    <FormDescription>
                                        Allows verifying domain ownership with Google Search Console.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <FormActions
                    loading={loading}
                    onCancel={() => onCancel?.()}
                    submitLabel="Save Configuration"
                />
            </form>
        </Form>
    );
}
