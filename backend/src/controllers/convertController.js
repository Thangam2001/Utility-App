import { convertImageBuffer } from '../services/imageProcessor.js'
import { persistBuffer, buildPublicUrl } from '../services/storageService.js'
import { recordOperation } from '../services/historyService.js'

export const handleConvert = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' })
  }

  const { targetFormat } = req.body
  if (!targetFormat) {
    return res.status(400).json({ message: 'Target format is required' })
  }

  let result
  const mimetype = req.file.mimetype
  const isDocument = mimetype === 'text/plain' || mimetype === 'application/pdf' || req.file.originalname.endsWith('.txt') || req.file.originalname.endsWith('.pdf')

  if (isDocument) {
    const { convertDocumentBuffer } = await import('../services/documentProcessor.js')
    result = await convertDocumentBuffer({
      buffer: req.file.buffer,
      targetFormat,
      originalMimetype: mimetype
    })
  } else {
    result = await convertImageBuffer({
      buffer: req.file.buffer,
      targetFormat,
    })
  }

  const { buffer, info } = result

  const extension = info.converted.format || targetFormat
  const { filename } = await persistBuffer({
    buffer,
    originalName: req.file.originalname,
    extension,
  })

  const downloadUrl = buildPublicUrl(req, filename)

  await recordOperation({
    fileName: req.file.originalname,
    operationType: 'convert',
    originalFormat: info.original.format,
    outputFormat: info.converted.format,
    fileSize: buffer.length,
    resultUrl: downloadUrl,
    metadata: {
      original: info.original,
      converted: info.converted,
    },
  })

  const contentType = extension === 'pdf' ? 'application/pdf' : (extension === 'txt' ? 'text/plain' : `image/${extension === 'jpg' ? 'jpeg' : extension}`)

  res.setHeader('Content-Type', contentType)
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('X-Download-Url', downloadUrl)
  res.setHeader('X-Image-Metadata', JSON.stringify(info))

  return res.send(buffer)
}


