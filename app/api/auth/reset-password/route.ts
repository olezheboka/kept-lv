import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { sendPasswordChangedEmail } from "@/lib/email";
import { z } from "zod";

const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = resetPasswordSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const { token, password } = parsed.data;
        const tokenHash = hashToken(token);

        // Find token in database
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });

        if (!resetToken) {
            return NextResponse.json(
                { success: false, error: "Invalid reset link." },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (new Date() > resetToken.expiresAt) {
            // Delete expired token
            await prisma.passwordResetToken.delete({
                where: { id: resetToken.id },
            });

            return NextResponse.json(
                { success: false, error: "This link has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Hash new password
        const passwordHash = await hash(password, 12);

        // Update user password
        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { passwordHash },
        });

        // Delete the used token
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });

        // Send confirmation email
        await sendPasswordChangedEmail({
            to: resetToken.user.email,
        });

        return NextResponse.json(
            { success: true, message: "Your password has been reset successfully. Please log in with your new password." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { success: false, error: "An error occurred. Please try again." },
            { status: 500 }
        );
    }
}

// GET endpoint to validate token (for showing appropriate UI)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { valid: false, error: "Invalid reset link." },
                { status: 400 }
            );
        }

        const tokenHash = hashToken(token);

        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
        });

        if (!resetToken) {
            return NextResponse.json(
                { valid: false, error: "Invalid reset link." },
                { status: 400 }
            );
        }

        if (new Date() > resetToken.expiresAt) {
            return NextResponse.json(
                { valid: false, error: "This link has expired. Please request a new one." },
                { status: 400 }
            );
        }

        return NextResponse.json({ valid: true }, { status: 200 });
    } catch (error) {
        console.error("Token validation error:", error);
        return NextResponse.json(
            { valid: false, error: "An error occurred." },
            { status: 500 }
        );
    }
}
