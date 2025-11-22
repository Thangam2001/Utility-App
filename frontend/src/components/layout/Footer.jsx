import { Link } from 'react-router-dom'
import { Github, Linkedin, Mail } from 'lucide-react'
import './Footer.css'

export const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div>
        <h3 className="footer-title">Visionary Lab</h3>
        <p className="footer-text">Transform images into any format you need – fast, secure, and beautiful.</p>
      </div>
      <div className="footer-links">
        <Link to="/ocr">Image to Text</Link>
        <Link to="/resize">Image Resizer</Link>
        <Link to="/convert">File Converter</Link>
        <Link to="/history">History</Link>
      </div>
      <div className="footer-social">
        <a href="mailto:hello@visionarylab.dev" aria-label="Email">
          <Mail size={18} />
        </a>
        <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
          <Github size={18} />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <Linkedin size={18} />
        </a>
      </div>
    </div>
    <p className="footer-note">© {new Date().getFullYear()} Visionary Lab. All rights reserved.</p>
  </footer>
)


