import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Layers, Sparkles, Wand2 } from 'lucide-react'
import './HeroSection.css'

export const HeroSection = () => (
  <section className="hero">
    <motion.div
      className="hero-content"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <span className="hero-pill">
        <Sparkles size={16} />
        AI-powered image workflow in seconds
      </span>
      <h1>
        Modern image utility suite for creators and teams. Process images with{' '}
        <span>precision, clarity, and style.</span>
      </h1>
      <p>
        Extract text, resize intelligently, and convert formats effortlessly. Built for productivity with real-time
        previews, glassmorphism UI, and secure cloud-ready APIs.
      </p>
      <div className="hero-actions">
        <Link to="/ocr" className="btn btn-primary">
          Start with OCR
        </Link>
        <Link to="/convert" className="btn btn-ghost">
          Explore converters
        </Link>
      </div>
      <div className="hero-highlights">
        <span>
          <Layers size={18} />
          Multi-format pipeline
        </span>
        <span>
          <Wand2 size={18} />
          Smart enhancements
        </span>
      </div>
    </motion.div>
    <motion.div
      className="hero-visual"
      initial={{ opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
    >
      <div className="visual-card">
        <div className="visual-gradient" />
        <div className="visual-metric">
          <span className="metric-value">99.3%</span>
          <span className="metric-label">OCR Accuracy</span>
        </div>
        <div className="visual-preview">
          <div className="preview-pill">Drag & Drop</div>
          <div className="preview-window">
            <span className="preview-title">Resize & Convert</span>
            <span className="preview-subtitle">Batch ready in seconds</span>
          </div>
        </div>
      </div>
    </motion.div>
  </section>
)


