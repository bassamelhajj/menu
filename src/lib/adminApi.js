/**
 * src/lib/adminApi.js — التواصل مع مصادقة الأدمن على السيرفر
 * ===========================================================================
 * الجلسة الحقيقية هي كوكي HttpOnly يضبطه السيرفر. لا نخزّن كلمة السر ولا
 * البصمة في المتصفح. هذه الدوال لا تفعل شيئاً سوى إرسال الطلب وقراءة الرد.
 */

const request = async (path, options = {}) => {
  try {
    const response = await fetch(path, {
      cache: 'no-store',
      credentials: 'same-origin',
      ...options,
    })
    const data = await response.json().catch(() => null)
    return { ok: response.ok, status: response.status, data }
  } catch {
    return { ok: false, status: 0, data: null, networkError: true }
  }
}

export function loginAdmin(username, password) {
  return request('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}

export function getAdminSession() {
  return request('/api/admin/session')
}

export function logoutAdmin() {
  return request('/api/admin/logout', { method: 'POST' })
}
