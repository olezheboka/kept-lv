"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
    value?: string | null;
    onChange: (url: string) => void;
    disabled?: boolean;
    className?: string; // Additional classes for the image container
}

import { cn } from "@/lib/utils";

export function ImageUpload({ value, onChange, disabled, className }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Upload failed");
            }

            const data = await response.json();
            onChange(data.url);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert(error instanceof Error ? error.message : "Failed to upload image.");
        } finally {
            setIsUploading(false);
            // Reset input so valid change events fire even if selecting same file
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        onChange("");
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-col gap-4">
                {value ? (
                    <div className={cn("relative rounded-lg overflow-hidden border bg-muted", className || "aspect-video w-full max-w-sm")}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="Uploaded image"
                            className="object-cover w-full h-full"
                        />
                        <button
                            onClick={handleRemove}
                            disabled={disabled}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/90 text-white hover:bg-destructive transition-colors disabled:opacity-50"
                            type="button"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                            disabled && "opacity-50 cursor-not-allowed",
                            className || "w-full max-w-sm aspect-video"
                        )}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-2" />
                            ) : (
                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                            )}
                            <p className="text-sm text-muted-foreground">
                                {isUploading ? "Uploading..." : "Click to upload logo"}
                            </p>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                    disabled={disabled || isUploading}
                />
            </div>
        </div>
    );
}
