import { cropImageBuffer } from '../services/imageProcessor.js'
import { persistBuffer, buildPublicUrl } from '../services/storageService.js'
import { recordOperation } from '../services/historyService.js'

export const handleCrop = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' })
  }

  const { left, top, width, height } = req.body

  if ([left, top, width, height].some((value) => value === undefined)) {
    return res.status(400).json({ message: 'Crop coordinates are required' })
  }

  const { buffer, info } = await cropImageBuffer({
    buffer: req.file.buffer,
    left,
    top,
    width,
    height,
  })

  const extension = info.cropped.format || req.file.mimetype?.split('/')[1] || 'png'
  const { filename } = await persistBuffer({
    buffer,
    originalName: req.file.originalname,
    extension,
  })

  const downloadUrl = buildPublicUrl(req, filename)

  await recordOperation({
    fileName: req.file.originalname,
    operationType: 'crop',
    originalFormat: info.original.format,
    outputFormat: info.cropped.format,
    fileSize: buffer.length,
    resultUrl: downloadUrl,
    metadata: info,
  })

  res.setHeader('Content-Type', `image/${extension === 'jpg' ? 'jpeg' : extension}`)
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('X-Download-Url', downloadUrl)
  res.setHeader('X-Image-Metadata', JSON.stringify(info))

  return res.send(buffer)
}


