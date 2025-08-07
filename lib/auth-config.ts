import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import type { NextAuthOptions } from "next-auth";

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  // Use secure cookies in production
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
  },
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

          // Check if user is approved
          if (!user.isApproved) {
            throw new Error("Your account is pending admin approval. Please wait for approval before signing in.");
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
            role: user.role.toString(), // Include the user's role
            image: user.image,
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
    maxAge: 24 * 60 * 60, // 24 hours
  },
  events: {
    async signOut() {
      // Clear any additional session data if needed
      console.log('User signed out successfully');
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // First time jwt callback is run, user object is available
        token.id = user.id;

        // Fetch user role from Prisma when generating JWT
        try {
          const userData = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
          });

          if (userData) {
            token.role = userData.role;
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }

      // For subsequent executions, token is the refreshed token
      if (trigger === "update" && session?.user) {
        token.role = session.user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
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

export const authOptions = authConfig;
