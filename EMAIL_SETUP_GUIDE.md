# 🔧 دليل إعداد نظام التحقق من البريد الإلكتروني

## 📋 الخطوات المطلوبة للإعداد

### الخطوة 1: إضافة متغيرات البيئة 🔐

أضف هذه المتغيرات إلى ملف `.env.local`:

```env
# مطلوب
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this

# اختياري - للإرسال الحقيقي للبريد
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

#### كيفية الحصول على `RESEND_API_KEY`:
1. اذهب إلى [resend.com](https://resend.com)
2. أنشئ حساباً
3. اذهب إلى Dashboard → API Keys
4. انسخ API Key الخاص بك
5. أضفه إلى ملف `.env.local`

### الخطوة 2: التحقق من قاعدة البيانات ✅

تأكد من أن Prisma schema يحتوي على جداول:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?
  name          String?
  emailVerified DateTime? // هذا حقل مهم!
  // ... الحقول الأخرى
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### الخطوة 3: تشغيل التطبيق 🚀

```bash
# تثبيت المكتبات
pnpm install

# تطبيق migrations على قاعدة البيانات
pnpm db:push

# تشغيل الخادم
pnpm dev
```

---

## 🧪 اختبار النظام

### السيناريو 1: تسجيل جديد بدون Resend API

1. اذهب إلى http://localhost:3000/register
2. ملأ النموذج:
   - الاسم: `تجربة تست`
   - البريد: `test@example.com`
   - كلمة المرور: `password123`

3. انقر "إنشاء حساب"

4. افتح console الخادم (حيث تشغل `pnpm dev`):
   ```
   ======================================
   VERIFICATION EMAIL (Resend not configured)
   To: test@example.com
   Name: تجربة تست
   Verification URL: http://localhost:3000/api/auth/verify-email?token=abc123...
   ======================================
   ```

5. انسخ الرابط الكامل واذهب إليه في المتصفح

6. يجب أن ترى صفحة "تم تأكيد البريد" ✅

### السيناريو 2: تسجيل جديد مع Resend API

1. أضف `RESEND_API_KEY` إلى `.env.local`
2. أعد تشغيل التطبيق (`pnpm dev`)
3. كرر السيناريو السابق
4. هذه المرة سيتم إرسال بريد إلكتروني فعلي
5. تحقق من صندوق البريد الوارد

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا أرى رابط التحقق في console

**الحل:**
- تأكد من وجود الرسالة في console الخادم (ليس المتصفح)
- قد تحتاج إلى التمرير لأعلى في console

### المشكلة: "خطأ في Resend"

**الحل:**
- تأكد من أن API Key صحيح
- تحقق من أن البريد الإلكتروني صحيح
- جرب إعادة تشغيل الخادم بعد إضافة المتغير

### المشكلة: "البريد الإلكتروني مستخدم بالفعل"

**الحل:**
- هذا يعني أن المستخدم موجود بالفعل
- حاول ببريد إلكتروني مختلف

### المشكلة: "توكن منتهي الصلاحية"

**الحل:**
- التوكن صالح لـ 24 ساعة فقط
- اطلب بريد تحقق جديد من صفحة verify-email

---

## 📊 ملخص تدفق العملية

```
التسجيل 
  ↓
[POST /api/auth/register]
  ↓
{
  - إنشاء user
  - إنشاء verification token
  - إرسال بريد (أو طباعة الرابط)
  - إرجاع رسالة نجاح
}
  ↓
المستخدم ينقر الرابط في البريد
  ↓
[GET /api/auth/verify-email?token=xxx]
  ↓
{
  - التحقق من التوكن
  - تحديث emailVerified
  - حذف التوكن
  - إعادة توجيه للنجاح
}
  ↓
✅ البريد مؤكد - يمكن تسجيل الدخول
```

---

## 🔐 نقاط الأمان المهمة

| النقطة | الوصف |
|--------|-------|
| **التوكن العشوائي** | 32 بايت عشوائي = قوي جداً |
| **صلاحية محدودة** | 24 ساعة فقط |
| **استخدام واحد** | التوكن يُحذف بعد الاستخدام |
| **معدل التحديد** | بريد واحد في الدقيقة |
| **عدم نقل كلمة المرور** | البريد لا يحتوي على كلمة المرور |

---

## 🚀 خطوات الإنتاج (Production)

قبل النشر على الويب:

1. ✅ أضف `RESEND_API_KEY` إلى متغيرات البيئة
2. ✅ غير `NEXTAUTH_URL` إلى نطاقك الفعلي (مثل `https://myapp.com`)
3. ✅ غير `NEXTAUTH_SECRET` إلى قيمة عشوائية قوية
4. ✅ اختبر النظام مرة أخرى
5. ✅ تحقق من أن البريد يصل إلى الصندوق الوارد (وليس الرسائل غير المرغوب فيها)

### لتوليد `NEXTAUTH_SECRET` القوي:

```bash
# في Linux/Mac
openssl rand -base64 32

# في PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))
```

---

## 📞 الدعم

- **مشاكل Resend:** اذهب إلى [resend.com/docs](https://resend.com/docs)
- **مشاكل NextAuth:** اذهب إلى [next-auth.js.org](https://next-auth.js.org)
- **مشاكل Prisma:** اذهب إلى [prisma.io/docs](https://prisma.io/docs)
