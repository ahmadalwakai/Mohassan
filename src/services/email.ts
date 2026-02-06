'use server';

/**
 * Email Service - Centralized email sending using Resend
 * Single source of truth for all email operations
 */

/**
 * Generate verification email HTML
 */
function generateVerificationEmailHTML(verificationUrl: string, name: string): string {
  return `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #00FF00;">مرحباً ${name}!</h1>
      <p>شكراً لتسجيلك في موحسن. يرجى تأكيد بريدك الإلكتروني بالنقر على الرابط أدناه:</p>
      <a href="${verificationUrl}" style="display: inline-block; background-color: #00FF00; color: #121212; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
        تأكيد البريد الإلكتروني
      </a>
      <p style="color: #666;">هذا الرابط صالح لمدة 24 ساعة فقط.</p>
      <p style="color: #666;">إذا لم تقم بإنشاء حساب، يرجى تجاهل هذه الرسالة.</p>
    </div>
  `;
}

/**
 * Log verification email for development
 */
function logVerificationFallback(
  email: string,
  name: string,
  verificationUrl: string,
  reason: 'not_configured' | 'failed' = 'not_configured'
): void {
  const reasonText = reason === 'not_configured' 
    ? 'Resend not configured' 
    : 'Resend failed';
  
  console.log('======================================');
  console.log(`VERIFICATION EMAIL (${reasonText})`);
  console.log(`To: ${email}`);
  console.log(`Name: ${name}`);
  console.log(`Verification URL: ${verificationUrl}`);
  console.log('======================================');
}

/**
 * Send verification email via Resend
 * Falls back to console logging if Resend is not configured or fails
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  name: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    logVerificationFallback(email, name, verificationUrl, 'not_configured');
    return;
  }

  try {
    // Dynamic import to avoid errors when Resend is not installed
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Mohassan <noreply@mohassan.com>',
      to: email,
      subject: 'تأكيد بريدك الإلكتروني - موحسن',
      html: generateVerificationEmailHTML(verificationUrl, name),
    });
  } catch (error) {
    console.error('Failed to send verification email via Resend:', error);
    logVerificationFallback(email, name, verificationUrl, 'failed');
  }
}
