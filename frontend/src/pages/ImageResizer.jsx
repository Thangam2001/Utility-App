import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FileDropZone } from '../components/FileDropZone'
import { UploadProgressBar } from '../components/UploadProgressBar'
import { SectionHeading } from '../components/SectionHeading'
import { TransformedImagePreview } from '../components/TransformedImagePreview'
import { resizeImage } from '../services/imageService'
import './ImageResizer.css'

export const ImageResizer = () => {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [keepAspect, setKeepAspect] = useState(true)
  const [resultBlob, setResultBlob] = useState(null)
  const [resultMeta, setResultMeta] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [aspectRatio, setAspectRatio] = useState(null)

  const [imageInfo, setImageInfo] = useState(null)

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      setImageInfo(null)
      return undefined
    }
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Extract image dimensions
    const img = new Image()
    img.onload = () => {
      setImageInfo({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type
      })
      setWidth(img.width.toString())
      setHeight(img.height.toString())
      if (img.height) {
        setAspectRatio(img.width / img.height)
      }
    }
    img.src = objectUrl

    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  // Remove the second useEffect that was doing the same thing

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

  const handleDimensionChange = (type, value) => {
    const numericValue = value.replace(/\D/g, '')
    if (type === 'width') {
      setWidth(numericValue)
      if (keepAspect && aspectRatio && numericValue) {
        setHeight(Math.round(Number(numericValue) / aspectRatio).toString())
      }
    } else {
      setHeight(numericValue)
      if (keepAspect && aspectRatio && numericValue) {
        setWidth(Math.round(Number(numericValue) * aspectRatio).toString())
      }
    }
  }

  const handleProcess = async () => {
    if (!file) {
      toast.error('Please upload an image')
      return
    }
    if (!width || !height) {
      toast.error('Please provide width and height')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    try {
      const { blob, downloadUrl: remoteUrl, metadata } = await resizeImage({
        file,
        width: Number(width),
        height: Number(height),
        keepAspectRatio: keepAspect,
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100))
          }
        },
      })
      setResultBlob(blob)
      setResultMeta(metadata)
      setDownloadUrl(remoteUrl || '')
      toast.success('Image resized successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to resize image')
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
    setWidth('')
    setHeight('')
    setAspectRatio(null)
    setImageInfo(null)
  }

  return (
    <div className="resizer-page">
      <SectionHeading
        eyebrow="Image Resizer"
        title="Resize images without losing clarity"
        description="Adjust dimensions precisely and preserve aspect ratio automatically. Perfect for social media, presentations, and responsive layouts."
      />
      <motion.div className="resizer-grid" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="resizer-input">
          {!file ? (
            <FileDropZone onDrop={handleDrop} disabled={isProcessing} />
          ) : (
            <div className="converter-preview-container">
              {previewUrl ? (
                <div className="resizer-preview">
                  <img src={previewUrl} alt="Original preview" />
                </div>
              ) : null}

              {imageInfo ? (
                <div className="file-info-card" style={{ marginTop: '1rem' }}>
                  <div>
                    <span className="label">Resolution</span>
                    <p>{imageInfo.width} × {imageInfo.height}</p>
                  </div>
                  <div>
                    <span className="label">Size</span>
                    <p>{(imageInfo.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div>
                    <span className="label">Type</span>
                    <p>{imageInfo.type.split('/')[1]?.toUpperCase() || 'Unknown'}</p>
                  </div>
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
          <div className="dimension-grid">
            <label>
              Width (px)
              <input
                value={width}
                onChange={(event) => handleDimensionChange('width', event.target.value)}
                placeholder="e.g., 1200"
                inputMode="numeric"
              />
            </label>
            <label>
              Height (px)
              <input
                value={height}
                onChange={(event) => handleDimensionChange('height', event.target.value)}
                placeholder="e.g., 800"
                inputMode="numeric"
              />
            </label>
          </div>
          <label className="aspect-toggle">
            <input type="checkbox" checked={keepAspect} onChange={(event) => setKeepAspect(event.target.checked)} />
            Maintain aspect ratio
          </label>
          <button type="button" className="btn btn-primary process-button" onClick={handleProcess} disabled={isProcessing}>
            {isProcessing ? 'Processing…' : 'Resize Image'}
          </button>
          {isProcessing ? <UploadProgressBar progress={progress} /> : null}
        </div>
        <div className="resizer-output">
          <TransformedImagePreview
            title="Resized Image"
            blob={resultBlob}
            filename={file ? `resized-${file.name}` : undefined}
            downloadUrl={downloadUrl}
            metadata={resultMeta}
          />
        </div>
      </motion.div>
    </div>
  )
}


