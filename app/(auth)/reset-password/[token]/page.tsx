"use client";

import { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// Password strength calculation
function getPasswordStrength(password: string): { level: "weak" | "medium" | "strong"; score: number } {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: "weak", score };
    if (score <= 4) return { level: "medium", score };
    return { level: "strong", score };
}

interface PageProps {
    params: Promise<{ token: string }>;
}

export default function ResetPasswordPage({ params }: PageProps) {
    const { token } = use(params);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [globalError, setGlobalError] = useState("");

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = form;

    const password = watch("password");
    const strength = getPasswordStrength(password || "");

    // Validate token on mount
    useEffect(() => {
        async function validateToken() {
            try {
                const res = await fetch(`/api/auth/reset-password?token=${token}`);
                const data = await res.json();

                if (!data.valid) {
                    setTokenError(data.error || "Invalid reset link.");
                }
            } catch {
                setTokenError("An error occurred. Please try again.");
            } finally {
                setIsValidating(false);
            }
        }

        validateToken();
    }, [token]);

    const onSubmit = async (data: ResetPasswordFormValues) => {
        setGlobalError("");
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password: data.password }),
            });

            const result = await res.json();

            if (result.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    router.push("/login?reset=success");
                }, 2000);
            } else {
                setGlobalError(result.error || "Failed to reset password.");
            }
        } catch {
            setGlobalError("Something went wrong. Please try again.");
        }
    };

    // Loading state
    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-muted-foreground">Validating reset link...</p>
                </div>
            </div>
        );
    }

    // Error state (invalid/expired token)
    if (tokenError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[400px]"
                >
                    <div className="text-center mb-8 flex flex-col items-center">
                        <Logo className="mb-2" />
                        <p className="text-muted-foreground text-sm font-medium">
                            Password Recovery
                        </p>
                    </div>

                    <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />

                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h1 className="text-xl font-bold text-foreground mb-2">
                                Link Invalid
                            </h1>
                            <p className="text-sm text-muted-foreground mb-6">
                                {tokenError}
                            </p>
                            <Link href="/forgot-password">
                                <Button className="w-full">
                                    Request New Reset Link
                                </Button>
                            </Link>
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
                    </div>
                </motion.div>
            </div>
        );
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-[400px]"
                >
                    <div className="text-center mb-8 flex flex-col items-center">
                        <Logo className="mb-2" />
                    </div>

                    <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />

                        <div className="p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h1 className="text-xl font-bold text-foreground mb-2">
                                Password Reset!
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Your password has been reset successfully. Redirecting to login...
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Reset form
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[400px]"
            >
                <div className="text-center mb-8 flex flex-col items-center">
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Logo className="mb-2" />
                    </motion.div>
                    <p className="text-muted-foreground text-sm font-medium">
                        Set New Password
                    </p>
                </div>

                <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />

                    <div className="p-8">
                        <h1 className="text-2xl font-bold text-foreground mb-1">
                            Create new password
                        </h1>
                        <p className="text-sm text-muted-foreground mb-6">
                            Enter your new password below.
                        </p>

                        {globalError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2"
                            >
                                <AlertTriangle className="size-4 shrink-0" />
                                {globalError}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                        className={cn(
                                            "pl-10 pr-10 h-10 transition-all",
                                            errors.password && "border-destructive focus-visible:ring-destructive"
                                        )}
                                        {...register("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive font-medium ml-1">
                                        {errors.password.message}
                                    </p>
                                )}

                                {/* Password strength indicator */}
                                {password && (
                                    <div className="space-y-1.5">
                                        <div className="flex gap-1">
                                            <div className={cn(
                                                "h-1 flex-1 rounded-full transition-colors",
                                                strength.level === "weak" ? "bg-red-500" : "bg-muted"
                                            )} />
                                            <div className={cn(
                                                "h-1 flex-1 rounded-full transition-colors",
                                                strength.level === "medium" ? "bg-yellow-500" : strength.level === "strong" ? "bg-green-500" : "bg-muted"
                                            )} />
                                            <div className={cn(
                                                "h-1 flex-1 rounded-full transition-colors",
                                                strength.level === "strong" ? "bg-green-500" : "bg-muted"
                                            )} />
                                        </div>
                                        <p className={cn(
                                            "text-xs font-medium",
                                            strength.level === "weak" && "text-red-500",
                                            strength.level === "medium" && "text-yellow-600",
                                            strength.level === "strong" && "text-green-600"
                                        )}>
                                            {strength.level === "weak" && "Weak password"}
                                            {strength.level === "medium" && "Medium strength"}
                                            {strength.level === "strong" && "Strong password"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        autoComplete="new-password"
                                        className={cn(
                                            "pl-10 pr-10 h-10 transition-all",
                                            errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                                        )}
                                        {...register("confirmPassword")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-xs text-destructive font-medium ml-1">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            {/* Password requirements hint */}
                            <div className="p-3 rounded-lg bg-muted/50 text-xs">
                                <p className="font-medium mb-2 text-muted-foreground">Password requirements:</p>
                                <ul className="space-y-1">
                                    <li className={cn(
                                        "flex items-center gap-2 transition-colors",
                                        (password?.length ?? 0) >= 8 ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                        <CheckCircle2 className={cn(
                                            "w-3.5 h-3.5 transition-colors",
                                            (password?.length ?? 0) >= 8 ? "text-green-600" : "text-muted-foreground/50"
                                        )} />
                                        At least 8 characters
                                    </li>
                                    <li className={cn(
                                        "flex items-center gap-2 transition-colors",
                                        /[A-Z]/.test(password || "") ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                        <CheckCircle2 className={cn(
                                            "w-3.5 h-3.5 transition-colors",
                                            /[A-Z]/.test(password || "") ? "text-green-600" : "text-muted-foreground/50"
                                        )} />
                                        One uppercase letter
                                    </li>
                                    <li className={cn(
                                        "flex items-center gap-2 transition-colors",
                                        /[a-z]/.test(password || "") ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                        <CheckCircle2 className={cn(
                                            "w-3.5 h-3.5 transition-colors",
                                            /[a-z]/.test(password || "") ? "text-green-600" : "text-muted-foreground/50"
                                        )} />
                                        One lowercase letter
                                    </li>
                                    <li className={cn(
                                        "flex items-center gap-2 transition-colors",
                                        /[0-9]/.test(password || "") ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                        <CheckCircle2 className={cn(
                                            "w-3.5 h-3.5 transition-colors",
                                            /[0-9]/.test(password || "") ? "text-green-600" : "text-muted-foreground/50"
                                        )} />
                                        One number
                                    </li>
                                    <li className={cn(
                                        "flex items-center gap-2 transition-colors",
                                        /[^A-Za-z0-9]/.test(password || "") ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                        <CheckCircle2 className={cn(
                                            "w-3.5 h-3.5 transition-colors",
                                            /[^A-Za-z0-9]/.test(password || "") ? "text-green-600" : "text-muted-foreground/50"
                                        )} />
                                        One special character
                                    </li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 font-semibold text-base shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>

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
