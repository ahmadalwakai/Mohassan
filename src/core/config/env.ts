/**
 * Environment Configuration
 * Centralized environment variable management
 * Server-only - validates required vars at startup
 */

// Server-side validation only - runs at module load time
const isServer = typeof window === 'undefined';

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  
  if (required && !value && isServer) {
    // Only throw in production; in development, warn but continue
    const message = `Missing required environment variable: ${key}`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }
    console.warn(`⚠️  ${message}`);
  }
  
  return value || '';
}

// Validate all required env vars at startup (server-side only)
function validateEnv() {
  if (!isServer) return;
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ];
  
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nPlease configure these in your Vercel project settings.`
    );
  }
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables (non-production):\n${missing.map(k => `  - ${k}`).join('\n')}`);
  }
}

// Run validation on module load
validateEnv();

export const env = {
  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  DIRECT_URL: getEnvVar('DIRECT_URL', false), // Optional direct connection for migrations
  
  // Auth
  NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET'),
  // NEXTAUTH_URL is auto-set by Vercel, only needed locally
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: getEnvVar('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET'),
  
  // Resend Email (optional)
  RESEND_API_KEY: getEnvVar('RESEND_API_KEY', false),
  
  // Groq AI (optional)
  GROQ_API_KEY: getEnvVar('GROQ_API_KEY', false),
  
  // Runtime info
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_VERCEL: !!process.env.VERCEL,
} as const;

export type Env = typeof env;
