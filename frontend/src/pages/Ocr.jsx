import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FileDropZone } from '../components/FileDropZone'
import { UploadProgressBar } from '../components/UploadProgressBar'
import { ExtractedTextPanel } from '../components/ExtractedTextPanel'
import { SectionHeading } from '../components/SectionHeading'
import { runOcr } from '../services/imageService'
import './Ocr.css'

export const Ocr = () => {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [ocrText, setOcrText] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return undefined
    }
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const fileInfo = useMemo(() => {
    if (!file) return null
    return {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type,
    }
  }, [file])

  const handleDrop = (acceptedFile, rejections) => {
    if (rejections.length) {
      toast.error(rejections[0]?.errors?.[0]?.message || 'Invalid file selected')
      return
    }
    setFile(acceptedFile)
    setOcrText('')
    setDownloadUrl('')
  }

  const handleProcess = async () => {
    if (!file) {
      toast.error('Please upload an image first')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    try {
      const response = await runOcr({
        file,
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100))
          }
        },
      })
      setOcrText(response.text || '')
      setDownloadUrl(response.downloadUrl || '')
      toast.success('OCR completed successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to process image')
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 800)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreviewUrl('')
    setOcrText('')
    setDownloadUrl('')
  }

  return (
    <div className="ocr-page">
      <SectionHeading
        eyebrow="Image to Text"
        title="Extract editable text from any image"
        description="Upload scans, photos, or documents and our OCR engine will deliver clean, editable text within seconds."
      />
      <motion.div className="ocr-grid" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="ocr-input">
          {!file ? (
            <FileDropZone onDrop={handleDrop} disabled={isProcessing} />
          ) : (
            <div className="converter-preview-container">
              {fileInfo ? (
                <div className="file-summary">
                  <div>
                    <span className="summary-label">File</span>
                    <p>{fileInfo.name}</p>
                  </div>
                  <div>
                    <span className="summary-label">Size</span>
                    <p>{fileInfo.size}</p>
                  </div>
                  <div>
                    <span className="summary-label">Type</span>
                    <p>{fileInfo.type}</p>
                  </div>
                </div>
              ) : null}
              {previewUrl ? (
                <div className="ocr-preview">
                  <img src={previewUrl} alt="Uploaded preview" />
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
          <button type="button" className="btn btn-primary process-button" onClick={handleProcess} disabled={isProcessing}>
            {isProcessing ? 'Processing…' : 'Run OCR'}
          </button>
          {isProcessing ? <UploadProgressBar progress={progress} /> : null}
        </div>
        <div className="ocr-output">
          <ExtractedTextPanel text={ocrText} onTextChange={setOcrText} downloadUrl={downloadUrl} />
        </div>
      </motion.div>
    </div>
  )
}


