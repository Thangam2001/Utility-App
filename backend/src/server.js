import dotenv from 'dotenv'
import app from './app.js'
import { ensureDir, STORAGE_DIR, TMP_DIR } from './utils/paths.js'
import { initPool } from './db/pool.js'
import { runMigrations } from './db/migrate.js'

dotenv.config()

const PORT = Number(process.env.PORT || 4000)

const startServer = async () => {
  await Promise.all([ensureDir(STORAGE_DIR), ensureDir(TMP_DIR)])

  // initPool()
  // if (process.env.DATABASE_URL) {
  //   await runMigrations()
  // }

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on port ${PORT}`)
  })
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', error)
  process.exit(1)
})


