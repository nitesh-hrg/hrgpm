import { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { UserRole } from "@/types/enums";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: UserRole;
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: UserRole;
        email?: string;
        name?: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Mock Login",
            credentials: {
                email: { label: "Email", type: "text" },
                role: { label: "Role", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email) return null;

                // 1. Try to find user
                let user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                // 2. DEV MODE
                if (user) {
                    // Update Role if requested and different (Dev convenience)
                    if (credentials.role && credentials.role !== user.role) {
                        console.log(`[AUTH] Updating role for ${user.email} to ${credentials.role}`)
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: { role: credentials.role as UserRole }
                        })
                    }
                } else {
                    // Create new Dev User
                    const fallbackRole = (credentials.role as UserRole) || UserRole.HR_PRO
                    const fallbackName = credentials.email.split("@")[0]

                    console.log(`[AUTH] Creating new Dev User: ${credentials.email} as ${fallbackRole}`)

                    user = await prisma.user.create({
                        data: {
                            email: credentials.email,
                            name: fallbackName,
                            role: fallbackRole,
                            image: null
                        }
                    })
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role as UserRole,
                    image: user.image
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.id = user.id
                // @ts-ignore
                token.role = user.role
                token.email = user.email
                token.name = user.name
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as UserRole
                if (token.email) session.user.email = token.email as string
                if (token.name) session.user.name = token.name as string
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            // Allow credentials flow to pass (authorize() handles logic)
            if (account?.provider === "credentials") return true;

            if (!user.email) return false;

            try {
                // Check if user exists
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (!dbUser) {
                    console.log(`[AUTH] Auto-creating user from ${account?.provider}: ${user.email}`);
                    // Auto-create ANYONE who signs in (Dev Mode: Open Access)
                    // Default to HR_PRO or MENTOR depending on needs, but let's say HR_PRO safe default
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || user.email.split("@")[0],
                            image: user.image,
                            role: UserRole.HR_PRO, // Default role
                        },
                    });
                }

                return true;
            } catch (error) {
                console.error("SignIn Error:", error);
                return false;
            }
        }
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET || "hard_reset_secret_key_v2_" + Date.now(),
};
