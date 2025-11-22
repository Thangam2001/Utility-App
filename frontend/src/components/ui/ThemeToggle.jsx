import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import './ThemeToggle.css'

export const ThemeToggle = ({ className = '' }) => {
  const { mode, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`.trim()}
      aria-label="Toggle dark mode"
    >
      {mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}


