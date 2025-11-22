import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './ToolCard.css'

const variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.1, duration: 0.45, ease: 'easeOut' },
  }),
}

export const ToolCard = ({ icon, title, description, to, index = 0 }) => (
  <motion.div className="tool-card" custom={index} variants={variants} initial="hidden" animate="visible">
    <div className="tool-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
    <Link to={to} className="tool-link">
      Launch
    </Link>
  </motion.div>
)


