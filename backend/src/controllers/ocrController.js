import { performOcr } from '../services/ocrService.js'
import { persistText, buildPublicUrl } from '../services/storageService.js'
import { recordOperation } from '../services/historyService.js'

export const handleOcr = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  const { buffer, originalname, mimetype, size } = req.file

  const ocrResult = await performOcr(buffer)
  const { filename } = await persistText({ content: ocrResult.text, originalName: originalname })
  const downloadUrl = buildPublicUrl(req, filename)

  const historyEntry = await recordOperation({
    fileName: originalname,
    operationType: 'ocr',
    originalFormat: mimetype,
    outputFormat: 'text/plain',
    fileSize: size,
    resultUrl: downloadUrl,
    metadata: {
      confidence: ocrResult.confidence,
      durationMs: ocrResult.durationMs,
      words: ocrResult.words,
      provider: ocrResult.provider,
    },
  })

  return res.json({
    text: ocrResult.text,
    confidence: ocrResult.confidence,
    durationMs: ocrResult.durationMs,
    words: ocrResult.words,
    provider: ocrResult.provider,
    downloadUrl,
    historyId: historyEntry.id,
  })
}


