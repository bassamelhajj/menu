/**
 * Authentication settings.
 *
 * LOCAL DEVELOPMENT ONLY:
 *   While `npm run dev` is running, the admin login accepts the temporary
 *   credentials below directly. This bypasses the SHA-256/environment setup
 *   so the dashboard can be opened immediately.
 *
 * PRODUCTION:
 *   `import.meta.env.DEV` is false during `vite build`, so the temporary
 *   password is not bundled. Production keeps using the VITE_ SHA-256 hashes.
 *
 * To remove the temporary login entirely, delete the TEMP_LOCAL_ADMIN block
 * and the `useTempLocalAdmin` branches below.
 */
const TEMP_LOCAL_ADMIN = {
  username: 'admin@benova.com',
  password: 'Password@BeNova!@2004#$',
}

import { hashSecret, verifyPlainSecret, verifySecret } from './auth.js'

const ADMIN_PASSWORD_OVERRIDE_KEY = 'benova:admin-password-hash'

const text = (value) => String(value ?? '').trim()

const sha256 = (value) => {
  const hash = text(value).toLowerCase()
  return /^[a-f0-9]{64}$/.test(hash) ? hash : ''
}

const useTempLocalAdmin = import.meta.env.DEV

export const isTempLocalAdminEnabled = useTempLocalAdmin

export const ADMIN_USERNAME = useTempLocalAdmin
  ? TEMP_LOCAL_ADMIN.username
  : text(import.meta.env.VITE_ADMIN_USERNAME)

/** Plaintext is exposed only in local dev; production uses the hash below. */
export const ADMIN_PASSWORD_PLAIN = useTempLocalAdmin
  ? TEMP_LOCAL_ADMIN.password
  : ''

export const ADMIN_PASSWORD_HASH = useTempLocalAdmin
  ? ''
  : sha256(import.meta.env.VITE_ADMIN_PASSWORD_SHA256)

export const SITE_PASSWORD_HASH = sha256(import.meta.env.VITE_SITE_PASSWORD_SHA256)

export const isAdminAuthConfigured = Boolean(
  ADMIN_USERNAME &&
    (getAdminPasswordOverride() || ADMIN_PASSWORD_PLAIN || ADMIN_PASSWORD_HASH),
)
export const isSiteLockEnabled = Boolean(SITE_PASSWORD_HASH)

/** Returns the locally stored admin password hash, if any. */
export function getAdminPasswordOverride() {
  try {
    const value = localStorage.getItem(ADMIN_PASSWORD_OVERRIDE_KEY)
    return /^[a-f0-9]{64}$/.test(String(value || '').toLowerCase())
      ? String(value).toLowerCase()
      : ''
  } catch {
    return ''
  }
}

/** Stores a new admin password as a SHA-256 hash. */
export async function changeAdminPassword(newPassword) {
  const hash = await hashSecret(newPassword)
  localStorage.setItem(ADMIN_PASSWORD_OVERRIDE_KEY, hash)
  return hash
}

/** Removes the local override and returns to the configured/default password. */
export function resetAdminPassword() {
  try {
    localStorage.removeItem(ADMIN_PASSWORD_OVERRIDE_KEY)
  } catch {
    // Ignore storage errors.
  }
}

/** Verifies a password against the effective admin password. */
export async function verifyAdminPassword(password) {
  const override = getAdminPasswordOverride()
  if (override) return verifySecret(password, override)
  if (isTempLocalAdminEnabled && ADMIN_PASSWORD_PLAIN) {
    return verifyPlainSecret(password, ADMIN_PASSWORD_PLAIN)
  }
  return verifySecret(password, ADMIN_PASSWORD_HASH)
}

export function hasAdminPasswordOverride() {
  return Boolean(getAdminPasswordOverride())
}
