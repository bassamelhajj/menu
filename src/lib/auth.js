/**
 * lib/auth.js — أدوات بسيطة للحسابات (بدون سيرفر)
 * ===========================================================================
 * ⚠️ تنبيه أمني مهم وصريح:
 *   المشروع **بدون سيرفر**، فالبيانات كلها بتخزّن بالمتصفح.
 *   أي تشفير أو hashing هون هو **حماية بسيطة** (لحتى ما تقرأ كلمة السر
 *   بعينك بمفتّش المتصفح) — مش حماية حقيقية.
 *   الحماية الحقيقية تحتاج سيرفر + قاعدة بيانات.
 *
 * 📌 ليش hashing أصلاً؟
 *   بدل ما نخزّن كلمة السر كنص واضح، بنخزّن بصمتها.
 *   فحتى حدا فتح أدوات المطوّر ما بيقرأ كلمة السر مباشرة.
 */

/**
 * بصمة بسيطة (hash) لكلمة السر.
 * ليست تشفيراً قوياً — هدفها منع قراءة النص الصريح فقط.
 * @param {string} text
 * @returns {string} بصمة ثابتة الطول
 */
export function hashPassword(text) {
  const input = String(text ?? '')
  // بذرة ثابتة — بدونها الـ hash بيصير بسيطة كتير
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i)
    h1 = Math.imul(h1 ^ code, 0x01000193) >>> 0
    h2 = Math.imul(h2 + code, 0x85ebca6b) >>> 0
  }
  const a = (h1 >>> 0).toString(16).padStart(8, '0')
  const b = (h2 >>> 0).toString(16).padStart(8, '0')
  return `${a}${b}`
}

/**
 * SHA-256 for credentials supplied through environment variables.
 * Web Crypto keeps the plaintext out of the bundle; only the digest is built.
 */
export async function hashSecret(text) {
  const bytes = new TextEncoder().encode(String(text ?? ''))
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/** Compares a value with a stored SHA-256 hash in constant time. */
export async function verifySecret(value, expectedHash) {
  const expected = String(expectedHash || '').toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(expected) || !value) return false

  try {
    const actual = await hashSecret(value)
    let difference = actual.length ^ expected.length
    for (let i = 0; i < actual.length; i += 1) {
      difference |= actual.charCodeAt(i) ^ expected.charCodeAt(i)
    }
    return difference === 0
  } catch {
    // Web Crypto is unavailable outside secure contexts.
    return false
  }
}

/**
 * TEMPORARY local-development check: direct plaintext comparison.
 * Used only while the temp admin login is enabled in src/lib/env.js.
 * Production credentials must continue to use verifySecret().
 */
export function verifyPlainSecret(value, expected) {
  const target = String(expected ?? '')
  if (!target || value == null) return false
  return String(value) === target
}

/** هل الإيميل شكله صحيح؟ */
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim())

/** هل رقم الهاتف شكله معقول؟ (7 أرقام على الأقل بعد التنظيف) */
export const isPhone = (v) => {
  const digits = String(v || '').replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

/** تطبيع الإيميل: حروف صغيرة + بدون مسافات */
export const normEmail = (v) => String(v || '').trim().toLowerCase()

/** تطبيع الهاتف: أرقام فقط */
export const normPhone = (v) => String(v || '').replace(/\D/g, '')

/**
 * ⬇️ تصغير الصورة قبل التخزين
 * ليش ضرورية؟ لأن localStorage حدو ~5 ميغا، والصور الكبيرة بتملاه فوراً.
 * بنصغّر الصورة لـ 900px عرض وبنضغطها JPEG بجودة 0.72.
 * @param {File} file
 * @param {number} maxDim
 * @param {number} quality
 * @returns {Promise<string>} صورة بصيغة dataURL
 */
export function fileToCompressedDataUrl(file, maxDim = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('الملف مش صورة'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('تعذّرت قراءة الصورة'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('صورة غير صالحة'))
      img.onload = () => {
        // نحسب المقاس الجديد مع الحفاظ على النسبة
        let { width, height } = img
        if (width > height && width > maxDim) {
          height = Math.round((height / width) * maxDim)
          width = maxDim
        } else if (height >= width && height > maxDim) {
          width = Math.round((width / height) * maxDim)
          height = maxDim
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        // خلفية بيضاء لأن PNG شفاف بيطلع أسود لما يتحوّل JPEG
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

/** ⬇️ نزّل نص كملف (CSV مثلاً) */
export function downloadTextFile(text, filename, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}