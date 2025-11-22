import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import './Navbar.css'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/ocr', label: 'Image to Text' },
  { to: '/resize', label: 'Image Resizer' },
  { to: '/crop', label: 'Image Cropper' },
  { to: '/convert', label: 'File Converter' },
  { to: '/compress', label: 'Image Compressor' },
  { to: '/history', label: 'History' },
]

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = () => setIsOpen((prev) => !prev)
  const handleClose = () => setIsOpen(false)

  const renderNavLink = ({ to, label, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`.trim()}
      onClick={handleClose}
    >
      {label}
    </NavLink>
  )

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-accent">Visionary</span> Lab
        </Link>
        <nav className="nav-links desktop">{navItems.map(renderNavLink)}</nav>
        <div className="nav-actions">
          <ThemeToggle />
          <button type="button" className="menu-button" onClick={handleToggle} aria-label="Toggle navigation">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <nav className={`nav-links mobile ${isOpen ? 'open' : ''}`}>{navItems.map(renderNavLink)}</nav>
    </header>
  )
}


