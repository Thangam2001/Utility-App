import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { ensureDir, STORAGE_DIR } from '../utils/paths.js'

const sanitizeFileName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const persistBuffer = async ({ buffer, originalName, extension }) => {
  await ensureDir(STORAGE_DIR)
  const baseName = sanitizeFileName(originalName?.split('.').slice(0, -1).join('.') || 'image')
  const uniqueId = randomUUID()
  const fileExtension = (extension || 'png').toString().replace(/^\./, '')
  const filename = `${baseName}-${uniqueId}.${fileExtension}`
  const filePath = path.join(STORAGE_DIR, filename)
  await fs.writeFile(filePath, buffer)
  return { filename, filePath }
}

export const persistText = async ({ content, originalName }) => {
  const baseName = sanitizeFileName(originalName?.split('.').slice(0, -1).join('.') || 'extracted-text')
  const uniqueId = randomUUID()
  const filename = `${baseName}-${uniqueId}.txt`
  await ensureDir(STORAGE_DIR)
  const filePath = path.join(STORAGE_DIR, filename)
  await fs.writeFile(filePath, content, 'utf8')
  return { filename, filePath }
}

export const buildPublicUrl = (req, filename) => `${req.protocol}://${req.get('host')}/files/${filename}`


