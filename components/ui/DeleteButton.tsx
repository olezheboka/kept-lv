"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteButtonProps {
  id: string;
  type: "promises" | "politicians" | "parties" | "categories";
  variant?: "text" | "icon";
  className?: string;
}

export function DeleteButton({ id, type, variant = "text", className }: DeleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/${type}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete");
      }
    } catch {
      alert("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const TriggerButton = variant === "icon" ? (
    <button
      type="button"
      title="Delete"
      className={cn(
        "p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50",
        className
      )}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  ) : (
    <button
      type="button"
      className={cn(
        "px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all text-sm font-medium disabled:opacity-50",
        className
      )}
    >
      Delete
    </button>
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {TriggerButton}
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the item.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
