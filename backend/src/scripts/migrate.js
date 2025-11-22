import dotenv from 'dotenv'
import { runMigrations } from '../db/migrate.js'

dotenv.config()

const execute = async () => {
  try {
    const ran = await runMigrations()
    if (ran) {
      // eslint-disable-next-line no-console
      console.log('Database migrations executed successfully')
    } else {
      // eslint-disable-next-line no-console
      console.warn('No database connection configured. Skipping migrations.')
    }
    process.exit(0)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to run migrations', error)
    process.exit(1)
  }
}

execute()


