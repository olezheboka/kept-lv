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

        // 3. Delete the entry and check if any remain
        await prisma.$transaction(async (tx) => {
            // Delete the specific entry
            await tx.promiseStatusHistory.delete({
                where: {
                    id: entryId,
                    promiseId: id
                }
            });

            // Count remaining entries
            const count = await tx.promiseStatusHistory.count({
                where: { promiseId: id }
            });

            // If no history remains, revert to initial status (PENDING)
            // This handles the case where "Promise Created" is the only thing left conceptually
            if (count === 0) {
                await tx.promise.update({
                    where: { id },
                    data: {
                        status: "PENDING",
                        statusUpdatedAt: null
                    }
                });
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
