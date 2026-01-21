import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;
  // Append connection parameters if they don't exist
  // connect_timeout=30: Increase timeout for slower connections/proxies
  // connection_limit=5: Limit connections in dev to avoid exhaustion
  const enhancedUrl = url && !url.includes("connect_timeout")
    ? `${url}${url.includes("?") ? "&" : "?"}connect_timeout=30&pool_timeout=30&socket_timeout=30`
    : url;

  return new PrismaClient({
    datasourceUrl: enhancedUrl,
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
