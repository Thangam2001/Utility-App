import { compressImageBuffer } from '../services/imageProcessor.js'
import { persistBuffer, buildPublicUrl } from '../services/storageService.js'
import { recordOperation } from '../services/historyService.js'

const mapFormatToMime = (format) => {
  if (!format) return 'application/octet-stream'
  const lower = format.toLowerCase()
  if (lower === 'jpg' || lower === 'jpeg') return 'image/jpeg'
  if (lower === 'svg') return 'image/svg+xml'
  if (lower === 'gif') return 'image/gif'
  if (lower === 'png') return 'image/png'
  if (lower === 'webp') return 'image/webp'
  if (lower === 'bmp') return 'image/bmp'
  if (lower === 'tiff' || lower === 'tif') return 'image/tiff'
  return `image/${lower}`
}

export const handleCompress = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' })
  }

  const { quality } = req.body

  const { buffer, info } = await compressImageBuffer({
    buffer: req.file.buffer,
    mimetype: req.file.mimetype,
    quality: quality ? Number(quality) : undefined,
  })

  const extension = info.compressed.format || req.file.mimetype?.split('/')[1] || 'png'
  const mimeType = mapFormatToMime(extension)
  const { filename } = await persistBuffer({
    buffer,
    originalName: req.file.originalname,
    extension,
  })

  const downloadUrl = buildPublicUrl(req, filename)

  await recordOperation({
    fileName: req.file.originalname,
    operationType: 'compress',
    originalFormat: info.original.format,
    outputFormat: info.compressed.format,
    fileSize: buffer.length,
    resultUrl: downloadUrl,
    metadata: info,
  })

  res.setHeader('Content-Type', mimeType)
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('X-Download-Url', downloadUrl)
  res.setHeader('X-Image-Metadata', JSON.stringify(info))

  return res.send(buffer)
}


