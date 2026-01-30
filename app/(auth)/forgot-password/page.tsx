"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form;

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        try {
            await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email }),
            });

            // Always show success regardless of response (no user enumeration)
            setIsSubmitted(true);
        } catch {
            // Still show success even on error (no user enumeration)
            setIsSubmitted(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px]"
            >
                {/* Logo Section */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Logo className="mb-2" />
                    </motion.div>
                    <p className="text-muted-foreground text-sm font-medium">
                        Password Recovery
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden relative">
                    {/* Decorator line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />

                    <div className="p-8">
                        {!isSubmitted ? (
                            <>
                                <h1 className="text-2xl font-bold text-foreground mb-1">
                                    Reset your password
                                </h1>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Enter your email address and we&apos;ll send you instructions to reset your password.
                                </p>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                autoComplete="email"
                                                className={cn(
                                                    "pl-10 h-10 transition-all",
                                                    errors.email && "border-destructive focus-visible:ring-destructive"
                                                )}
                                                {...register("email")}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-xs text-destructive font-medium ml-1">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-11 font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            "Send Reset Instructions"
                                        )}
                                    </Button>
                                </form>
                            </>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground mb-2">
                                    Check your email
                                </h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    If an account with this email exists, we&apos;ve sent password reset instructions. Please check your inbox and spam folder.
                                </p>
                            </motion.div>
                        )}

                        <div className="mt-6 pt-4 border-t border-border/50">
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to login
                            </Link>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/50 border-t border-border/50 text-center text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Solījums.lv. All rights reserved.
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
