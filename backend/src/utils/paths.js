import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const ROOT_DIR = path.resolve(__dirname, '..', '..')
export const STORAGE_DIR = path.resolve(ROOT_DIR, 'storage')
export const TMP_DIR = path.resolve(ROOT_DIR, 'tmp')

export const ensureDir = async (directory) => {
  try {
    await fs.mkdir(directory, { recursive: true })
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error
    }
  }
}


