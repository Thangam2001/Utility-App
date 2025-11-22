import { useEffect, useMemo, useState } from 'react'
import './TransformedImagePreview.css'

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export const TransformedImagePreview = ({ title, blob, filename, downloadUrl, metadata }) => {
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!blob) {
      setPreviewUrl('')
      return undefined
    }
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [blob])

  const handleDownload = () => {
    if (!blob) return
    const link = document.createElement('a')
    link.href = previewUrl
    link.download = filename || `processed-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const convertedMeta = useMemo(() => {
    if (!metadata) return null
    const details = metadata.cropped || metadata.resized || metadata.converted || metadata.compressed || metadata.original
    const original = metadata.original
    return {
      format: details?.format,
      width: details?.width,
      height: details?.height,
      size: details?.size,
      originalWidth: original?.width,
      originalHeight: original?.height,
      originalFormat: original?.format,
      originalSize: original?.size,
      left: details?.left,
      top: details?.top,
      quality: details?.quality,
    }
  }, [metadata])

  const handleRemoteOpen = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
    }
  }

  if (!blob) return null

  return (
    <div className="preview-card">
      <div className="preview-header">
        <h3>{title}</h3>
        <div className="preview-actions">
          {downloadUrl ? (
            <button type="button" onClick={handleRemoteOpen} className="ghost">
              Open Link
            </button>
          ) : null}
          <button type="button" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
      <div className="preview-body">
        <img src={previewUrl} alt="Transformed preview" />
      </div>
      {convertedMeta ? (
        <div className="preview-meta">
          <div>
            <span className="label">Output</span>
            <p>
              {convertedMeta.width} × {convertedMeta.height}px · {convertedMeta.format?.toUpperCase()}
              {convertedMeta.size ? ` · ${formatBytes(convertedMeta.size)}` : ''}
            </p>
            {convertedMeta.left !== undefined && convertedMeta.top !== undefined ? (
              <p className="sub">
                Origin: {convertedMeta.left}px, {convertedMeta.top}px
              </p>
            ) : null}
            {convertedMeta.quality ? (
              <p className="sub">Quality: {convertedMeta.quality}</p>
            ) : null}
          </div>
          <div>
            <span className="label">Original</span>
            <p>
              {convertedMeta.originalWidth} × {convertedMeta.originalHeight}px ·{' '}
              {convertedMeta.originalFormat?.toUpperCase()}
              {convertedMeta.originalSize ? ` · ${formatBytes(convertedMeta.originalSize)}` : ''}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}


