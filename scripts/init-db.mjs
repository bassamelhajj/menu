import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import pg from 'pg'

const { Pool } = pg

const env = loadEnv('development', process.cwd(), '')
for (const key of ['DATABASE_URL', 'DATABASE_SSL', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH']) {
  if (env[key] && !process.env[key]) process.env[key] = env[key]
}

const databaseUrl = String(process.env.DATABASE_URL || '').trim()
if (!databaseUrl) {
  console.error('DATABASE_URL is missing. Add it to .env.local first.')
  process.exit(1)
}

const schemaPath = fileURLToPath(new URL('../db/schema.sql', import.meta.url))
const schema = await readFile(schemaPath, 'utf8')
const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  ssl: process.env.DATABASE_SSL === 'disable' ? false : undefined,
})

try {
  await pool.query(schema)
  console.log('Database schema is ready.')

  const existing = await pool.query('SELECT id FROM admin_users LIMIT 1')
  const username = String(process.env.ADMIN_USERNAME || '').trim()
  const passwordHash = String(process.env.ADMIN_PASSWORD_HASH || '').trim()

  if (existing.rowCount === 0 && username && passwordHash) {
    await pool.query(
      `INSERT INTO admin_users (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [username, passwordHash],
    )
    console.log(`Initial admin created: ${username}`)
  } else if (existing.rowCount > 0) {
    console.log('Admin already exists; bootstrap values were not applied.')
  } else {
    console.warn('No admin exists. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH, then run this again.')
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
