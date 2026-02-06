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
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.mohassansy.com';
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  console.log('[EMAIL_SEND_START] Recipient:', email, '| Route: sendVerificationEmail | RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL_SEND_SKIP] No RESEND_API_KEY configured');
    logVerificationFallback(email, name, verificationUrl, 'not_configured');
    return;
  }

  try {
    // Dynamic import to avoid errors when Resend is not installed
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Use EMAIL_FROM if set, otherwise use verified domain
    const fromAddress = process.env.EMAIL_FROM || 'Mohassan <noreply@mohassansy.com>';
    console.log('[EMAIL_SEND_ATTEMPT] from:', fromAddress, '| to:', email);

    const result = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: 'تأكيد بريدك الإلكتروني - موحسن',
      html: generateVerificationEmailHTML(verificationUrl, name),
    });

    // Check for API-level errors (Resend doesn't throw for validation errors)
    if (result.error) {
      console.error('[EMAIL_SEND_FAIL] Resend API error:', result.error.message);
      logVerificationFallback(email, name, verificationUrl, 'failed');
      return;
    }

    console.log('[EMAIL_SEND_OK] Response:', JSON.stringify(result));
  } catch (error) {
    console.error('[EMAIL_SEND_FAIL] Error:', error);
    console.error('[EMAIL_SEND_FAIL] Stack:', error instanceof Error ? error.stack : 'N/A');
    logVerificationFallback(email, name, verificationUrl, 'failed');
  }
}
