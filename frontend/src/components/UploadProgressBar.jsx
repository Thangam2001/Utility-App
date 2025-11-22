import './UploadProgressBar.css'

export const UploadProgressBar = ({ progress = 0, status = 'Uploading...' }) => (
  <div className="progress">
    <div className="progress-label">
      <span>{status}</span>
      <span>{Math.round(progress)}%</span>
    </div>
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
    </div>
  </div>
)


