import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;

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

// Helper function to execute with retry logic for serverless reliability
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries: number = 5,
  delay: number = 2000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Database operation failed (attempt ${attempt}/${retries}):`, lastError.message);

      // Check if it's a connection error that might be recoverable
      const isConnectionError =
        lastError.message.includes("Failed to connect") ||
        lastError.message.includes("connection") ||
        lastError.message.includes("ECONNRESET") ||
        lastError.message.includes("ETIMEDOUT");

      if (!isConnectionError || attempt === retries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}
