'use server';

/**
 * Email Service - Centralized email sending using Resend
 * Single source of truth for all email operations
 * Professional email templates inspired by major tech companies
 */

import { getBaseUrl } from '@/core/config/env';

/**
 * Brand colors and constants
 */
const BRAND = {
  primaryGreen: '#00FF00',
  darkGreen: '#00CC00',
  bgDark: '#0a0a0a',
  bgCard: '#141414',
  bgElevated: '#1a1a1a',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#666666',
  border: '#2a2a2a',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
} as const;

/**
 * Base email wrapper template with professional styling
 */
function getEmailWrapper(content: string, preheader: string = ''): string {
  const baseUrl = getBaseUrl();
  
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>موحسن</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
    
    * { box-sizing: border-box; }
    
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: ${BRAND.bgDark};
    }
    
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }
    
    td {
      padding: 0;
    }
    
    img {
      border: 0;
      line-height: 100%;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    
    a {
      text-decoration: none;
    }
    
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 16px !important;
      }
      .content-block {
        padding: 24px 20px !important;
      }
      .button {
        display: block !important;
        width: 100% !important;
      }
      .feature-grid td {
        display: block !important;
        width: 100% !important;
        padding: 8px 0 !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.bgDark}; font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif;">
  <!-- Preheader text (hidden but shown in email preview) -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheader}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  
  <!-- Email wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.bgDark};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Main container -->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${baseUrl}" style="display: inline-block;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background: linear-gradient(135deg, ${BRAND.primaryGreen} 0%, ${BRAND.darkGreen} 100%); padding: 12px 24px; border-radius: 12px;">
                      <span style="font-size: 28px; font-weight: 800; color: ${BRAND.bgDark}; letter-spacing: -1px;">موحسن</span>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.bgCard}; border-radius: 16px; border: 1px solid ${BRAND.border}; overflow: hidden;">
                ${content}
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <!-- Social Links -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="https://twitter.com/mohassansy" style="display: inline-block; width: 36px; height: 36px; background-color: ${BRAND.bgElevated}; border-radius: 50%; text-align: center; line-height: 36px;">
                            <img src="https://cdn-icons-png.flaticon.com/24/3670/3670151.png" alt="X" width="18" height="18" style="vertical-align: middle; filter: invert(1);">
                          </a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="https://instagram.com/mohassansy" style="display: inline-block; width: 36px; height: 36px; background-color: ${BRAND.bgElevated}; border-radius: 50%; text-align: center; line-height: 36px;">
                            <img src="https://cdn-icons-png.flaticon.com/24/3955/3955024.png" alt="Instagram" width="18" height="18" style="vertical-align: middle; filter: invert(1);">
                          </a>
                        </td>
                        <td style="padding: 0 8px;">
                          <a href="https://t.me/mohassansy" style="display: inline-block; width: 36px; height: 36px; background-color: ${BRAND.bgElevated}; border-radius: 50%; text-align: center; line-height: 36px;">
                            <img src="https://cdn-icons-png.flaticon.com/24/2111/2111646.png" alt="Telegram" width="18" height="18" style="vertical-align: middle; filter: invert(1);">
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer Links -->
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 12px;">
                          <a href="${baseUrl}/about" style="color: ${BRAND.textSecondary}; font-size: 13px;">من نحن</a>
                        </td>
                        <td style="color: ${BRAND.border};">|</td>
                        <td style="padding: 0 12px;">
                          <a href="${baseUrl}/contact" style="color: ${BRAND.textSecondary}; font-size: 13px;">تواصل معنا</a>
                        </td>
                        <td style="color: ${BRAND.border};">|</td>
                        <td style="padding: 0 12px;">
                          <a href="${baseUrl}/privacy" style="color: ${BRAND.textSecondary}; font-size: 13px;">الخصوصية</a>
                        </td>
                        <td style="color: ${BRAND.border};">|</td>
                        <td style="padding: 0 12px;">
                          <a href="${baseUrl}/terms" style="color: ${BRAND.textSecondary}; font-size: 13px;">الشروط</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Company Info -->
                <tr>
                  <td align="center" style="padding-bottom: 8px;">
                    <p style="margin: 0; color: ${BRAND.textMuted}; font-size: 12px;">
                      موحسن - منصة المجتمع السوري للمحتوى والمبادرات
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td align="center">
                    <p style="margin: 0; color: ${BRAND.textMuted}; font-size: 11px;">
                      © ${new Date().getFullYear()} موحسن. جميع الحقوق محفوظة.
                    </p>
                  </td>
                </tr>
                
                <!-- Unsubscribe note -->
                <tr>
                  <td align="center" style="padding-top: 24px;">
                    <p style="margin: 0; color: ${BRAND.textMuted}; font-size: 11px; max-width: 400px;">
                      تلقيت هذه الرسالة لأنك مسجل في موحسن. 
                      إذا لم تقم بهذا الإجراء، يمكنك تجاهل هذه الرسالة أو 
                      <a href="${baseUrl}/contact" style="color: ${BRAND.primaryGreen};">التواصل معنا</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate verification email HTML - Professional template
 */
