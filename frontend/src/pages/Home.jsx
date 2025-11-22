import { Camera, Crop, FileText, Gauge, Repeat } from 'lucide-react'
import { HeroSection } from '../components/HeroSection'
import { SectionHeading } from '../components/SectionHeading'
import { ToolCard } from '../components/ToolCard'
import './Home.css'

const toolDetails = [
  {
    icon: <FileText />,
    title: 'Image to Text (OCR)',
    description: 'Extract clean, editable text from images, documents, posters, and handwritten notes.',
    to: '/ocr',
  },
  {
    icon: <Camera />,
    title: 'Intelligent Image Resizer',
    description: 'Resize while preserving clarity and aspect ratio with pixel-aware adjustments.',
    to: '/resize',
  },
  {
    icon: <Crop />,
    title: 'Precision Image Cropper',
    description: 'Define custom crops with zoom controls, aspect presets, and pixel perfect output.',
    to: '/crop',
  },
  {
    icon: <Repeat />,
    title: 'Format Converter',
    description: 'Convert between JPG, PNG, WEBP, and more with instant previews and downloads.',
    to: '/convert',
  },
  {
    icon: <Gauge />,
    title: 'Smart Image Compressor',
    description: 'Trim file sizes for web or email while keeping visual fidelity across formats.',
    to: '/compress',
  },
]

export const Home = () => (
  <div className="home">
    <HeroSection />
    <SectionHeading
      eyebrow="Toolset"
      title="Everything you need to master your image workflow"
      description="Bring together OCR, cropping, resizing, compression, conversion, and history tracking into one streamlined experience."
      align="center"
    />
    <div className="tool-grid">
      {toolDetails.map((tool, index) => (
        <ToolCard key={tool.title} index={index} {...tool} />
      ))}
    </div>
  </div>
)


