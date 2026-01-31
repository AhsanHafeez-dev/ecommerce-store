import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prismadb from '@/lib/prismadb'; // Adjust path if necessary
import nodemailer from 'nodemailer';


export const authOptions = {
  adapter: PrismaAdapter(prismadb),
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
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {

        const transport = nodemailer.createTransport(provider.server as nodemailer.TransportOptions);
        await transport.sendMail({
          to: email,
          from: provider.from,
          subject: 'Sign in to your E-commerce Store',
          text: `Please use the following link to sign in: ${url}`,
          html: `<p>Please use the following link to sign in: <a href="${url}">${url}</a></p>`,
        });
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.role = user?.role;
        session.user.id = user?.id;
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
    async createUser(message) {
        await prismadb.user.update({
          where: { id: message.id },
          data: { role: 'USER' },
        });
    },
  },
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

export const runtime = 'edge';