function generateVerificationEmailHTML(verificationUrl: string, name: string): string {
  const baseUrl = getBaseUrl();
  
  const content = `
    <!-- Hero Section with Icon -->
    <tr>
      <td align="center" style="padding: 48px 40px 24px 40px; background: linear-gradient(180deg, ${BRAND.bgElevated} 0%, ${BRAND.bgCard} 100%);">
        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, ${BRAND.primaryGreen}20 0%, ${BRAND.primaryGreen}10 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 2px solid ${BRAND.primaryGreen}30;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 80px; height: 80px; text-align: center; vertical-align: middle; background: linear-gradient(135deg, ${BRAND.primaryGreen}20 0%, ${BRAND.primaryGreen}10 100%); border-radius: 50%; border: 2px solid ${BRAND.primaryGreen}30;">
                <span style="font-size: 36px;">✉️</span>
              </td>
            </tr>
          </table>
        </div>
        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: ${BRAND.textPrimary};">
          أهلاً وسهلاً، ${name}! 👋
        </h1>
        <p style="margin: 0; font-size: 16px; color: ${BRAND.textSecondary};">
          شكراً لانضمامك لمجتمع موحسن
        </p>
      </td>
    </tr>
    
    <!-- Main Message -->
    <tr>
      <td class="content-block" style="padding: 32px 40px;">
        <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND.textSecondary}; line-height: 1.7;">
          أنت على بعد خطوة واحدة من الانضمام لأكبر منصة سورية للمحتوى والمبادرات المجتمعية. 
          فقط قم بتأكيد بريدك الإلكتروني للبدء.
        </p>
        
        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 8px 0 32px 0;">
              <a href="${verificationUrl}" class="button" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.primaryGreen} 0%, ${BRAND.darkGreen} 100%); color: ${BRAND.bgDark}; font-size: 16px; font-weight: 700; padding: 16px 48px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px ${BRAND.primaryGreen}40;">
                ✓ تأكيد البريد الإلكتروني
              </a>
            </td>
          </tr>
        </table>
        
        <!-- Alternative Link -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.bgElevated}; border-radius: 12px; border: 1px solid ${BRAND.border};">
          <tr>
            <td style="padding: 16px 20px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: ${BRAND.textMuted};">
                أو انسخ هذا الرابط في متصفحك:
              </p>
              <p style="margin: 0; font-size: 12px; color: ${BRAND.primaryGreen}; word-break: break-all; direction: ltr;">
                ${verificationUrl}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Divider -->
    <tr>
      <td style="padding: 0 40px;">
        <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, ${BRAND.border} 50%, transparent 100%);"></div>
      </td>
    </tr>
    
    <!-- Features Section -->
    <tr>
      <td style="padding: 32px 40px;">
        <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: ${BRAND.textPrimary};">
          ماذا يمكنك فعله على موحسن؟
        </h2>
        
        <table role="presentation" width="100%" class="feature-grid" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 8px 8px 8px 0; vertical-align: top; width: 50%;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <span style="font-size: 24px;">📰</span>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.textPrimary};">نشر الأخبار</p>
                    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">شارك آخر الأخبار والمستجدات</p>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 8px 0 8px 8px; vertical-align: top; width: 50%;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <span style="font-size: 24px;">🚀</span>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.textPrimary};">إطلاق المبادرات</p>
                    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">أنشئ مبادرات مجتمعية</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 8px 8px 0; vertical-align: top; width: 50%;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <span style="font-size: 24px;">🏪</span>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.textPrimary};">السوق</p>
                    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">بيع وشراء المنتجات والخدمات</p>
                  </td>
                </tr>
              </table>
            </td>
            <td style="padding: 8px 0 8px 8px; vertical-align: top; width: 50%;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <span style="font-size: 24px;">📖</span>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.textPrimary};">الدليل</p>
                    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">اكتشف المؤسسات والخدمات</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Timer Notice -->
    <tr>
      <td style="padding: 0 40px 32px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, ${BRAND.warning}15 0%, ${BRAND.warning}05 100%); border-radius: 12px; border: 1px solid ${BRAND.warning}30;">
          <tr>
            <td style="padding: 16px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="font-size: 20px;">⏰</span>
                  </td>
                  <td style="vertical-align: middle;">
                    <p style="margin: 0; font-size: 14px; color: ${BRAND.warning};">
                      <strong>تنبيه:</strong> هذا الرابط صالح لمدة <strong>24 ساعة</strong> فقط
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Help Section -->
    <tr>
      <td style="padding: 24px 40px 32px 40px; background-color: ${BRAND.bgElevated};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: middle; padding-left: 16px;">
              <span style="font-size: 32px;">💬</span>
            </td>
            <td style="vertical-align: middle;">
              <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.textPrimary};">
                هل تحتاج مساعدة؟
              </p>
              <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">
                فريقنا متواجد للإجابة على استفساراتك على 
                <a href="mailto:support@mohassansy.com" style="color: ${BRAND.primaryGreen};">support@mohassansy.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  
  return getEmailWrapper(content, 'تأكيد بريدك الإلكتروني للانضمام لمجتمع موحسن - خطوة واحدة فقط تفصلك!');
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
  const baseUrl = getBaseUrl();
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  console.log('[EMAIL_VERIFY_URL]', verifyUrl);
  console.log('[EMAIL_SEND_START] Recipient:', email, '| Route: sendVerificationEmail | RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL_SEND_SKIP] No RESEND_API_KEY configured');
    logVerificationFallback(email, name, verifyUrl, 'not_configured');
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
      html: generateVerificationEmailHTML(verifyUrl, name),
    });

    // Check for API-level errors (Resend doesn't throw for validation errors)
    if (result.error) {
      console.error('[EMAIL_SEND_FAIL] Resend API error:', result.error.message);
      logVerificationFallback(email, name, verifyUrl, 'failed');
      return;
    }

    console.log('[EMAIL_SEND_OK] Response:', JSON.stringify(result));
  } catch (error) {
    console.error('[EMAIL_SEND_FAIL] Error:', error);
    console.error('[EMAIL_SEND_FAIL] Stack:', error instanceof Error ? error.stack : 'N/A');
    logVerificationFallback(email, name, verifyUrl, 'failed');
  }
}

/**
 * Generate role change notification email HTML - Professional template
 */
function generateRoleChangeEmailHTML(name: string, newRole: string, roleArabic: string): string {
  const roleConfig: Record<string, { color: string; icon: string; gradient: string }> = {
    'ADMIN': { 
      color: '#FF6B6B', 
      icon: '👑', 
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%)'
    },
    'MODERATOR': { 
      color: '#4ECDC4', 
      icon: '🛡️', 
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #3DBDB4 100%)'
    },
    'USER': { 
      color: BRAND.primaryGreen, 
      icon: '👤', 
      gradient: `linear-gradient(135deg, ${BRAND.primaryGreen} 0%, ${BRAND.darkGreen} 100%)`
    },
  };
  
  const config = roleConfig[newRole] || roleConfig['USER'];
  const baseUrl = getBaseUrl();
  
  const adminPermissions = `
    <tr>
      <td style="padding: 32px 40px;">
        <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: ${BRAND.textPrimary};">
          صلاحياتك كمسؤول:
        </h2>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${[
            { icon: '👥', title: 'إدارة المستخدمين', desc: 'تعيين الصلاحيات، حظر/رفع الحظر' },
            { icon: '📝', title: 'إدارة المحتوى', desc: 'مراجعة، تعديل، حذف أي محتوى' },
            { icon: '⚙️', title: 'إعدادات النظام', desc: 'ضبط سياسات المنصة والأمان' },
            { icon: '📊', title: 'التقارير والإحصائيات', desc: 'الوصول لجميع البيانات والتحليلات' },
          ].map(item => `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND.border};">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-left: 16px; vertical-align: top; width: 40px;">
                      <span style="font-size: 24px;">${item.icon}</span>
                    </td>
                    <td style="vertical-align: top;">
                      <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: ${BRAND.textPrimary};">${item.title}</p>
                      <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">${item.desc}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `).join('')}
        </table>
      </td>
    </tr>
  `;
  
  const moderatorPermissions = `
    <tr>
      <td style="padding: 32px 40px;">
        <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: ${BRAND.textPrimary};">
          صلاحياتك كمشرف:
        </h2>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${[
            { icon: '✅', title: 'مراجعة المحتوى', desc: 'الموافقة أو رفض المنشورات المعلقة' },
            { icon: '🚨', title: 'إدارة البلاغات', desc: 'التحقيق في البلاغات واتخاذ الإجراءات' },
            { icon: '🔍', title: 'مراقبة النشاط', desc: 'متابعة نشاط المستخدمين المشبوه' },
          ].map(item => `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND.border};">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-left: 16px; vertical-align: top; width: 40px;">
                      <span style="font-size: 24px;">${item.icon}</span>
                    </td>
                    <td style="vertical-align: top;">
                      <p style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: ${BRAND.textPrimary};">${item.title}</p>
                      <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">${item.desc}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `).join('')}
        </table>
      </td>
    </tr>
  `;
  
  const content = `
    <!-- Hero Section -->
    <tr>
      <td align="center" style="padding: 48px 40px 24px 40px; background: linear-gradient(180deg, ${BRAND.bgElevated} 0%, ${BRAND.bgCard} 100%);">
        <div style="margin-bottom: 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 80px; height: 80px; text-align: center; vertical-align: middle; background: ${config.color}20; border-radius: 50%; border: 2px solid ${config.color}30;">
                <span style="font-size: 40px;">${config.icon}</span>
              </td>
            </tr>
          </table>
        </div>
        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: ${BRAND.textPrimary};">
          مرحباً ${name}! 🎉
        </h1>
        <p style="margin: 0; font-size: 16px; color: ${BRAND.textSecondary};">
          تم تحديث صلاحياتك على منصة موحسن
        </p>
      </td>
    </tr>
    
    <!-- Role Badge -->
    <tr>
      <td style="padding: 32px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${config.color}10; border-radius: 16px; border: 2px solid ${config.color}30;">
          <tr>
            <td align="center" style="padding: 32px;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: ${BRAND.textMuted}; text-transform: uppercase; letter-spacing: 2px;">
                صلاحيتك الجديدة
              </p>
              <div style="display: inline-block; background: ${config.gradient}; padding: 12px 32px; border-radius: 50px;">
                <span style="font-size: 24px; font-weight: 700; color: ${newRole === 'ADMIN' || newRole === 'MODERATOR' ? '#fff' : BRAND.bgDark};">
                  ${config.icon} ${roleArabic}
                </span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    ${newRole === 'ADMIN' ? adminPermissions : ''}
    ${newRole === 'MODERATOR' ? moderatorPermissions : ''}
    
    <!-- CTA Button -->
    <tr>
      <td style="padding: 0 40px 32px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="${baseUrl}/${newRole === 'ADMIN' ? 'admin' : newRole === 'MODERATOR' ? 'moderator' : 'dashboard'}" class="button" style="display: inline-block; background: ${config.gradient}; color: ${newRole === 'ADMIN' || newRole === 'MODERATOR' ? '#fff' : BRAND.bgDark}; font-size: 16px; font-weight: 700; padding: 16px 48px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px ${config.color}40;">
                الذهاب للوحة التحكم ←
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Important Notice -->
    <tr>
      <td style="padding: 0 40px 32px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${BRAND.warning}10; border-radius: 12px; border: 1px solid ${BRAND.warning}30;">
          <tr>
            <td style="padding: 16px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <span style="font-size: 20px;">⚠️</span>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.warning};">
                      تنبيه مهم
                    </p>
                    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">
                      مع الصلاحيات الجديدة تأتي مسؤوليات. يرجى استخدام صلاحياتك بحكمة والالتزام 
                      <a href="${baseUrl}/guidelines" style="color: ${BRAND.primaryGreen};">بإرشادات المجتمع</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Help Section -->
    <tr>
      <td style="padding: 24px 40px 32px 40px; background-color: ${BRAND.bgElevated};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: middle; padding-left: 16px;">
              <span style="font-size: 32px;">❓</span>
            </td>
            <td style="vertical-align: middle;">
              <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.textPrimary};">
                هل لديك أسئلة حول صلاحياتك الجديدة؟
              </p>
              <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">
                تواصل معنا على 
                <a href="mailto:support@mohassansy.com" style="color: ${BRAND.primaryGreen};">support@mohassansy.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  
  return getEmailWrapper(content, `تهانينا! تم ترقيتك إلى ${roleArabic} على منصة موحسن`);
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

