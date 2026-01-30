"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export function useUnsavedChanges(isDirty: boolean) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Warn on browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty && !isConfirmed) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty, isConfirmed]);

    // Handle manual "Cancel" button click from the form
    const handleCancel = (onCancelDataLoss?: () => void) => {
        if (isDirty) {
            if (onCancelDataLoss) {
                setPendingAction(() => onCancelDataLoss);
            } else {
                setPendingAction(null);
            }
            setShowModal(true);
        } else {
            onCancelDataLoss?.();
        }
    };

    const confirmNavigation = () => {
        setIsConfirmed(true);
        setShowModal(false);
        if (pendingAction) {
            pendingAction();
        } else if (window.history.length > 2) {
            router.back();
        } else {
            // Default fallback if no action provided
            router.push("/admin");
        }
    };

    const UnsavedChangesModal = (
        <ConfirmModal
            open={showModal}
            onOpenChange={setShowModal}
            title="Unsaved Changes"
            description="You have unsaved changes. Are you sure you want to discard them and leave?"
            onConfirm={confirmNavigation}
            onCancel={() => setShowModal(false)}
        />
    );

    return {
        handleCancel,
        UnsavedChangesModal,
    };
}
