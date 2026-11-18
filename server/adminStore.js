import { dbQuery } from './db.js'

const ADMIN_FIELDS = 'id, username, password_hash, session_version'
const text = (value) => String(value ?? '').trim()

/**
 * Creates the first admin from the bootstrap environment variables when the
 * table is empty. After that, the database becomes the source of truth.
 */
export async function ensureInitialAdmin() {
  const existing = await dbQuery('SELECT id FROM admin_users LIMIT 1')
  if (existing.rowCount > 0) return true

  const username = text(process.env.ADMIN_USERNAME)
  const passwordHash = text(process.env.ADMIN_PASSWORD_HASH)
  if (!username || !passwordHash) return false

  await dbQuery(
    `INSERT INTO admin_users (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [username, passwordHash],
  )

  const created = await dbQuery('SELECT id FROM admin_users LIMIT 1')
  return created.rowCount > 0
}

export async function findAdminByUsername(username) {
  const result = await dbQuery(
    `SELECT ${ADMIN_FIELDS}
     FROM admin_users
     WHERE LOWER(username) = LOWER($1)
     LIMIT 1`,
    [text(username)],
  )
  return result.rows[0] || null
}

export async function findAdminById(id) {
  const result = await dbQuery(
    `SELECT ${ADMIN_FIELDS}
     FROM admin_users
     WHERE id = $1
     LIMIT 1`,
    [id],
  )
  return result.rows[0] || null
}

export async function updateAdminCredentials({ id, username, passwordHash }) {
  const result = await dbQuery(
    `UPDATE admin_users
     SET username = $2,
         password_hash = $3,
         session_version = session_version + 1,
         updated_at = now()
     WHERE id = $1
     RETURNING ${ADMIN_FIELDS}`,
    [id, text(username), passwordHash],
  )
  return result.rows[0] || null
}

export async function logAdminEvent({ adminId, action, ip, userAgent }) {
  try {
    await dbQuery(
      `INSERT INTO admin_audit_log (admin_id, action, ip, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [adminId, action, ip || null, userAgent || null],
    )
  } catch {
    // Audit failures must never block an authenticated action.
  }
}
