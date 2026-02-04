import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  // Prioritize ACCELERATE_DATABASE_URL (pooled) over linked DATABASE_URL (direct)
  // This allows us to keep the Vercel-Prisma integration while using Accelerate
  const url = process.env.ACCELERATE_DATABASE_URL || process.env.DATABASE_URL;

  return new PrismaClient({
    datasourceUrl: url,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error", "warn"],
  });
};

declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

// Prisma error codes that indicate recoverable connection issues
const RETRYABLE_ERROR_CODES = [
  "P1001", // Can't reach database server
  "P1002", // Database server timed out
  "P1017", // Server has closed the connection
  "P2024", // Timed out fetching a new connection from the pool
  "P2034", // Transaction failed due to a write conflict or deadlock
  // Prisma Accelerate specific errors
  "P6008", // Accelerate connection timeout
  "P6009", // Accelerate request timeout
];

/**
 * Helper function to execute with retry logic for serverless reliability.
 * Uses exponential backoff with jitter to handle transient failures.
 * Optimized for Vercel serverless with faster recovery times.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = 4,
  baseDelay: number = 200
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await operation();
      // Log successful retry for observability (only if we had previous failures)
      if (attempt > 1) {
        console.log(`Database operation succeeded on attempt ${attempt}/${retries}`);
      }
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Extract Prisma error code if available
      const prismaErrorCode =
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code?: string }).code
          : null;

      // Check for recoverable connection errors
      const isConnectionError =
        (prismaErrorCode && RETRYABLE_ERROR_CODES.includes(prismaErrorCode)) ||
        lastError.message.includes("Can't reach database") ||
        lastError.message.includes("Failed to connect") ||
        lastError.message.includes("connection") ||
        lastError.message.includes("ECONNRESET") ||
        lastError.message.includes("ETIMEDOUT") ||
        lastError.message.includes("Connection pool timeout") ||
        lastError.message.includes("Connection refused") ||
        lastError.message.includes("Accelerate");

      console.error(
        `Database operation failed (attempt ${attempt}/${retries}):`,
        prismaErrorCode ? `[${prismaErrorCode}]` : "",
        lastError.message
      );

      // If it's not a connection error or we've exhausted retries, throw immediately
      if (!isConnectionError || attempt === retries) {
        throw lastError;
      }

      // Exponential backoff with jitter: 200ms → 400ms → 800ms → 1.6s (capped at 3s)
      // Faster recovery to avoid Vercel function timeout (10s default)
      const waitTime = Math.min(baseDelay * Math.pow(2, attempt - 1), 3000);
      const jitter = Math.random() * waitTime * 0.1; // 10% jitter to prevent thundering herd
      await new Promise(resolve => setTimeout(resolve, waitTime + jitter));
    }
  }

  throw lastError;
}
