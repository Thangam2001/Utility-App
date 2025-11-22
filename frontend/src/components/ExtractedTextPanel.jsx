import { useState } from 'react'
import { Clipboard, ClipboardCheck, Download } from 'lucide-react'
import './ExtractedTextPanel.css'

export const ExtractedTextPanel = ({ text, onTextChange, downloadUrl }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      setCopied(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `extracted-text-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="text-panel">
      <div className="text-panel-header">
        <h3>Extracted Text</h3>
        <div className="text-panel-actions">
          {downloadUrl ? (
            <button type="button" onClick={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')} className="text-action ghost">
              Open Link
            </button>
          ) : null}
          <button type="button" onClick={handleCopy} className="text-action" disabled={!text}>
            {copied ? <ClipboardCheck size={17} /> : <Clipboard size={17} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button type="button" onClick={handleDownload} className="text-action" disabled={!text}>
            <Download size={17} />
            Download
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(event) => onTextChange?.(event.target.value)}
        placeholder="Extracted text will appear here..."
        spellCheck={false}
      />
    </div>
  )
}


