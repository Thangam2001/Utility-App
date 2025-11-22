import { Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { Home } from './pages/Home'
import { Ocr } from './pages/Ocr'
import { ImageResizer } from './pages/ImageResizer'
import { ImageCropper } from './pages/ImageCropper'
import { FileConverter } from './pages/FileConverter'
import { ImageCompressor } from './pages/ImageCompressor'
import { History } from './pages/History'
import './App.css'

const App = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/ocr" element={<Ocr />} />
      <Route path="/resize" element={<ImageResizer />} />
      <Route path="/crop" element={<ImageCropper />} />
      <Route path="/convert" element={<FileConverter />} />
      <Route path="/compress" element={<ImageCompressor />} />
      <Route path="/history" element={<History />} />
    </Route>
  </Routes>
)

export default App
