/**
 * Account Types
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileInput {
  name?: string;
  image?: string;
}
