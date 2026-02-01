import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prismadb from '@/lib/prismadb';

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prismadb) as any,
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password required');
                }

                const user = await prismadb.user.findUnique({
                    where: {
                        email: credentials.email as string,
                    },
                });

                if (!user || !user.hashedPassword) {
                    throw new Error('Email does not exist or has no password');
                }

                const isCorrectPassword = await compare(
                    credentials.password as string,
                    user.hashedPassword
                );

                if (!isCorrectPassword) {
                    throw new Error('Incorrect password');
                }

                return user;
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user && token) {
                session.user.role = token.role as any;
                session.user.id = token.id as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
    },
    events: {
        async createUser({ user }) {
            if (user?.id) {
                await prismadb.user.update({
                    where: { id: user.id },
                    data: { role: 'USER' },
                });
            }
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true,
    pages: {
        signIn: '/auth/signin',
        verifyRequest: '/auth/verify-request',
        newUser: '/auth/new-user',
    },
});
