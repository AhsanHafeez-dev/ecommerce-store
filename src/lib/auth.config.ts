import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/auth/signin',
        verifyRequest: '/auth/verify-request',
        newUser: '/auth/new-user',
    },
    callbacks: {
        async session({ session, token }) {
            if (session.user && token) {
                // We need to ensure token types are happy or cast
                session.user.role = token.role as any;
                session.user.id = token.id as string;
                (session.user as any).hasPassword = token.hasPassword;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.hasPassword = !!(user as any).hashedPassword;
            }

            // Allow client-side update or forced update to set hasPassword manually if needed
            if (trigger === "update" && session?.hasPassword !== undefined) {
                token.hasPassword = session.hasPassword;
            }

            return token;
        },
    },
    providers: [], // Configured in auth.ts
    session: {
        strategy: 'jwt',
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true,
} satisfies NextAuthConfig;
