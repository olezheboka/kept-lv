"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";
const SITE_NAME = "Solījums.lv";

interface SendPasswordResetEmailParams {
    to: string;
    resetLink: string;
}

export async function sendPasswordResetEmail({
    to,
    resetLink,
}: SendPasswordResetEmailParams) {
    try {
        const { error } = await resend.emails.send({
            from: `${SITE_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject: "Reset your password",
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset your password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 600;">${SITE_NAME}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
            <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px; font-weight: 600;">Reset your password</h2>
            
            <p style="color: #52525b; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to choose a new password.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #7c3aed); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                    Reset Password
                </a>
            </div>
            
            <p style="color: #71717a; margin: 24px 0 0; font-size: 13px; line-height: 1.6;">
                This link expires in <strong>1 hour</strong>.
            </p>
            
            <p style="color: #71717a; margin: 16px 0 0; font-size: 13px; line-height: 1.6;">
                If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f4f4f5; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;">
            <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                &copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
            `.trim(),
        });

        if (error) {
            console.error("Failed to send password reset email:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Email sending error:", error);
        return { success: false, error: "Failed to send email" };
    }
}

interface SendPasswordChangedEmailParams {
    to: string;
}

export async function sendPasswordChangedEmail({
    to,
}: SendPasswordChangedEmailParams) {
    try {
        const { error } = await resend.emails.send({
            from: `${SITE_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject: "Your password has been changed",
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Changed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 600;">${SITE_NAME}</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 32px;">
            <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px; font-weight: 600;">Password Changed Successfully</h2>
            
            <p style="color: #52525b; margin: 0 0 24px; font-size: 15px; line-height: 1.6;">
                Your password has been successfully changed. You can now log in with your new password.
            </p>
            
            <p style="color: #71717a; margin: 24px 0 0; font-size: 13px; line-height: 1.6;">
                If you did not make this change, please contact us immediately and secure your account.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f4f4f5; padding: 24px; text-align: center; border-top: 1px solid #e4e4e7;">
            <p style="color: #a1a1aa; margin: 0; font-size: 12px;">
                &copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
            `.trim(),
        });

        if (error) {
            console.error("Failed to send password changed email:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Email sending error:", error);
        return { success: false, error: "Failed to send email" };
    }
}
