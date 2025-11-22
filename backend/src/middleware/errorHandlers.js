// eslint-disable-next-line no-unused-vars
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    message: 'Resource not found',
    path: req.originalUrl,
  })
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
  let status = error.status || error.statusCode || 500
  let message = error.message || 'Internal server error'

  if (error.name === 'MulterError') {
    status = 400
    if (error.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Please upload a smaller file.'
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(error)
  }

  res.status(status).json({
    message,
    details: error.details,
  })
}


