import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudUpload } from 'lucide-react'
import './FileDropZone.css'

export const FileDropZone = ({ onDrop, accept = { 'image/*': [] }, maxSize = 25 * 1024 * 1024, disabled }) => {
  const handleDrop = useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        onDrop?.(null, fileRejections)
        return
      }
      const file = acceptedFiles[0]
      if (file) {
        onDrop?.(file, [])
      }
    },
    [onDrop],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: handleDrop,
    accept,
    multiple: false,
    maxSize,
    disabled,
  })

  const errorMessage = fileRejections[0]?.errors[0]?.message

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`.trim()}
    >
      <input {...getInputProps()} />
      <CloudUpload size={32} />
      <p>{isDragActive ? 'Drop your image here' : 'Drag & drop or click to upload'}</p>
      <span className="dropzone-subtext">Supports PNG, JPG, JPEG, WEBP up to 25 MB</span>
      {errorMessage ? <span className="dropzone-error">{errorMessage}</span> : null}
    </div>
  )
}


