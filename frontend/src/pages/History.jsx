import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { SectionHeading } from '../components/SectionHeading'
import { HistoryTable } from '../components/HistoryTable'
import { fetchHistory } from '../services/imageService'
import './History.css'

export const History = () => {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true)
      try {
        const data = await fetchHistory()
        setItems(data.history || [])
      } catch (error) {
        toast.error(error.message || 'Failed to load history')
      } finally {
        setIsLoading(false)
      }
    }
    loadHistory()
  }, [])

  return (
    <div className="history-page">
      <SectionHeading
        eyebrow="Dashboard"
        title="Your recent image operations"
        description="Track every OCR, resize, and conversion request along with quick access to the processed assets."
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {isLoading ? <div className="history-loading">Loading history…</div> : <HistoryTable items={items} />}
      </motion.div>
    </div>
  )
}


