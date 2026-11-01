/**
 * src/lib/env.js — إعدادات عامة تصل للمتصفح
 * ===========================================================================
 * ⚠️ لا تضع أي كلمة سر أو بصمة أدمن هنا. بيانات الأدمن تعيش على السيرفر فقط
 *    (Vercel Environment Variables) ويتم التحقق منها عبر /api/admin/login.
 *
 * `VITE_SITE_PASSWORD_SHA256` اختياري لقفل واجهة المنيو. هو مجرد حاجز بصري
 * لأن الموقع ثابت؛ لا تعتمد عليه لحماية بيانات حقيقية.
 */

const text = (value) => String(value ?? '').trim()

const sha256 = (value) => {
  const hash = text(value).toLowerCase()
  return /^[a-f0-9]{64}$/.test(hash) ? hash : ''
}

export const SITE_PASSWORD_HASH = sha256(import.meta.env.VITE_SITE_PASSWORD_SHA256)
export const isSiteLockEnabled = Boolean(SITE_PASSWORD_HASH)
