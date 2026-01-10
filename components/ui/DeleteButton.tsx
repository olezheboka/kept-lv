"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  id: string;
  type: "promises" | "politicians" | "parties" | "categories";
}

export function DeleteButton({ id, type }: DeleteButtonProps) {
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
