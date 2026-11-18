import pg from 'pg'

const { Pool } = pg

let pool = null

export const isDatabaseConfigured = () =>
  Boolean(String(process.env.DATABASE_URL || '').trim())

export function getPool() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured')
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      ssl: process.env.DATABASE_SSL === 'disable' ? false : undefined,
    })

    pool.on('error', () => {
      // Recycle the pool on the next request instead of crashing the function.
      pool = null
    })
  }

  return pool
}

export function dbQuery(sql, params = []) {
  return getPool().query(sql, params)
}
