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

/**
 * Generate role change notification email HTML
 */
function generateRoleChangeEmailHTML(name: string, newRole: string, roleArabic: string): string {
  const roleColors: Record<string, string> = {
    'ADMIN': '#FF6B6B',
    'MODERATOR': '#4ECDC4',
    'USER': '#95E1D3',
  };
  const color = roleColors[newRole] || '#00FF00';
  
  return `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: ${color};">مرحباً ${name}!</h1>
      <p>نود إعلامك بأنه تم تحديث صلاحياتك على منصة موحسن.</p>
      <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid ${color};">
        <p style="color: #fff; margin: 0;">صلاحيتك الجديدة: <strong style="color: ${color};">${roleArabic}</strong></p>
      </div>
      ${newRole === 'ADMIN' ? `
      <p style="color: #666;">كمسؤول، لديك الآن صلاحيات كاملة لإدارة المنصة بما في ذلك:</p>
      <ul style="color: #666;">
        <li>إدارة المستخدمين والصلاحيات</li>
        <li>مراجعة وإدارة المحتوى</li>
        <li>الوصول للوحة التحكم الكاملة</li>
        <li>إعدادات النظام</li>
      </ul>
      ` : ''}
      ${newRole === 'MODERATOR' ? `
      <p style="color: #666;">كمشرف، لديك الآن صلاحيات لـ:</p>
      <ul style="color: #666;">
        <li>مراجعة المحتوى المعلق</li>
        <li>الموافقة أو رفض المنشورات</li>
        <li>إدارة البلاغات</li>
      </ul>
      ` : ''}
      <p style="color: #666;">إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.</p>
      <p style="color: #666; margin-top: 20px;">مع تحيات فريق موحسن</p>
    </div>
  `;
}

/**
 * Send role change notification email
 */
export async function sendRoleChangeEmail(
  email: string,
  name: string,
  newRole: 'USER' | 'MODERATOR' | 'ADMIN'
): Promise<void> {
  const roleArabicMap: Record<string, string> = {
    'ADMIN': 'مسؤول',
    'MODERATOR': 'مشرف',
    'USER': 'مستخدم',
  };
  const roleArabic = roleArabicMap[newRole] || newRole;

  console.log('[EMAIL_ROLE_CHANGE_START] Recipient:', email, '| New Role:', newRole);

  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL_ROLE_CHANGE_SKIP] No RESEND_API_KEY configured');
    console.log('======================================');
    console.log('ROLE CHANGE EMAIL (Resend not configured)');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`New Role: ${newRole} (${roleArabic})`);
    console.log('======================================');
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromAddress = process.env.EMAIL_FROM || 'Mohassan <noreply@mohassansy.com>';

    const result = await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: `تحديث صلاحياتك على موحسن - ${roleArabic}`,
      html: generateRoleChangeEmailHTML(name, newRole, roleArabic),
    });

    if (result.error) {
      console.error('[EMAIL_ROLE_CHANGE_FAIL] Resend API error:', result.error.message);
      return;
    }

    console.log('[EMAIL_ROLE_CHANGE_OK] Response:', JSON.stringify(result));
  } catch (error) {
    console.error('[EMAIL_ROLE_CHANGE_FAIL] Error:', error);
  }
}
