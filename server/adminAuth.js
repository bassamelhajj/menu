/**
 * server/adminAuth.js — مصادقة الأدمن على السيرفر
 * ===========================================================================
 * لماذا؟
 *   أي كلمة سر تُرسل إلى المتصفح عبر `VITE_*` تصبح مكشوفة. لذلك، في الإنتاج،
 *   يتم التحقق من كلمة السر داخل Vercel Function فقط، وتُعاد جلسة موقّعة
 *   داخل كوكي HttpOnly. المتصفح لا يرى كلمة السر ولا البصمة ولا مفتاح الجلسة.
 *
 * المتغيرات المطلوبة على السيرفر (Vercel):
 *   ADMIN_USERNAME        اسم مستخدم الأدمن
 *   ADMIN_PASSWORD_HASH   بصمة scrypt من scripts/hash-password.mjs
 *   ADMIN_SESSION_SECRET  مفتاح عشوائي طويل لتوقيع الجلسة
 */

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'benova_admin'
const SESSION_TTL_SECONDS = 8 * 60 * 60
const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const SCRYPT_KEYLEN = 64
const MAX_PASSWORD_LENGTH = 200

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

/** ينشئ بصمة scrypt بالصيغة: scrypt$N$r$p$salt$hash */
export function hashAdminPassword(password) {
  const value = String(password ?? '')
  if (!value) throw new Error('Password is required')
  const salt = randomBytes(16)
  const hash = scryptSync(value, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 128 * 1024 * 1024,
  })
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('hex')}$${hash.toString('hex')}`
}

/** يتحقق من كلمة السر مقابل بصمة scrypt. */
export function verifyAdminPassword(password, stored) {
  const value = String(password ?? '')
  if (!value || value.length > MAX_PASSWORD_LENGTH) return false

  const parts = String(stored ?? '').split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const [, n, r, p, saltHex, hashHex] = parts
  const N = Number(n)
  const rValue = Number(r)
  const pValue = Number(p)
  if (!Number.isInteger(N) || !Number.isInteger(rValue) || !Number.isInteger(pValue)) {
    return false
  }
  if (!/^[a-f0-9]{32}$/i.test(saltHex) || !/^[a-f0-9]{128}$/i.test(hashHex)) return false

  try {
    const expected = Buffer.from(hashHex, 'hex')
    const actual = scryptSync(value, Buffer.from(saltHex, 'hex'), expected.length, {
      N,
      r: rValue,
      p: pValue,
      maxmem: 128 * 1024 * 1024,
    })
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

const sessionSecret = () => text(process.env.ADMIN_SESSION_SECRET)

const configured = () =>
  Boolean(
    text(process.env.ADMIN_USERNAME) &&
      text(process.env.ADMIN_PASSWORD_HASH) &&
      sessionSecret().length >= 32,
  )

const sign = (payload) =>
  createHmac('sha256', sessionSecret()).update(payload).digest('base64url')

function createSessionToken(username) {
  const payload = Buffer.from(
    JSON.stringify({
      u: username,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    }),
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function readSessionToken(token) {
  const value = text(token)
  const dot = value.lastIndexOf('.')
  if (dot <= 0) return null

  const payload = value.slice(0, dot)
  const signature = value.slice(dot + 1)
  if (!safeEqual(signature, sign(payload))) return null

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data || typeof data.u !== 'string') return null
    if (Number(data.exp) <= Math.floor(Date.now() / 1000)) return null
    if (!safeEqual(data.u, text(process.env.ADMIN_USERNAME))) return null
    return data
  } catch {
    return null
  }
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

export async function adminLoginHandler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'method_not_allowed' })
    return
  }

  if (!configured()) {
    sendJson(res, 503, { error: 'not_configured' })
    return
  }

  const key = `${clientIp(req)}:${text(process.env.ADMIN_USERNAME).toLowerCase()}`
  if (isRateLimited(key)) {
    sendJson(res, 429, { error: 'too_many_attempts' })
    return
  }

  const body = await readJson(req)
  const username = text(body?.username)
  const password = String(body?.password ?? '')
  const expectedUser = text(process.env.ADMIN_USERNAME)
  const expectedHash = text(process.env.ADMIN_PASSWORD_HASH)

  if (!username || !password) {
    recordFailure(key)
    sendJson(res, 400, { error: 'missing_credentials' })
    return
  }

  const userOk = safeEqual(username, expectedUser)
  const passwordOk = verifyAdminPassword(password, expectedHash)

  if (!userOk || !passwordOk) {
    recordFailure(key)
    sendJson(res, 401, { error: 'invalid_credentials' })
    return
  }

  clearFailures(key)
  const token = createSessionToken(expectedUser)
  res.setHeader('Set-Cookie', cookieHeader(req, token, SESSION_TTL_SECONDS))
  sendJson(res, 200, { authenticated: true, username: expectedUser })
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

  const token = parseCookies(req)[COOKIE_NAME]
  const session = readSessionToken(token)
  sendJson(res, 200, {
    authenticated: Boolean(session),
    username: session ? text(process.env.ADMIN_USERNAME) : null,
  })
}

export async function adminLogoutHandler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'method_not_allowed' })
    return
  }

  res.setHeader('Set-Cookie', cookieHeader(req, '', 0))
  sendJson(res, 200, { authenticated: false })
}
