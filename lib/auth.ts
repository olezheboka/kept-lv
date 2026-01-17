import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const isValid = await compare(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        let lastLogin = user.lastLogin;

        try {
          // Update last login
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });
          lastLogin = updatedUser.lastLogin;
        } catch (error) {
          console.error("Failed to update last login:", error);
          // Continue login even if update fails (e.g. stale prisma client)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lastLogin: lastLogin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.lastLogin = user.lastLogin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.lastLogin = token.lastLogin as Date | string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  events: {
    async signIn({ user }) {
      try {
        if (user) {
          await prisma.auditLog.create({
            data: {
              action: "login",
              entityType: "User",
              entityId: user.id,
              entityTitle: user.email || user.name || "User",
              adminEmail: user.email || "unknown@system.com",
              adminId: user.id,
              details: { role: user.role }
            }
          });
        }
      } catch (error) {
        console.error("Failed to log sign in:", error);
      }
    },
    async signOut({ token }) {
      try {
        if (token) {
          // Token is a JWT, so properties might be different depending on session callback
          // But usually token.email and token.sub (id) are available
          await prisma.auditLog.create({
            data: {
              action: "logout",
              entityType: "User",
              entityId: token.sub as string,
              entityTitle: token.email as string || "User",
              adminEmail: token.email as string || "unknown@system.com",
              adminId: token.sub as string,
            }
          });
        }
      } catch (error) {
        console.error("Failed to log sign out:", error);
      }
    }
  }
});
