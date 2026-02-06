'use server';

import { signIn, signOut } from '@/core/auth';
import { AuthError } from 'next-auth';

export async function loginWithCredentials(formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: (formData.get('callbackUrl') as string) || '/dashboard',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        default:
          return { error: 'حدث خطأ أثناء تسجيل الدخول' };
      }
    }
    // Re-throw redirect errors (these are expected)
    throw error;
  }
}

export async function loginWithGoogle(callbackUrl?: string) {
  await signIn('google', { redirectTo: callbackUrl || '/dashboard' });
}

export async function logout() {
  await signOut({ redirectTo: '/login' });
}
