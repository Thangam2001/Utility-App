import { Blob } from 'buffer'
import { performance } from 'perf_hooks'
import Tesseract from 'tesseract.js'

const { FormData } = globalThis

const DEFAULT_LANGUAGE = process.env.OCR_LANGUAGES || 'eng'
const API4AI_KEY = process.env.API4AI_OCR_KEY || 'b591fdf7ddmshceaa2d398792425p1a56c2jsnb1c2542d8570'
const API4AI_HOST = process.env.API4AI_OCR_HOST || 'ocr43.p.rapidapi.com'
const API4AI_ENDPOINT = process.env.API4AI_OCR_ENDPOINT || 'https://ocr43.p.rapidapi.com/v1/results'
const API4AI_MODE = process.env.API4AI_OCR_MODE || 'simple-text'

export const performOcr = async (buffer) => {
  if (API4AI_KEY) {
    try {
      return await callApi4AiOcr(buffer)
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('RapidAPI OCR failed, falling back to Tesseract:', error.message)
      }
    }
  }

  return runTesseract(buffer)
}

const runTesseract = async (buffer) => {
  const start = performance.now()
  const { data } = await Tesseract.recognize(buffer, DEFAULT_LANGUAGE, {
    logger: (message) => {
      if (process.env.NODE_ENV !== 'production' && process.env.OCR_DEBUG === 'true') {
        // eslint-disable-next-line no-console
        console.log('OCR (Tesseract):', message)
      }
    },
  })

  return {
    text: data.text?.trim() || '',
    confidence: data.confidence,
    durationMs: Math.round(performance.now() - start),
    words: data.words?.length || 0,
    provider: 'tesseract',
  }
}

const callApi4AiOcr = async (buffer) => {
  const start = performance.now()

  const formData = new FormData()
  formData.append('image', new Blob([buffer], { type: 'application/octet-stream' }), `upload-${Date.now()}.bin`)

  const url = new URL(API4AI_ENDPOINT)
  if (API4AI_MODE) {
    url.searchParams.set('mode', API4AI_MODE)
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': API4AI_KEY,
      'X-RapidAPI-Host': API4AI_HOST,
      Accept: 'application/json',
    },
    body: formData,
  })

  if (!response.ok) {
    const message = `API4AI OCR request failed with status ${response.status}`
    throw new Error(message)
  }

  const payload = await response.json()
  const { text, confidence, words } = normalizeApi4AiResponse(payload)

  if (!text) {
    throw new Error('API4AI OCR returned no text')
  }

  return {
    text,
    confidence,
    durationMs: Math.round(performance.now() - start),
    words,
    provider: 'api4ai',
  }
}

const normalizeApi4AiResponse = (payload) => {
  const results = Array.isArray(payload?.results) ? payload.results : []
  const lines = []
  let wordCount = 0
  let confidenceSum = 0
  let confidenceCount = 0

  results
    .filter((result) => result?.status?.code === 'ok')
    .forEach((result) => {
      const entities = Array.isArray(result?.entities) ? result.entities : []
      entities.forEach((entity) => {
        const objects = Array.isArray(entity?.objects) ? entity.objects : []
        objects.forEach((object) => {
          const innerEntities = Array.isArray(object?.entities) ? object.entities : []
          const textFragments = []
          innerEntities.forEach((inner) => {
            if (inner?.text) {
              textFragments.push(inner.text)
              wordCount += inner.text.split(/\s+/).filter(Boolean).length
            }
            if (typeof inner?.confidence === 'number') {
              confidenceSum += inner.confidence
              confidenceCount += 1
            }
          })
          if (textFragments.length > 0) {
            const combined = textFragments.join(' ').replace(/\s+/g, ' ').trim()
            if (combined) {
              lines.push(combined)
            }
          }
        })
      })
    })

  const text = lines.join('\n\n').trim()
  const confidence =
    confidenceCount > 0 ? Math.min(100, (confidenceSum / confidenceCount) * 100) : undefined

  return {
    text,
    confidence: confidence ?? undefined,
    words: wordCount || undefined,
  }
}
