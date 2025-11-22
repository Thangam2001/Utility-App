import { resizeImageBuffer } from '../services/imageProcessor.js'
import { persistBuffer, buildPublicUrl } from '../services/storageService.js'
import { recordOperation } from '../services/historyService.js'

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase())
  }
  return false
}

export const handleResize = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' })
  }

  const { width, height, keepAspectRatio } = req.body

  if (!width || !height) {
    return res.status(400).json({ message: 'Width and height are required' })
  }

  const keepAspect = parseBoolean(keepAspectRatio)

  const { buffer, info } = await resizeImageBuffer({
    buffer: req.file.buffer,
    width,
    height,
    keepAspectRatio: keepAspect,
  })

  const extension = info.resized.format || 'png'
  const { filename } = await persistBuffer({
    buffer,
    originalName: req.file.originalname,
    extension,
  })

  const downloadUrl = buildPublicUrl(req, filename)

  await recordOperation({
    fileName: req.file.originalname,
    operationType: 'resize',
    originalFormat: info.original.format,
    outputFormat: info.resized.format,
    fileSize: buffer.length,
    resultUrl: downloadUrl,
    metadata: {
      requestedWidth: Number(width),
      requestedHeight: Number(height),
      keepAspect,
      original: info.original,
      resized: info.resized,
    },
  })

  res.setHeader('Content-Type', `image/${extension === 'jpg' ? 'jpeg' : extension}`)
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('X-Download-Url', downloadUrl)
  res.setHeader('X-Image-Metadata', JSON.stringify(info))

  return res.send(buffer)
}


