import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FileDropZone } from '../components/FileDropZone'
import { UploadProgressBar } from '../components/UploadProgressBar'
import { SectionHeading } from '../components/SectionHeading'
import { TransformedImagePreview } from '../components/TransformedImagePreview'
import { cropImage } from '../services/imageService'
import './ImageCropper.css'

export const ImageCropper = () => {
  const [file, setFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState(undefined)
  const [aspectLabel, setAspectLabel] = useState('Free')
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [cropValues, setCropValues] = useState(null)
  const [isManualEdit, setIsManualEdit] = useState(false)
  const [resultBlob, setResultBlob] = useState(null)
  const [resultMeta, setResultMeta] = useState(null)
  const [downloadUrl, setDownloadUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imageDimensions, setImageDimensions] = useState(null)
  const [stageSize, setStageSize] = useState(null)

  const stageRef = useRef(null)

  useEffect(() => {
    if (!file) {
      setImageUrl('')
      return undefined
    }
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (!stageRef.current) return undefined
    const observer = new ResizeObserver(([entry]) => {
      setStageSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    observer.observe(stageRef.current)
    return () => observer.disconnect()
  }, [])

  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels)
    if (croppedPixels && !isManualEdit) {
      setCropValues({
        width: Math.round(croppedPixels.width),
        height: Math.round(croppedPixels.height),
        left: Math.round(croppedPixels.x),
        top: Math.round(croppedPixels.y),
      })
    }
  }, [isManualEdit])

  const handleDrop = (acceptedFile, rejections) => {
    if (rejections.length) {
      toast.error(rejections[0]?.errors?.[0]?.message || 'Invalid file selected')
      return
    }
    setFile(acceptedFile)
    setResultBlob(null)
    setResultMeta(null)
    setDownloadUrl('')
    setZoom(1)
    setCropValues(null)
    setIsManualEdit(false)
    setAspect(undefined)
    setAspectLabel('Free')
  }

  const handleAspectChange = (newAspect, label) => {
    setAspect(newAspect)
    setAspectLabel(label)
    setIsManualEdit(false)
  }

  const handleCropValueChange = (field, value) => {
    const numericValue = value === '' ? '' : Math.max(0, Number(value))
    setCropValues((prev) => {
      const next = {
        width: typeof prev?.width === 'number' ? prev.width : prev?.width ?? '',
        height: typeof prev?.height === 'number' ? prev.height : prev?.height ?? '',
        left: typeof prev?.left === 'number' ? prev.left : prev?.left ?? 0,
        top: typeof prev?.top === 'number' ? prev.top : prev?.top ?? 0,
      }
      next[field] = numericValue
      return next
    })
    setIsManualEdit(true)
    setAspect(undefined)
    setAspectLabel('Custom')
  }

  const normalizeAreaPart = (values) => {
    if (!values) return {}
    const area = {}
    if (typeof values.width === 'number' && Number.isFinite(values.width) && values.width > 0) {
      area.width = Math.round(values.width)
    }
    if (typeof values.height === 'number' && Number.isFinite(values.height) && values.height > 0) {
      area.height = Math.round(values.height)
    }
    if (typeof values.left === 'number' && Number.isFinite(values.left)) {
      area.left = Math.round(values.left)
    }
    if (typeof values.top === 'number' && Number.isFinite(values.top)) {
      area.top = Math.round(values.top)
    }
    return area
  }

  const fallbackCropArea = useMemo(() => {
    if (croppedAreaPixels) {
      return {
        width: Math.max(1, Math.round(croppedAreaPixels.width)),
        height: Math.max(1, Math.round(croppedAreaPixels.height)),
        left: Math.max(0, Math.round(croppedAreaPixels.x)),
        top: Math.max(0, Math.round(croppedAreaPixels.y)),
      }
    }
    if (imageDimensions) {
      return {
        width: Math.round(imageDimensions.naturalWidth || imageDimensions.width),
        height: Math.round(imageDimensions.naturalHeight || imageDimensions.height),
        left: 0,
        top: 0,
      }
    }
    return null
  }, [croppedAreaPixels, imageDimensions])

  const effectiveCropArea = useMemo(() => {
    const manualArea = normalizeAreaPart(cropValues)
    if (!fallbackCropArea && Object.keys(manualArea).length === 0) {
      return null
    }
    // If manual edit is active, prefer manual values, but fallback to visual for missing ones
    if (isManualEdit) {
      return {
        ...(fallbackCropArea || {}),
        ...manualArea
      }
    }
    return fallbackCropArea
  }, [cropValues, fallbackCropArea, isManualEdit])

  const computedCropSize = useMemo(() => {
    if (!effectiveCropArea) return undefined
    if (!stageSize) return undefined
    const { width, height } = effectiveCropArea
    if (width <= 0 || height <= 0) return undefined
    const ratio = width / height
    let cropWidth = stageSize.width
    let cropHeight = cropWidth / ratio
    if (cropHeight > stageSize.height) {
      cropHeight = stageSize.height
      cropWidth = cropHeight * ratio
    }
    return {
      width: cropWidth,
      height: cropHeight,
    }
  }, [effectiveCropArea, stageSize])

  // Sync manual inputs back to visual cropper when they change
  // This is the tricky part. We only want to update the visual cropper if the user is manually editing
  // AND the values are valid.
  useEffect(() => {
    if (!isManualEdit) return
    if (!effectiveCropArea) return
    if (!imageDimensions || !stageSize) return

    // We don't force update the visual cropper here to avoid loops.
    // The visual cropper will update when the user drags it, which sets isManualEdit to false.
    // If the user types, we just update the effectiveCropArea which is used for the final crop.
    // However, to show the user what they are cropping, we *should* update the visual cropper if possible.
    // But react-easy-crop doesn't support setting crop/zoom based on pixel values easily without
    // doing the math we did before.
    // For now, let's rely on the preview or just accept that manual inputs might desync from the visual box
    // until we implement the full reverse math again.
    // Actually, let's try to do the reverse math again but carefully.

    const cropSize = computedCropSize || {
      width: stageSize.width,
      height: stageSize.height,
    }

    const widthRatio = cropSize.width / stageSize.width
    const heightRatio = cropSize.height / stageSize.height
    const baseZoomWidth = (imageDimensions.naturalWidth || imageDimensions.width) / effectiveCropArea.width
    const baseZoomHeight = (imageDimensions.naturalHeight || imageDimensions.height) / effectiveCropArea.height
    const desiredZoom = Math.max(baseZoomWidth * widthRatio, baseZoomHeight * heightRatio, 1)
    const boundedZoom = Math.min(desiredZoom, 10)

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

    const maxX = Math.max((imageDimensions.naturalWidth || imageDimensions.width) - effectiveCropArea.width, 0)
    const maxY = Math.max((imageDimensions.naturalHeight || imageDimensions.height) - effectiveCropArea.height, 0)

    // Avoid division by zero
    const newCropX = maxX === 0 ? 0 : (effectiveCropArea.left / maxX) * 200 - 100
    const newCropY = maxY === 0 ? 0 : (effectiveCropArea.top / maxY) * 200 - 100

    // Only update if significantly different to avoid jitter
    // setZoom(boundedZoom)
    // setCrop({
    //   x: clamp(newCropX, -100, 100),
    //   y: clamp(newCropY, -100, 100),
    // })

  }, [computedCropSize, effectiveCropArea, imageDimensions, isManualEdit, stageSize])


  const handleProcess = async () => {
    if (!file) {
      toast.error('Please upload an image')
      return
    }

    if (!effectiveCropArea || effectiveCropArea.width <= 0 || effectiveCropArea.height <= 0) {
      toast.error('Invalid crop area')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    try {
      const { blob, downloadUrl: remoteUrl, metadata } = await cropImage({
        file,
        cropArea: effectiveCropArea,
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100))
          }
        },
      })

      setResultBlob(blob)
      setResultMeta(metadata)
      setDownloadUrl(remoteUrl || '')
      toast.success('Image cropped successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to crop image')
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 800)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setImageUrl('')
    setResultBlob(null)
    setResultMeta(null)
    setDownloadUrl('')
    setZoom(1)
    setCropValues(null)
    setIsManualEdit(false)
    setAspect(undefined)
    setAspectLabel('Free')
  }

  return (
    <div className="cropper-page">
      <SectionHeading
        eyebrow="Image Cropper"
        title="Crop images precisely in seconds"
        description="Define the perfect framing with smooth controls and pixel-perfect output."
      />
      <motion.div className="cropper-grid" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="cropper-input">
          {!file ? (
            <FileDropZone onDrop={handleDrop} disabled={isProcessing} />
          ) : (
            <div className="converter-preview-container">
              {imageUrl ? (
                <div className="cropper-stage">
                  {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                  <div ref={stageRef} className="cropper-stage-inner">
                    <Cropper
                      image={imageUrl}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspect}
                      onCropChange={setCrop}
                      onCropComplete={onCropComplete}
                      onZoomChange={setZoom}
                      restrictPosition={false}
                      objectFit="contain"
                      onMediaLoaded={(mediaSize) => {
                        setImageDimensions(mediaSize)
                        setCropValues((prev) =>
                          prev ?? {
                            width: Math.round(mediaSize.naturalWidth || mediaSize.width),
                            height: Math.round(mediaSize.naturalHeight || mediaSize.height),
                            left: 0,
                            top: 0,
                          },
                        )
                      }}
                    />
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                className="remove-file-btn"
                onClick={handleRemoveFile}
                disabled={isProcessing}
                aria-label="Remove file"
                style={{ zIndex: 20 }}
              >
                ×
              </button>
            </div>
          )}

          {imageUrl ? (
            <div className="cropper-controls">
              <div className="aspect-ratios">
                <span className="label">Aspect Ratio:</span>
                <div className="aspect-buttons">
                  <button
                    type="button"
                    className={`aspect-btn ${aspectLabel === 'Free' ? 'active' : ''}`}
                    onClick={() => handleAspectChange(undefined, 'Free')}
                  >
                    Free
                  </button>
                  <button
                    type="button"
                    className={`aspect-btn ${aspectLabel === 'Original' ? 'active' : ''}`}
                    onClick={() => {
                      if (imageDimensions) {
                        handleAspectChange(imageDimensions.naturalWidth / imageDimensions.naturalHeight, 'Original')
                      }
                    }}
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    className={`aspect-btn ${aspectLabel === '1:1' ? 'active' : ''}`}
                    onClick={() => handleAspectChange(1, '1:1')}
                  >
                    1:1
                  </button>
                  <button
                    type="button"
                    className={`aspect-btn ${aspectLabel === '4:3' ? 'active' : ''}`}
                    onClick={() => handleAspectChange(4 / 3, '4:3')}
                  >
                    4:3
                  </button>
                  <button
                    type="button"
                    className={`aspect-btn ${aspectLabel === '16:9' ? 'active' : ''}`}
                    onClick={() => handleAspectChange(16 / 9, '16:9')}
                  >
                    16:9
                  </button>
                </div>
              </div>

              <label>
                Zoom
                <input
                  type="range"
                  min={1}
                  max={4}
                  step={0.1}
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                />
              </label>

              <div className="cropper-options">
                <div className="options-grid">
                  <label>
                    Width (px)
                    <input
                      type="number"
                      min={1}
                      value={cropValues?.width ?? ''}
                      onChange={(event) => handleCropValueChange('width', event.target.value)}
                    />
                  </label>
                  <label>
                    Height (px)
                    <input
                      type="number"
                      min={1}
                      value={cropValues?.height ?? ''}
                      onChange={(event) => handleCropValueChange('height', event.target.value)}
                    />
                  </label>
                  <label>
                    X (px)
                    <input
                      type="number"
                      min={0}
                      value={cropValues?.left ?? ''}
                      onChange={(event) => handleCropValueChange('left', event.target.value)}
                    />
                  </label>
                  <label>
                    Y (px)
                    <input
                      type="number"
                      min={0}
                      value={cropValues?.top ?? ''}
                      onChange={(event) => handleCropValueChange('top', event.target.value)}
                    />
                  </label>
                </div>
                <p className="options-hint">
                  Adjust values for pixel-perfect control. Leave a field blank to reuse the current selection.
                </p>
              </div>
            </div>
          ) : null}

          <button type="button" className="btn btn-primary process-button" onClick={handleProcess} disabled={isProcessing}>
            {isProcessing ? 'Cropping…' : 'Crop Image'}
          </button>
          {isProcessing ? <UploadProgressBar progress={progress} status="Uploading..." /> : null}
        </div>
        <div className="cropper-output">
          <TransformedImagePreview
            title="Cropped Image"
            blob={resultBlob}
            filename={file ? `cropped-${file.name}` : undefined}
            downloadUrl={downloadUrl}
            metadata={resultMeta}
          />
        </div>
      </motion.div>
    </div>
  )
}
