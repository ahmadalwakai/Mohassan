/**
 * Auth.js Configuration
 * Google OAuth + Credentials providers with Prisma adapter
 */

import type { NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import { prisma } from '@/core/db/prisma';
import type { Role } from '@prisma/client';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      emailVerified: Date | null;
    };
  }
  
  interface User {
    role: Role;
    emailVerified: Date | null;
  }
}

// Extended JWT type for our app
interface ExtendedJWT extends JWT {
  id?: string;
  role?: Role;
  emailVerified?: Date | null;
}

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as NextAuthConfig['adapter'],
  
  trustHost: true,
  
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Check if user is banned
        if (user.status === 'BANNED') {
          if (user.banExpiry && user.banExpiry > new Date()) {
            throw new Error('ACCOUNT_BANNED_TEMP');
          }
          if (!user.banExpiry) {
            throw new Error('ACCOUNT_BANNED_PERM');
          }
          // Ban expired, unban user
          await prisma.user.update({
            where: { id: user.id },
            data: { status: 'ACTIVE', bannedAt: null, banExpiry: null, banReason: null },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      const extToken = token as ExtendedJWT;
      
      if (user) {
        extToken.id = user.id!;
        extToken.role = user.role;
        extToken.emailVerified = user.emailVerified;
      }
      
      // Handle session update (e.g., after email verification)
      if (trigger === 'update' && session) {
        extToken.emailVerified = session.emailVerified;
        extToken.role = session.role;
      }
      
      return extToken;
    },

    async session({ session, token }) {
      const extToken = token as ExtendedJWT;
      
      if (extToken) {
        session.user.id = extToken.id ?? '';
        session.user.role = extToken.role ?? 'USER';
        session.user.emailVerified = extToken.emailVerified ?? null;
      }
      return session;
    },

    async signIn({ user, account }) {
      // For OAuth providers, check if user is banned
      if (account?.provider !== 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        
        if (dbUser?.status === 'BANNED') {
          if (dbUser.banExpiry && dbUser.banExpiry > new Date()) {
            return false;
          }
          if (!dbUser.banExpiry) {
            return false;
          }
        }
      }
      
      return true;
    },
  },

  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        // Log new user registration
        console.log(`[AUTH] New user registered: ${user.email}`);
      }
    },
  },

  debug: false,
};

export default authOptions;
