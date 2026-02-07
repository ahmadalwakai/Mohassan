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
import type { Role, UserStatus } from '@prisma/client';
import { getPermissionsForRole, type Permission } from '@/core/config/rbac';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      status: UserStatus;
      emailVerified: Date | null;
      permissions: Permission[];
    };
  }

  interface User {
    id: string;
    role: Role;
    status: UserStatus;
    emailVerified: Date | null;
    permissions: Permission[];
  }
}

// Extended JWT type for our app
interface ExtendedJWT extends JWT {
  id?: string;
  role?: Role;
  status?: UserStatus;
  emailVerified?: Date | null;
  permissions?: Permission[];
}

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as NextAuthConfig['adapter'],
  
  trustHost: true,
  
  cookies: {
    sessionToken: {
      name: `${process.env.NEXTAUTH_URL?.startsWith('https') ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https') ?? false,
      },
    },
  },
  
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
          status: user.status,
          emailVerified: user.emailVerified,
          permissions: getPermissionsForRole(user.role),
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
      const extendedToken = token as ExtendedJWT;

      // Initial sign-in
      if (user) {
        extendedToken.id = user.id;
        extendedToken.role = user.role;
        extendedToken.status = user.status;
        extendedToken.emailVerified = user.emailVerified;
        extendedToken.permissions = getPermissionsForRole(user.role);
      }
      
      // Update session from client (e.g., after profile update)
      if (trigger === 'update' && session?.user) {
        if (session.user.role) {
          extendedToken.role = session.user.role;
          extendedToken.permissions = getPermissionsForRole(session.user.role);
        }
        if (session.user.status) extendedToken.status = session.user.status;
      }

      return extendedToken;
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedJWT;
      
      session.user.id = extendedToken.id as string;
      session.user.role = extendedToken.role as Role;
      session.user.status = extendedToken.status as UserStatus;
      session.user.emailVerified = extendedToken.emailVerified as Date | null;
      session.user.permissions = extendedToken.permissions as Permission[];

      return session;
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
