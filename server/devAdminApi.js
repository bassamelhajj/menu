/**
 * server/devAdminApi.js — تشغيل نفس API الأدمن أثناء `npm run dev`
 * ===========================================================================
 * Vite لا يشغّل مجلد `api/` تلقائياً. هذا الـ plugin يمرّر طلبات
 * `/api/admin/*` إلى نفس معالجات السيرفر المستخدمة على Vercel، مع تحميل
 * القيم من `.env.local` (وليست من `VITE_*`).
 */

import { loadEnv } from 'vite'
import {
  adminLoginHandler,
  adminLogoutHandler,
  adminSessionHandler,
} from './adminAuth.js'

const SERVER_KEYS = [
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD_HASH',
  'ADMIN_SESSION_SECRET',
]

export function devAdminApi() {
  const attach = (server) => {
    server.middlewares.use(async (req, res, next) => {
      const path = String(req.url || '').split('?')[0]
      if (!path.startsWith('/api/admin/')) return next()

      try {
        if (path === '/api/admin/login') return await adminLoginHandler(req, res)
        if (path === '/api/admin/session') return await adminSessionHandler(req, res)
        if (path === '/api/admin/logout') return await adminLogoutHandler(req, res)
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'not_found' }))
      } catch {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: 'server_error' }))
      }
    })
  }

  return {
    name: 'benova-dev-admin-api',

    configResolved(config) {
      const env = loadEnv(config.mode, config.envDir || process.cwd(), '')
      for (const key of SERVER_KEYS) {
        if (env[key] && !process.env[key]) process.env[key] = env[key]
      }
    },

    configureServer: attach,
    configurePreviewServer: attach,
  }
}
