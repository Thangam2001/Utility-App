import { randomUUID } from 'crypto'
// import { getPool } from '../db/pool.js'

const FALLBACK_HISTORY = []
const HISTORY_LIMIT = Number(process.env.HISTORY_LIMIT || 50)

export const recordOperation = async ({
  fileName,
  operationType,
  originalFormat,
  outputFormat,
  fileSize,
  resultUrl,
  metadata = {},
}) => {
  const entry = {
    id: randomUUID(),
    file_name: fileName,
    operation_type: operationType,
    original_format: originalFormat,
    output_format: outputFormat,
    file_size: fileSize,
    result_url: resultUrl,
    metadata,
    performed_at: new Date(),
  }

  // DB storage disabled
  return entry
}

export const fetchHistory = async ({ limit = HISTORY_LIMIT } = {}) => {
  // DB retrieval disabled
  return []
}
