import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPool, initPool } from './pool.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const runMigrations = async () => {
  const pool = getPool() || initPool()

  if (!pool) {
    return false
  }

  const migrationsDir = path.resolve(__dirname, 'migrations')
  const files = (await fs.readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort()

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8')
    await pool.query(sql)
  }

  return true
}


