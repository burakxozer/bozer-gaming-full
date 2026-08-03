export const dynamic = 'force-dynamic';

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-posta', type: 'text' },
        password: { label: '\u015eifre', type: 'password' },
      },
      async authorize(credentials: any) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          const lowerIdentifier = (credentials.email as string).toLowerCase();
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: lowerIdentifier },
                { email: lowerIdentifier },
              ],
            },
          });
          if (!user) return null;
          const valid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!valid) return null;
          if (!user.emailVerified) return null;
          return { id: user.id, name: user.username, email: user.email };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session.user as any).id = token?.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
