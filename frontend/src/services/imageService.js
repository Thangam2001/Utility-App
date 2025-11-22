import { apiClient, uploadWithProgress } from './apiClient'

export const runOcr = async ({ file, onUploadProgress }) => {
  const response = await uploadWithProgress({
    url: '/api/ocr',
    file,
    onUploadProgress,
  })
  return response.data
}

export const resizeImage = async ({ file, width, height, keepAspectRatio = false, onUploadProgress }) => {
  const response = await uploadWithProgress({
    url: '/api/resize',
    file,
    data: { width, height, keepAspectRatio },
    onUploadProgress,
    responseType: 'blob',
  })
  const metadataHeader = response.headers['x-image-metadata']
  return {
    blob: response.data,
    downloadUrl: response.headers['x-download-url'],
    metadata: metadataHeader ? safeJsonParse(metadataHeader) : null,
  }
}

export const convertImage = async ({ file, targetFormat, onUploadProgress }) => {
  const response = await uploadWithProgress({
    url: '/api/convert',
    file,
    data: { targetFormat },
    onUploadProgress,
    responseType: 'blob',
  })
  const metadataHeader = response.headers['x-image-metadata']
  return {
    blob: response.data,
    downloadUrl: response.headers['x-download-url'],
    metadata: metadataHeader ? safeJsonParse(metadataHeader) : null,
  }
}

export const cropImage = async ({ file, cropArea, onUploadProgress }) => {
  const response = await uploadWithProgress({
    url: '/api/crop',
    file,
    data: cropArea,
    onUploadProgress,
    responseType: 'blob',
  })
  const metadataHeader = response.headers['x-image-metadata']
  return {
    blob: response.data,
    downloadUrl: response.headers['x-download-url'],
    metadata: metadataHeader ? safeJsonParse(metadataHeader) : null,
  }
}

export const compressImage = async ({ file, quality, onUploadProgress }) => {
  const response = await uploadWithProgress({
    url: '/api/compress',
    file,
    data: { quality },
    onUploadProgress,
    responseType: 'blob',
  })
  const metadataHeader = response.headers['x-image-metadata']
  return {
    blob: response.data,
    downloadUrl: response.headers['x-download-url'],
    metadata: metadataHeader ? safeJsonParse(metadataHeader) : null,
  }
}

export const fetchHistory = async () => {
  const response = await apiClient.get('/api/history')
  return response.data
}

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}


