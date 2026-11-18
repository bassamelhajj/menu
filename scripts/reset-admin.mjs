import { loadEnv } from 'vite'
import pg from 'pg'
import { hashAdminPassword } from '../server/password.js'

const { Pool } = pg

const env = loadEnv('development', process.cwd(), '')
for (const key of ['DATABASE_URL', 'DATABASE_SSL', 'ADMIN_USERNAME']) {
  if (env[key] && !process.env[key]) process.env[key] = env[key]
}

const password = process.argv.slice(2).join(' ')
if (!password) {
  console.error('Usage: npm run db:reset-admin -- "new password"')
  process.exit(1)
}

if (password.length < 12) {
  console.error('Use at least 12 characters for the admin password.')
  process.exit(1)
}

const databaseUrl = String(process.env.DATABASE_URL || '').trim()
if (!databaseUrl) {
  console.error('DATABASE_URL is missing. Add it to .env.local first.')
  process.exit(1)
}

const username = String(process.env.ADMIN_USERNAME || 'admin').trim()
const passwordHash = hashAdminPassword(password)
const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  ssl: process.env.DATABASE_SSL === 'disable' ? false : undefined,
})

try {
  const existing = await pool.query('SELECT id FROM admin_users ORDER BY id LIMIT 1')

  if (existing.rowCount > 0) {
    await pool.query(
      `UPDATE admin_users
       SET username = $2,
           password_hash = $3,
           session_version = session_version + 1,
           updated_at = now()
       WHERE id = $1`,
      [existing.rows[0].id, username, passwordHash],
    )
    console.log(`Admin credentials reset for: ${username}`)
  } else {
    await pool.query(
      'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)',
      [username, passwordHash],
    )
    console.log(`Admin created: ${username}`)
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
