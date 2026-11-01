/**
 * lib/session.js — جلسة الزبون المسجّل دخوله
 * ===========================================================================
 * 📌 ليش ملف منفصل؟
 *   لأننا نحتاج نعرف «مينInside داخل حسابه» في **أكثر من صفحة**:
 *   • صفحة الحساب (لتعديل أو كتابة رأي)
 *   • صفحة الآراء (لنعرض نموذج الكتابة مباشرة بدل زر)
 *
 * ⚠️ ليش sessionStorage مش localStorage؟
 *   لأن لمّا يسكّر المتصفح، الزبون لازم يسجّل دخول من جديد.
 *   (غير مزعج للصاحب، وآمن أكتر)
 */

/** المفتاح اللي بنحفظ فيه الحساب داخل الجلسة */
const KEY = 'benova:customer'

/**
 * بيقرأ الحساب المحفوظ (أو null).
 * ⚠️ بنقرأ من sessionStorage مباشرة كل مرة بدون cache،
 *    لأن الكاش كان بيخزّن قيمة قديمة بعد تسجيل الخروج
 *    (فالحساب بيضل ظاهر حتى بعد ما نضغط «خروج»).
 *    sessionStorage قراءة سريعة جداً فالقراءة المباشرة أرخص من الغلطة.
 */
export function getSession() {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** بيحفظ الحساب بعد الدخول/التسجيل */
export function setSession(user) {
  try {
    if (user) sessionStorage.setItem(KEY, JSON.stringify(user))
    else sessionStorage.removeItem(KEY)
  } catch {
    /* وضع التصفح الخاص — نتجاهل بهدوء */
  }
  return user
}

/** ⏏️ خروج */
export function clearSession() {
  return setSession(null)
}
