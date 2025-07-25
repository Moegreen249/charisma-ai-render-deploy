import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isValidPassword = await verifyPassword(
            credentials.password,
            user.password,
          );

          if (!isValidPassword) {
            return null;
          }

          // Return user object (password will be excluded)
          // Ensure email is not null for credentials provider
          if (!user.email) {
            return null;
          }

          return {
            id: user.id,
            email: user.email as string, // Type assertion since we've checked for null above
            name: user.name,
            image: user.image,
            role: user.role.toString(),
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Include user role in JWT token
      if (user) {
        token.role = user.role as string;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Include user role in session
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
