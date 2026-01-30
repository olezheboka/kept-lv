import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

// Token expiration: 1 hour
const TOKEN_EXPIRATION_MS = 60 * 60 * 1000;

// Rate limit: max 3 requests per hour
const MAX_REQUESTS_PER_HOUR = 6;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
    // Random delay between 200-500ms to prevent timing attacks
    const delay = Math.floor(Math.random() * 300) + 200;

    try {
        const body = await request.json();
        const parsed = forgotPasswordSchema.safeParse(body);

        if (!parsed.success) {
            // Still apply delay for consistent response time
            await new Promise((resolve) => setTimeout(resolve, delay));
            return NextResponse.json(
                { success: true, message: "If an account with this email exists, we've sent password reset instructions. Please check your inbox and spam folder." },
                { status: 200 }
            );
        }

        const { email } = parsed.data;
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            // User doesn't exist - still show success message (no enumeration)
            await new Promise((resolve) => setTimeout(resolve, delay));
            return NextResponse.json(
                { success: true, message: "If an account with this email exists, we've sent password reset instructions. Please check your inbox and spam folder." },
                { status: 200 }
            );
        }

        // Check rate limit
        const now = new Date();
        const lastRequest = user.lastResetRequest;

        if (lastRequest && now.getTime() - lastRequest.getTime() < RATE_LIMIT_WINDOW_MS) {
            // Within rate limit window
            if (user.resetRequests >= MAX_REQUESTS_PER_HOUR) {
                // Rate limited - but still show success message (no enumeration)
                await new Promise((resolve) => setTimeout(resolve, delay));
                return NextResponse.json(
                    { success: true, message: "If an account with this email exists, we've sent password reset instructions. Please check your inbox and spam folder." },
                    { status: 200 }
                );
            }
        }

        // Generate token
        const token = randomBytes(32).toString("hex");
        const tokenHash = hashToken(token);
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MS);

        // Delete any existing tokens for this user
        await prisma.passwordResetToken.deleteMany({
            where: { userId: user.id },
        });

        // Create new token
        await prisma.passwordResetToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
            },
        });

        // Update rate limit counters
        const shouldResetCounter = !lastRequest || now.getTime() - lastRequest.getTime() >= RATE_LIMIT_WINDOW_MS;

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetRequests: shouldResetCounter ? 1 : { increment: 1 },
                lastResetRequest: now,
            },
        });

        // Send email
        let baseUrl = process.env.NEXTAUTH_URL || "";
        if (!baseUrl && process.env.VERCEL_URL) {
            baseUrl = `https://${process.env.VERCEL_URL}`;
        }
        if (!baseUrl) {
            baseUrl = "http://localhost:3000";
        }
        const resetLink = `${baseUrl}/reset-password/${token}`;

        await sendPasswordResetEmail({
            to: user.email,
            resetLink,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
        return NextResponse.json(
            { success: true, message: "If an account with this email exists, we've sent password reset instructions. Please check your inbox and spam folder." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Forgot password error:", error);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return NextResponse.json(
            { success: true, message: "If an account with this email exists, we've sent password reset instructions. Please check your inbox and spam folder." },
            { status: 200 }
        );
    }
}
