import pg from 'pg'

const { Pool } = pg

let pool = null

export const initPool = () => {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.warn('DATABASE_URL not set. Falling back to in-memory history store.')
    }
    return null
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  })

  pool.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error('Unexpected PostgreSQL error', error)
  })

  return pool
}

export const getPool = () => pool


