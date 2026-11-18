import { createHmac, timingSafeEqual } from 'node:crypto'
import { hashAdminPassword, MAX_PASSWORD_LENGTH, verifyAdminPassword } from './password.js'
import { isDatabaseConfigured } from './db.js'
import {
  ensureInitialAdmin,
  findAdminById,
  findAdminByUsername,
  logAdminEvent,
  updateAdminCredentials,
} from './adminStore.js'

export { hashAdminPassword, verifyAdminPassword }

const COOKIE_NAME = 'benova_admin'
const SESSION_TTL_SECONDS = 8 * 60 * 60
const MIN_PASSWORD_LENGTH = 12
const USERNAME_PATTERN = /^[A-Za-z0-9._@+-]{3,64}$/

const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000
const attempts = new Map()

const text = (value) => String(value ?? '').trim()

const safeEqual = (a, b) => {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

const sessionSecret = () => text(process.env.ADMIN_SESSION_SECRET)

const hasBootstrapCredentials = () =>
  Boolean(text(process.env.ADMIN_USERNAME) && text(process.env.ADMIN_PASSWORD_HASH))

const configured = () =>
  sessionSecret().length >= 32 &&
  (isDatabaseConfigured() || hasBootstrapCredentials())

const legacyAdmin = () => {
  const username = text(process.env.ADMIN_USERNAME)
  const passwordHash = text(process.env.ADMIN_PASSWORD_HASH)
  if (!username || !passwordHash) return null
  return { id: null, username, password_hash: passwordHash, session_version: 0 }
}

const sign = (payload) =>
  createHmac('sha256', sessionSecret()).update(payload).digest('base64url')

function createSessionToken(admin) {
  const payload = {
    u: admin.username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }

  if (isDatabaseConfigured()) {
    payload.sub = String(admin.id)
    payload.ver = Number(admin.session_version)
  }

  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${encoded}.${sign(encoded)}`
}

async function readSessionToken(token) {
  const value = text(token)
  const dot = value.lastIndexOf('.')
  if (dot <= 0) return null

  const payload = value.slice(0, dot)
  const signature = value.slice(dot + 1)
  if (!safeEqual(signature, sign(payload))) return null

  let data
  try {
    data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }

  if (!data || typeof data.u !== 'string') return null
  if (Number(data.exp) <= Math.floor(Date.now() / 1000)) return null

  if (!isDatabaseConfigured()) {
    const expected = text(process.env.ADMIN_USERNAME)
    return safeEqual(data.u.toLowerCase(), expected.toLowerCase()) ? legacyAdmin() : null
  }

  if (!data.sub) return null
  const admin = await findAdminById(String(data.sub))
  if (!admin) return null
  if (!safeEqual(data.u, admin.username)) return null
  if (Number(data.ver) !== Number(admin.session_version)) return null
  return admin
}

function parseCookies(req) {
  const header = String(req.headers?.cookie || '')
  const cookies = {}
  for (const part of header.split(';')) {
    const index = part.indexOf('=')
    if (index < 0) continue
    const key = part.slice(0, index).trim()
    const value = part.slice(index + 1).trim()
    if (key) cookies[key] = decodeURIComponent(value)
  }
  return cookies
}

function cookieHeader(req, token, maxAge) {
  const host = String(req.headers?.host || '')
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host)
  const secure =
    !isLocal &&
    (process.env.NODE_ENV === 'production' ||
      String(req.headers?.['x-forwarded-proto'] || '').split(',')[0].trim() === 'https')

  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token || '')}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
  ]

  if (secure) parts.push('Secure')
  return parts.join('; ')
}

function clientIp(req) {
  const forwarded = String(req.headers?.['x-forwarded-for'] || '')
    .split(',')[0]
    .trim()
  return forwarded || req.socket?.remoteAddress || 'unknown'
}

function isRateLimited(key) {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || now - entry.startedAt > WINDOW_MS) {
    attempts.set(key, { count: 0, startedAt: now })
    return false
  }
  return entry.count >= MAX_ATTEMPTS
}

function recordFailure(key) {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || now - entry.startedAt > WINDOW_MS) {
    attempts.set(key, { count: 1, startedAt: now })
    return
  }
  entry.count += 1
}

function clearFailures(key) {
  attempts.delete(key)
}

async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return null
    }
  }

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function sendDatabaseError(res, error) {
  if (error?.code === '42P01') {
    sendJson(res, 503, { error: 'database_not_initialized' })
    return
  }
  sendJson(res, 503, { error: 'database_unavailable' })
}

export async function adminLoginHandler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'method_not_allowed' })
    return
  }

  if (!configured()) {
    sendJson(res, 503, { error: 'not_configured' })
    return
  }

  const body = await readJson(req)
  const username = text(body?.username)
  const password = String(body?.password ?? '')
  const key = `${clientIp(req)}:${username.toLowerCase() || 'login'}`

  if (isRateLimited(key)) {
    sendJson(res, 429, { error: 'too_many_attempts' })
    return
  }

  if (!username || !password) {
    recordFailure(key)
    sendJson(res, 400, { error: 'missing_credentials' })
    return
  }

  try {
    if (isDatabaseConfigured()) {
      const ready = await ensureInitialAdmin()
      if (!ready) {
        sendJson(res, 503, { error: 'admin_not_initialized' })
        return
      }
    }

    const admin = isDatabaseConfigured()
      ? await findAdminByUsername(username)
      : legacyAdmin()

    if (!admin) {
      recordFailure(key)
      sendJson(res, 401, { error: 'invalid_credentials' })
      return
    }

    const userOk = safeEqual(username.toLowerCase(), admin.username.toLowerCase())
    const passwordOk = verifyAdminPassword(password, admin.password_hash)

    if (!userOk || !passwordOk) {
      recordFailure(key)
      sendJson(res, 401, { error: 'invalid_credentials' })
      return
    }

    clearFailures(key)
    res.setHeader('Set-Cookie', cookieHeader(req, createSessionToken(admin), SESSION_TTL_SECONDS))
    sendJson(res, 200, { authenticated: true, username: admin.username })
  } catch (error) {
    sendDatabaseError(res, error)
  }
}

export async function adminSessionHandler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'method_not_allowed' })
    return
  }

  if (!configured()) {
    sendJson(res, 503, { authenticated: false, error: 'not_configured' })
    return
  }

  try {
    const token = parseCookies(req)[COOKIE_NAME]
    const admin = await readSessionToken(token)
    sendJson(res, 200, {
      authenticated: Boolean(admin),
      username: admin ? admin.username : null,
    })
  } catch (error) {
    sendDatabaseError(res, error)
  }
}

export async function adminCredentialsHandler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'method_not_allowed' })
    return
  }

  if (!isDatabaseConfigured()) {
    sendJson(res, 503, { error: 'database_not_configured' })
    return
  }

  if (!configured()) {
    sendJson(res, 503, { error: 'not_configured' })
    return
  }

  const key = `credentials:${clientIp(req)}`
  if (isRateLimited(key)) {
    sendJson(res, 429, { error: 'too_many_attempts' })
    return
  }

  try {
    const admin = await readSessionToken(parseCookies(req)[COOKIE_NAME])
    if (!admin) {
      sendJson(res, 401, { error: 'unauthorized' })
      return
    }

    const body = await readJson(req)
    const currentPassword = String(body?.currentPassword ?? '')
    const username = text(body?.username)
    const newPassword = String(body?.newPassword ?? '')
    const confirmPassword = String(body?.confirmPassword ?? '')

    if (!currentPassword) {
      sendJson(res, 400, { error: 'current_password_required' })
      return
    }

    if (!USERNAME_PATTERN.test(username)) {
      sendJson(res, 400, { error: 'invalid_username' })
      return
    }

    if (newPassword && newPassword.length < MIN_PASSWORD_LENGTH) {
      sendJson(res, 400, { error: 'password_too_short' })
      return
    }

    if (newPassword.length > MAX_PASSWORD_LENGTH) {
      sendJson(res, 400, { error: 'password_too_long' })
      return
    }

    if (newPassword !== confirmPassword) {
      sendJson(res, 400, { error: 'password_mismatch' })
      return
    }

    if (!verifyAdminPassword(currentPassword, admin.password_hash)) {
      recordFailure(key)
      sendJson(res, 401, { error: 'invalid_current_password' })
      return
    }

    if (newPassword && verifyAdminPassword(newPassword, admin.password_hash)) {
      sendJson(res, 400, { error: 'password_reused' })
      return
    }

    const usernameChanged = username.toLowerCase() !== admin.username.toLowerCase()
    if (!newPassword && !usernameChanged) {
      sendJson(res, 400, { error: 'no_changes' })
      return
    }

    const passwordHash = newPassword ? hashAdminPassword(newPassword) : admin.password_hash
    const updated = await updateAdminCredentials({
      id: admin.id,
      username,
      passwordHash,
    })

    if (!updated) {
      sendJson(res, 404, { error: 'admin_not_found' })
      return
    }

    clearFailures(key)
    res.setHeader('Set-Cookie', cookieHeader(req, createSessionToken(updated), SESSION_TTL_SECONDS))
    await logAdminEvent({
      adminId: updated.id,
      action:
        newPassword && usernameChanged
          ? 'credentials_changed'
          : newPassword
            ? 'password_changed'
            : 'username_changed',
      ip: clientIp(req),
      userAgent: req.headers?.['user-agent'],
    })
    sendJson(res, 200, { authenticated: true, username: updated.username })
  } catch (error) {
    if (error?.code === '23505') {
      sendJson(res, 409, { error: 'username_taken' })
      return
    }
    sendDatabaseError(res, error)
  }
}

export async function adminLogoutHandler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'method_not_allowed' })
    return
  }

  res.setHeader('Set-Cookie', cookieHeader(req, '', 0))
  sendJson(res, 200, { authenticated: false })
}
