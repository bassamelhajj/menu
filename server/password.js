import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const SCRYPT_KEYLEN = 64
export const MAX_PASSWORD_LENGTH = 200

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
  if (!/^[a-f0-9]{32}$/i.test(saltHex) || !/^[a-f0-9]{128}$/i.test(hashHex)) {
    return false
  }

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
