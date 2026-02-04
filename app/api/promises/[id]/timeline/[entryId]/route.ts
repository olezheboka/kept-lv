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

        // 2. We no longer revert the Promise status when deleting the latest entry.
        // The user wants to keep the current status/justification on the Promise object,
        // even if the corresponding history entry is deleted.
        // This allows cleaning up history without "undoing" the current state.

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
