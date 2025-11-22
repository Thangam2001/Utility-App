import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FileDropZone } from '../components/FileDropZone'
import { UploadProgressBar } from '../components/UploadProgressBar'
import { SectionHeading } from '../components/SectionHeading'
import { TransformedImagePreview } from '../components/TransformedImagePreview'
import { convertImage } from '../services/imageService'
import './FileConverter.css'

const TARGET_FORMATS = [
  { label: 'JPEG (.jpg)', value: 'jpg' },
  { label: 'PNG (.png)', value: 'png' },
  { label: 'WebP (.webp)', value: 'webp' },
  { label: 'BMP (.bmp)', value: 'bmp' },
  { label: 'TIFF (.tiff)', value: 'tiff' },
]

export const FileConverter = () => {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [targetFormat, setTargetFormat] = useState(TARGET_FORMATS[0].value)
  const [convertedBlob, setConvertedBlob] = useState(null)
  const [convertedMeta, setConvertedMeta] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [availableFormats, setAvailableFormats] = useState(TARGET_FORMATS)

  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      setAvailableFormats(TARGET_FORMATS)
      setTargetFormat(TARGET_FORMATS[0].value)
      return undefined
    }

    const isImage = file.type.startsWith('image/')
    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt')
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')

    if (isImage) {
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
      setAvailableFormats(TARGET_FORMATS)
      setTargetFormat(TARGET_FORMATS[0].value)
      return () => URL.revokeObjectURL(objectUrl)
    }

    if (isTxt) {
      setPreviewUrl('') // No preview for text
      setAvailableFormats([{ label: 'PDF Document (.pdf)', value: 'pdf' }])
      setTargetFormat('pdf')
    } else if (isPdf) {
      setPreviewUrl('') // No preview for PDF
      setAvailableFormats([{ label: 'Text File (.txt)', value: 'txt' }])
      setTargetFormat('txt')
    }
  }, [file])

  const handleDrop = (acceptedFile, rejections) => {
    if (rejections.length) {
      toast.error(rejections[0]?.errors?.[0]?.message || 'Invalid file selected')
      return
    }
    setFile(acceptedFile)
    setConvertedBlob(null)
    setConvertedMeta(null)
    setDownloadUrl('')
  }

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please upload a file')
      return
    }
    if (!targetFormat) {
      toast.error('Select a target format')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    try {
      const { blob, downloadUrl: remoteUrl, metadata } = await convertImage({
        file,
        targetFormat,
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100))
          }
        },
      })
      setConvertedBlob(blob)
      setConvertedMeta(metadata)
      setDownloadUrl(remoteUrl || '')
      toast.success('File converted successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to convert file')
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 800)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setPreviewUrl('')
    setConvertedBlob(null)
    setConvertedMeta(null)
    setDownloadUrl('')
    setTargetFormat(TARGET_FORMATS[0].value)
    setAvailableFormats(TARGET_FORMATS)
  }

  const convertedFilename = file ? `${file.name.split('.').slice(0, -1).join('.') || file.name}.${targetFormat}` : undefined

  return (
    <div className="converter-page">
      <SectionHeading
        eyebrow="File Type Converter"
        title="Convert files instantly"
        description="Switch between JPG, PNG, WebP, PDF, and TXT with a single click."
      />
      <motion.div className="converter-grid" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="converter-input">
          {!file ? (
            <FileDropZone onDrop={handleDrop} disabled={isProcessing} accept={{
              'image/*': [],
              'text/plain': ['.txt'],
              'application/pdf': ['.pdf']
            }} />
          ) : (
            <div className="converter-preview-container">
              {previewUrl ? (
                <div className="converter-preview">
                  <img src={previewUrl} alt="Original preview" />
                </div>
              ) : (
                <div className="converter-preview file-info">
                  <p>Selected file: <strong>{file.name}</strong></p>
                </div>
              )}
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
          <label className="format-select">
            Target format
            <div className="select-wrapper">
              <select value={targetFormat} onChange={(event) => setTargetFormat(event.target.value)}>
                {availableFormats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <button type="button" className="btn btn-primary process-button" onClick={handleConvert} disabled={isProcessing}>
            {isProcessing ? 'Converting…' : 'Convert File'}
          </button>
          {isProcessing ? <UploadProgressBar progress={progress} /> : null}
        </div>
        <div className="converter-output">
          <TransformedImagePreview
            title="Converted File"
            blob={convertedBlob}
            filename={convertedFilename}
            downloadUrl={downloadUrl}
            metadata={convertedMeta}
          />
        </div>
      </motion.div>
    </div>
  )
}


