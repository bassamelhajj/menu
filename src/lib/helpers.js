/**
 * lib/helpers.js — دوال مساعدة مشتركة
 * ===========================================================================
 * ⚠️ لماذا في ملف منفصل؟
 *   Vite React Fast Refresh يفشل عندما يصدّر ملف **مكونات + قيم غير مكونة**
 *   (مثل الثوابت أو الدوال). عندها يفسد شجرة الـ React وتظهر أخطاء مثل
 *   "useApp must be used inside AppProvider" حتى لو الكود سليم.
 *
 *   الحل: المكونات في ملفاتها، والقيم المشتركة هنا — كل ملف له مسؤولية واحدة.
 */

/** مُعرّف فريد (Id) لكل عنصر جديد */
export const uid = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/**
 * دالة debounce — تأجيل تنفيذ دالة حتى يهدأ المستخدم
 * مفيدة لحقول البحث والإدخال
 */
export const debounce = (fn, ms = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
