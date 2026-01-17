import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function logActivity(
    action: string,
    entityType: string,
    entityId: string | null = null,
    entityTitle: string | null = null,
    details: any = null
) {
    try {
        const session = await auth();
        const adminEmail = session?.user?.email || "system@unknown.com";
        const adminId = session?.user?.id;

        await prisma.auditLog.create({
            data: {
                adminEmail,
                adminId,
                action,
                entityType,
                entityId,
                entityTitle: entityTitle ? String(entityTitle).substring(0, 255) : null,
                details: details ? details : undefined,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}
