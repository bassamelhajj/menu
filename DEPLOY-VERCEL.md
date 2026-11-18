# نشر BENOVA على Vercel + دومين

هذا الدليل يفترض أن المستودع مرفوع على GitHub:

`https://github.com/bassamelhajj/menu`

## 1. أنشئ كلمة سر إنتاج قوية

لا تستخدم كلمة السر المحلية القديمة. من مجلد المشروع:

```bash
npm run secret
npm run hash -- "عبارة-مرور-طويلة-جديدة"
```

- الأمر الأول يطبع `ADMIN_SESSION_SECRET`.
- الأمر الثاني يطبع `ADMIN_PASSWORD_HASH` بصيغة `scrypt$...`.
- احفظ كلمة السر نفسها في مدير كلمات السر.

## 2. أنشئ قاعدة بيانات Postgres

استخدم Neon أو Supabase أو أي Postgres مُدار. انسخ **pooled connection
string** وضعه في `DATABASE_URL`.

محلياً، أضف إلى `.env.local`:

```dotenv
DATABASE_URL=postgres://...
```

ثم أنشئ الجداول وأول أدمن:

```bash
npm run db:init
```

الدليل الكامل: [`DATABASE.md`](./DATABASE.md).

## 3. اربط GitHub بـ Vercel

1. افتح <https://vercel.com/new>.
2. اختر **Import Git Repository**.
3. اختر مستودع `menu`.
4. Framework Preset: **Vite** (يُكتشف تلقائياً).
5. Build Command: `npm run build`.
6. Output Directory: `dist`.

## 4. أضف متغيرات البيئة

قبل الضغط على Deploy، افتح **Environment Variables** وأضف:

| الاسم | القيمة |
|---|---|
| `ADMIN_USERNAME` | `admin@benova.com` أو اسم المستخدم الذي تريده |
| `ADMIN_PASSWORD_HASH` | ناتج `npm run hash` |
| `ADMIN_SESSION_SECRET` | ناتج `npm run secret` |
| `DATABASE_URL` | Pooled Postgres connection string |

- ضعها في **Production** و**Preview** إذا كنت تستخدم Preview.
- لا تضع بادئة `VITE_` على أي منها.
- `VITE_SITE_PASSWORD_SHA256` اختياري لقفل واجهة المنيو، وهو حاجز بصري فقط.

## 5. انشر

قبل أول دخول، أنشئ الجداول في قاعدة البيانات الإنتاجية. إما:

- نفّذ محتوى `db/schema.sql` في SQL Editor الخاص بمزود Postgres، أو
- شغّل `npm run db:init` مع `DATABASE_URL` الإنتاجي.

ثم اضغط **Deploy**. بعد الانتهاء:

1. افتح رابط `*.vercel.app`.
2. افتح `/#/admin`.
3. سجّل الدخول بكلمة السر الإنتاجية. أول دخول ينشئ حساب الأدمن من
   `ADMIN_USERNAME` و`ADMIN_PASSWORD_HASH` إذا كان الجدول فارغاً.
4. افتح تبويب **بيانات الدخول** وغيّر كلمة السر إذا رغبت.
5. اضغط **خروج** وتأكد من العودة لصفحة الدخول.

إذا ظهر خطأ `503`، تحقق من المتغيرات الأربعة ومن أن
`ADMIN_SESSION_SECRET` لا يقل عن 32 حرفاً.

## 6. أضف الدومين

1. من المشروع في Vercel: **Settings → Domains**.
2. أضف الدومين، مثلاً `benova.com` و`www.benova.com`.
3. اتبع تعليمات DNS التي يعرضها Vercel:
   - عادةً `A` للجذر أو `CNAME` لـ `www`.
4. انتظر انتشار DNS. Vercel يضبط شهادة HTTPS تلقائياً.
5. أعد اختبار `https://your-domain.com/#/admin`.

## 7. فحص أمني بعد النشر

- [ ] الدخول يعمل بكلمة السر الجديدة فقط.
- [ ] كلمة السر القديمة لا تعمل.
- [ ] الخروج يمسح الجلسة.
- [ ] `/#/admin` يعيد صفحة الدخول بعد الخروج.
- [ ] HTTPS يعمل بدون تحذير.
- [ ] ملف `.env.local` غير موجود في GitHub.
- [ ] `ADMIN_PASSWORD_HASH` و`ADMIN_SESSION_SECRET` و`DATABASE_URL` موجودة في Vercel فقط.
- [ ] `npm audit --omit=dev` يعطي `0 vulnerabilities`.

## ملاحظات مهمة

- بعد إنشاء أول حساب في قاعدة البيانات، غيّر بيانات الدخول من تبويب
  **بيانات الدخول** داخل لوحة التحكم. لا تحتاج إلى تعديل الكود أو إعادة النشر.
- `ADMIN_USERNAME` و`ADMIN_PASSWORD_HASH` يُستخدمان فقط لإنشاء أول حساب
  عندما يكون جدول `admin_users` فارغاً.
- لا تُحفظ كلمة السر في المتصفح.
- حسابات الزبائن ما زالت محلية في `localStorage` وليست مصادقة سيرفر.
  للاستخدام التجاري الكامل، انقلها إلى قاعدة بيانات ومصادقة خلفية.
- قفل المنيو `VITE_SITE_PASSWORD_SHA256` حاجز بصري فقط؛ لا تعتمد عليه
  لحماية محتوى حساس.
- Rate limit الحالي في ذاكرة الدالة. إذا احتجت حماية أقوى من brute force،
  استخدم Upstash Redis أو خدمة مشابهة.
