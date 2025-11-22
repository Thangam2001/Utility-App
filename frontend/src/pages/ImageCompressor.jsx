import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FileDropZone } from '../components/FileDropZone'
import { UploadProgressBar } from '../components/UploadProgressBar'
import { SectionHeading } from '../components/SectionHeading'
import { TransformedImagePreview } from '../components/TransformedImagePreview'
import { compressImage } from '../services/imageService'
import './ImageCompressor.css'

const QUALITY_MIN = 10
const QUALITY_MAX = 100

const formatLabel = (file) => {
  if (!file) return ''
  const type = file.type || ''
  if (type.includes('jpeg') || type.includes('jpg')) return 'JPEG'
  if (type.includes('png')) return 'PNG'
  if (type.includes('gif')) return 'GIF'
  if (type.includes('svg')) return 'SVG'
  return file.type || 'Unknown'
}

export const ImageCompressor = () => {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [quality, setQuality] = useState(75)
  const [resultBlob, setResultBlob] = useState(null)
  const [resultMeta, setResultMeta] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return undefined
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const sizeSummary = useMemo(() => {
    if (!file || !resultMeta?.compressed) return null
    const original = file.size
    const compressed = resultMeta.compressed.size
    const delta = original - compressed
    const percent = original ? Math.max(0, (delta / original) * 100) : 0
    return {
      original,
      compressed,
      saved: delta,
      percent: percent.toFixed(1),
    }
  }, [file, resultMeta])

  const handleDrop = (acceptedFile, rejections) => {
    if (rejections.length) {
      toast.error(rejections[0]?.errors?.[0]?.message || 'Invalid file selected')
      return
    }
    setFile(acceptedFile)
    setResultBlob(null)
    setResultMeta(null)
    setDownloadUrl('')
  }

  const handleProcess = async () => {
    if (!file) {
      toast.error('Please upload an image')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    try {
      const { blob, downloadUrl: remoteUrl, metadata } = await compressImage({
        file,
        quality,
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100))
          }
        },
      })
      setResultBlob(blob)
      setResultMeta(metadata)
      setDownloadUrl(remoteUrl || '')
      toast.success('Image compressed successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to compress image')
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 800)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreviewUrl('')
    setResultBlob(null)
    setResultMeta(null)
    setDownloadUrl('')
    setQuality(75)
  }

  return (
    <div className="compressor-page">
      <SectionHeading
        eyebrow="Image Compressor"
        title="Shrink image sizes without losing clarity"
        description="Compress JPG, PNG, GIF, or SVG assets and get instant savings with best-in-class optimization."
      />
      <motion.div className="compressor-grid" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="compressor-input">
          {!file ? (
            <FileDropZone onDrop={handleDrop} disabled={isProcessing} />
          ) : (
            <div className="converter-preview-container">
              <div className="file-info-card">
                <div>
                  <span className="label">File</span>
                  <p>{file.name}</p>
                </div>
                <div>
                  <span className="label">Type</span>
                  <p>{formatLabel(file)}</p>
                </div>
                <div>
                  <span className="label">Size</span>
                  <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              {previewUrl ? (
                <div className="compressor-preview">
                  <img src={previewUrl} alt="Original preview" />
                </div>
              ) : null}
              <button
                type="button"
                className="remove-file-btn"
                onClick={handleRemoveFile}
                disabled={isProcessing}
                aria-label="Remove file"
              >
                ×
              </button>
            </div>
          )}

          <div className="quality-control">
            <div>
              <span className="label">Quality</span>
              <p className="helper">Higher quality keeps more detail but larger size.</p>
            </div>
            <div className="slider-row">
              <input
                type="range"
                min={QUALITY_MIN}
                max={QUALITY_MAX}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
              />
              <span className="quality-value">{quality}</span>
            </div>
            <div className="quality-presets">
              {[40, 60, 80, 90].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`preset ${quality === preset ? 'active' : ''}`.trim()}
                  onClick={() => setQuality(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="btn btn-primary process-button" onClick={handleProcess} disabled={isProcessing}>
            {isProcessing ? 'Compressing…' : 'Compress Image'}
          </button>
          {isProcessing ? <UploadProgressBar progress={progress} status="Uploading..." /> : null}

          {sizeSummary ? (
            <div className="compression-summary">
              <div>
                <span className="label">Original</span>
                <p>{(sizeSummary.original / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <span className="label">Compressed</span>
                <p>{(sizeSummary.compressed / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div>
                <span className="label">Saved</span>
                <p>
                  {(sizeSummary.saved / 1024 / 1024).toFixed(2)} MB · {sizeSummary.percent}% reduction
                </p>
              </div>
            </div>
          ) : null}
        </div>
        <div className="compressor-output">
          <TransformedImagePreview
            title="Compressed Image"
            blob={resultBlob}
            filename={file ? `compressed-${file.name}` : undefined}
            downloadUrl={downloadUrl}
            metadata={resultMeta}
          />
        </div>
      </motion.div>
    </div>
  )
}


