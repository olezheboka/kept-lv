"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
    value?: string | null;
    onChange: (url: string) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
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
                    <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border bg-muted">
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
                        className={`
              relative flex flex-col items-center justify-center w-full max-w-sm aspect-video
              border-2 border-dashed rounded-lg cursor-pointer
              hover:bg-muted/50 transition-colors
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
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
