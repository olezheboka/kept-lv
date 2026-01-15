"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteButtonProps {
  id: string;
  type: "promises" | "politicians" | "parties" | "categories";
  variant?: "text" | "icon";
  className?: string;
}

export function DeleteButton({ id, type, variant = "text", className }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/${type}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      alert("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleDelete}
        disabled={loading}
        title="Delete"
        className={cn("p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50", className)}
      >
        {loading ? <span className="w-4 h-4 block animate-pulse bg-gray-200 rounded" /> : <Trash2 className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400
        hover:bg-rose-500/30 transition-all text-sm font-medium
        disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}
