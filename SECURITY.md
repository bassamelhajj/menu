# Security Policy — BENOVA Menu

## بيانات الدخول

- لا توجد كلمات سر مكتوبة داخل الكود أو `content.json`.
- المصادقة تتم على السيرفر عبر Vercel Functions:
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD_HASH` (scrypt)
  - `ADMIN_SESSION_SECRET`
- الجلسة تُحفظ في كوكي `HttpOnly` + `SameSite=Strict` + `Secure` على HTTPS.
- لا توجد أي قيمة أدمن ببادئة `VITE_`، لأنها تصبح عامة في حزمة المتصفح.
- لا تُرفع ملفات `.env` أو `.env.local` إلى Git.

## تغيير كلمة السر

1. شغّل:
   ```bash
   npm run hash -- "كلمة السر الجديدة"
   ```
2. على Vercel: حدّث `ADMIN_PASSWORD_HASH` ثم أعد النشر.
3. محلياً: حدّث `.env.local` ثم أعد تشغيل `npm run dev`.

لا يمكن تغيير كلمة السر من المتصفح بشكل آمن بدون قاعدة بيانات، لذلك لا
تُخزَّن أي كلمة سر أو بصمة قابلة للتعديل في `localStorage`.

## الحماية المطبقة

- scrypt للتحقق من كلمة السر.
- جلسة موقّعة بـ HMAC-SHA256 وصلاحية 8 ساعات.
- Rate limit للمحاولات الفاشلة (5 محاولات / 10 دقائق لكل IP).
- رؤوس أمان في `vercel.json`: CSP، HSTS، X-Frame-Options،
  X-Content-Type-Options، Referrer-Policy، Permissions-Policy.
- API يستخدم `Cache-Control: no-store`.

## حدود الأمان الحالية

- الموقع ثابت (Static) ولوحة التحكم محرّر محلي.
- حسابات الزبائن الحالية محلية في `localStorage` وليست مصادقة سيرفر.
  لا تستخدمها لبيانات حقيقية على دومين عام؛ انقلها إلى قاعدة بيانات
  ومصادقة خلفية (مثل Supabase أو Neon).
- قفل المنيو الاختياري (`VITE_SITE_PASSWORD_SHA256`) حاجز بصري فقط وليس
  حدود أمان حقيقية.
- Rate limit في الذاكرة لكل نسخة Serverless؛ للأمان الأعلى استخدم
  Upstash Redis أو خدمة مشابهة.

## الإبلاغ عن ثغرة

لا تنشر تفاصيل الثغرة علناً. أرسل تقريراً خاصاً إلى مالك المشروع.
