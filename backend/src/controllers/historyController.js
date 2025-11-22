import { fetchHistory } from '../services/historyService.js'

export const handleHistory = async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined
  const history = await fetchHistory({ limit })
  return res.json({ history })
}


