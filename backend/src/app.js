import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import 'express-async-errors'
import apiRouter from './routes/api.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandlers.js'
import { STORAGE_DIR } from './utils/paths.js'

const app = express()

const clientOrigins = (process.env.CLIENT_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean)

app.use(
  cors({
    origin: clientOrigins.length ? clientOrigins : '*',
    credentials: true,
  }),
)

app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use('/files', express.static(STORAGE_DIR, { fallthrough: false, index: false, extensions: ['png', 'jpg', 'jpeg', 'webp', 'txt'] }))
app.use('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', apiRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app