/**
 * Generate password reset email HTML - Professional template
 */
function generatePasswordResetEmailHTML(resetUrl: string, name: string): string {
  const baseUrl = getBaseUrl();
  
  const content = `
    <!-- Hero Section -->
    <tr>
      <td align="center" style="padding: 48px 40px 24px 40px; background: linear-gradient(180deg, ${BRAND.bgElevated} 0%, ${BRAND.bgCard} 100%);">
        <div style="margin-bottom: 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 80px; height: 80px; text-align: center; vertical-align: middle; background: ${BRAND.error}20; border-radius: 50%; border: 2px solid ${BRAND.error}30;">
                <span style="font-size: 40px;">🔐</span>
              </td>
            </tr>
          </table>
        </div>
        <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: ${BRAND.textPrimary};">
          مرحباً ${name}
        </h1>
        <p style="margin: 0; font-size: 16px; color: ${BRAND.textSecondary};">
          تلقينا طلب إعادة تعيين كلمة المرور
        </p>
      </td>
    </tr>
    
    <!-- Main Message -->
    <tr>
      <td class="content-block" style="padding: 32px 40px;">
        <p style="margin: 0 0 24px 0; font-size: 16px; color: ${BRAND.textSecondary}; line-height: 1.7;">
          استلمنا طلباً لإعادة تعيين كلمة المرور لحسابك على موحسن. 
          إذا لم تقم بهذا الطلب، يمكنك تجاهل هذه الرسالة بأمان.
        </p>
        
        <!-- CTA Button -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 8px 0 32px 0;">
              <a href="${resetUrl}" class="button" style="display: inline-block; background: linear-gradient(135deg, ${BRAND.error} 0%, #dc2626 100%); color: #ffffff; font-size: 16px; font-weight: 700; padding: 16px 48px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 14px ${BRAND.error}40;">
                🔑 إعادة تعيين كلمة المرور
              </a>
            </td>
          </tr>
        </table>
        
        <!-- Alternative Link -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${BRAND.bgElevated}; border-radius: 12px; border: 1px solid ${BRAND.border};">
          <tr>
            <td style="padding: 16px 20px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: ${BRAND.textMuted};">
                أو انسخ هذا الرابط في متصفحك:
              </p>
              <p style="margin: 0; font-size: 12px; color: ${BRAND.error}; word-break: break-all; direction: ltr;">
                ${resetUrl}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Timer Notice -->
    <tr>
      <td style="padding: 0 40px 24px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${BRAND.warning}15; border-radius: 12px; border: 1px solid ${BRAND.warning}30;">
          <tr>
            <td style="padding: 16px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: middle;">
                    <span style="font-size: 20px;">⏰</span>
                  </td>
                  <td style="vertical-align: middle;">
                    <p style="margin: 0; font-size: 14px; color: ${BRAND.warning};">
                      <strong>تنبيه:</strong> هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Divider -->
    <tr>
      <td style="padding: 0 40px;">
        <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, ${BRAND.border} 50%, transparent 100%);"></div>
      </td>
    </tr>
    
    <!-- Security Tips -->
    <tr>
      <td style="padding: 32px 40px;">
        <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: ${BRAND.textPrimary};">
          🛡️ نصائح أمان
        </h2>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND.border};">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: middle; width: 30px;">
                    <span style="color: ${BRAND.primaryGreen};">✓</span>
                  </td>
                  <td style="vertical-align: middle;">
                    <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary};">استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND.border};">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: middle; width: 30px;">
                    <span style="color: ${BRAND.primaryGreen};">✓</span>
                  </td>
                  <td style="vertical-align: middle;">
                    <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary};">لا تشارك كلمة مرورك مع أي شخص</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: middle; width: 30px;">
                    <span style="color: ${BRAND.primaryGreen};">✓</span>
                  </td>
                  <td style="vertical-align: middle;">
                    <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary};">تأكد من تسجيل الخروج من الأجهزة المشتركة</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Security Warning -->
    <tr>
      <td style="padding: 0 40px 32px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: ${BRAND.error}10; border-radius: 12px; border: 1px solid ${BRAND.error}30;">
          <tr>
            <td style="padding: 16px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-left: 12px; vertical-align: top;">
                    <span style="font-size: 20px;">🚨</span>
                  </td>
                  <td style="vertical-align: top;">
                    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.error};">
                      لم تطلب إعادة تعيين كلمة المرور؟
                    </p>
                    <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">
                      إذا لم تقم بهذا الطلب، قد يكون حسابك في خطر. 
                      <a href="${baseUrl}/contact" style="color: ${BRAND.primaryGreen}; font-weight: 600;">تواصل معنا فوراً</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Help Section -->
    <tr>
      <td style="padding: 24px 40px 32px 40px; background-color: ${BRAND.bgElevated};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align: middle; padding-left: 16px;">
              <span style="font-size: 32px;">💬</span>
            </td>
            <td style="vertical-align: middle;">
              <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${BRAND.textPrimary};">
                هل تواجه مشكلة؟
              </p>
              <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted};">
                فريق الدعم متواجد لمساعدتك على 
                <a href="mailto:support@mohassansy.com" style="color: ${BRAND.primaryGreen};">support@mohassansy.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  
  return getEmailWrapper(content, 'طلب إعادة تعيين كلمة المرور لحسابك على موحسن');
}

/**
 * Send password reset email via Resend
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name: string
): Promise<void> {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  console.log('[EMAIL_RESET_URL]', resetUrl);
  console.log('[EMAIL_RESET_START] Recipient:', email, '| RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

  if (!process.env.RESEND_API_KEY) {
    console.log('[EMAIL_RESET_SKIP] No RESEND_API_KEY configured');
    console.log('======================================');
    console.log('PASSWORD RESET EMAIL (Resend not configured)');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`Reset URL: ${resetUrl}`);
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
      subject: 'إعادة تعيين كلمة المرور - موحسن',
      html: generatePasswordResetEmailHTML(resetUrl, name),
    });

    if (result.error) {
      console.error('[EMAIL_RESET_FAIL] Resend API error:', result.error.message);
      return;
    }

    console.log('[EMAIL_RESET_OK] Response:', JSON.stringify(result));
  } catch (error) {
    console.error('[EMAIL_RESET_FAIL] Error:', error);
  }
}
