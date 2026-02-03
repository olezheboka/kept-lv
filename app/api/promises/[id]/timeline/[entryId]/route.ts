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
        const promise = await prisma.promise.findUnique({
            where: { id },
            include: {
                statusHistory: {
                    orderBy: { changedAt: 'desc' }
                }
            }
        });

        if (!promise) {
            return new NextResponse("Promise not found", { status: 404 });
        }

        // 2. Validate: Cannot delete the most recent entry (Current Status)
        if (promise.statusHistory.length > 0) {
            const latestEntry = promise.statusHistory[0];
            if (latestEntry.id === entryId) {
                return new NextResponse("Cannot delete the current status. Change status first.", { status: 400 });
            }
        }

        // 3. Delete the entry
        await prisma.promiseStatusHistory.delete({
            where: {
                id: entryId,
                promiseId: id // Extra safety check
            }
        });

        return new NextResponse(null, { status: 204 });

    } catch (error) {
        console.error("[PROMISE_HISTORY_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
