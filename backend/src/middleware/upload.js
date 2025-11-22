import multer from 'multer'

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE_MB || 25) * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/tiff', 'image/gif', 'text/plain', 'application/pdf']

const storage = multer.memoryStorage()

const fileFilter = (req, file, callback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true)
  } else {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname)
    error.message = 'Unsupported file type. Please upload an image file.'
    callback(error)
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
})


