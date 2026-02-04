import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; entryId: string }> }
) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id, entryId } = await params;

        // 1. Fetch the promise with its history to determine validity
        // Use the same sort order as the UI (EditableTimeline): changedAt desc, then id desc
        // This ensures consistent "latest" determination when multiple entries have the same timestamp
        const promise = await prisma.promise.findUnique({
            where: { id },
            include: {
                statusHistory: {
                    orderBy: [
                        { changedAt: 'desc' },
                        { id: 'desc' }
                    ]
                }
            }
        });

        if (!promise) {
            return new NextResponse("Promise not found", { status: 404 });
        }

        // 2. Check if we are deleting the current status (the most recent one)
        // If so, we need to revert the Promise to the PREVIOUS status
        if (promise.statusHistory.length > 0) {
            const latestEntry = promise.statusHistory[0];

            if (latestEntry.id === entryId) {
                // Deleting the current status

                // Get previous entry (if any)
                const previousEntry = promise.statusHistory[1];

                if (previousEntry) {
                    // Revert to previous status
                    await prisma.promise.update({
                        where: { id },
                        data: {
                            status: previousEntry.newStatus,
                            explanation: previousEntry.note, // note maps to explanation/justification
                            statusUpdatedAt: previousEntry.changedAt
                        }
                    });
                } else {
                    // No previous history -> Revert to initial state (PENDING)
                    await prisma.promise.update({
                        where: { id },
                        data: {
                            status: "PENDING",
                            explanation: null,
                            statusUpdatedAt: null // or promise.datePromised
                        }
                    });
                }
            }
        }

        // 3. Delete the entry
        await prisma.promiseStatusHistory.delete({
            where: {
                id: entryId,
                promiseId: id // Extra safety check
            }
        });

        // Revalidate the promise page to reflect status update
        // revalidatePath(`/promises/${id}`); // If strictly needed, but client usually handles it

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error("[PROMISE_HISTORY_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
