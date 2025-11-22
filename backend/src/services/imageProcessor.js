import sharp from 'sharp'
import imagemin from 'imagemin'
import imageminGifsicle from 'imagemin-gifsicle'
import { optimize as optimizeSvg } from 'svgo'

const SUPPORTED_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'tiff', 'bmp']

const normalizeFormat = (format) => {
  if (!format) return null
  const lower = format.toLowerCase()
  if (lower === 'jpg') return 'jpeg'
  return lower
}

export const resizeImageBuffer = async ({ buffer, width, height, keepAspectRatio }) => {
  const targetWidth = Number(width)
  const targetHeight = Number(height)
  if (!Number.isFinite(targetWidth) || !Number.isFinite(targetHeight)) {
    throw new Error('Invalid dimensions specified')
  }

  const pipeline = sharp(buffer)
  const metadata = await pipeline.metadata()

  const resized = pipeline.clone().resize({
    width: targetWidth,
    height: targetHeight,
    fit: keepAspectRatio ? sharp.fit.inside : sharp.fit.fill,
  })

  const outputBuffer = await resized.toBuffer()
  const outputInfo = await sharp(outputBuffer).metadata()

  return {
    buffer: outputBuffer,
    info: {
      original: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
      },
      resized: {
        width: outputInfo.width,
        height: outputInfo.height,
        format: outputInfo.format,
        size: outputBuffer.length,
      },
    },
  }
}

export const convertImageBuffer = async ({ buffer, targetFormat }) => {
  const format = normalizeFormat(targetFormat)
  if (!SUPPORTED_FORMATS.includes(format)) {
    throw new Error('Unsupported target format')
  }

  const pipeline = sharp(buffer)
  const metadata = await pipeline.metadata()

  let converted = pipeline.clone()

  switch (format) {
    case 'jpeg':
      converted = converted.jpeg({ quality: 100 })
      break
    case 'png':
      converted = converted.png({ compressionLevel: 1 })
      break
    case 'webp':
      converted = converted.webp({ quality: 100 })
      break
    case 'bmp':
      converted = converted.bmp()
      break
    case 'tiff':
      converted = converted.tiff({ compression: 'lzw' })
      break
    default:
      break
  }

  const outputBuffer = await converted.toBuffer()
  const outputInfo = await sharp(outputBuffer).metadata()

  return {
    buffer: outputBuffer,
    info: {
      original: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
      },
      converted: {
        width: outputInfo.width,
        height: outputInfo.height,
        format: outputInfo.format,
        size: outputBuffer.length,
      },
    },
  }
}

export const cropImageBuffer = async ({ buffer, left, top, width, height }) => {
  const cropLeft = Math.max(0, Math.floor(Number(left)))
  const cropTop = Math.max(0, Math.floor(Number(top)))
  const cropWidth = Math.floor(Number(width))
  const cropHeight = Math.floor(Number(height))

  if (![cropWidth, cropHeight].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Invalid crop dimensions specified')
  }

  const pipeline = sharp(buffer)
  const metadata = await pipeline.metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('Unable to read image metadata')
  }

  if (cropLeft >= metadata.width || cropTop >= metadata.height) {
    throw new Error('Crop area starts outside image bounds')
  }

  const maxWidth = metadata.width - cropLeft
  const maxHeight = metadata.height - cropTop
  const effectiveWidth = Math.min(cropWidth, maxWidth)
  const effectiveHeight = Math.min(cropHeight, maxHeight)

  if (effectiveWidth <= 0 || effectiveHeight <= 0) {
    throw new Error('Crop area exceeds image bounds')
  }

  const croppedBuffer = await pipeline
    .clone()
    .extract({
      left: cropLeft,
      top: cropTop,
      width: effectiveWidth,
      height: effectiveHeight,
    })
    .toBuffer()

  const croppedInfo = await sharp(croppedBuffer).metadata()

  return {
    buffer: croppedBuffer,
    info: {
      original: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: buffer.length,
      },
      cropped: {
        width: croppedInfo.width,
        height: croppedInfo.height,
        format: croppedInfo.format,
        size: croppedBuffer.length,
        left: cropLeft,
        top: cropTop,
      },
    },
  }
}

export const compressImageBuffer = async ({ buffer, mimetype, quality = 75 }) => {
  const normalizedQuality = Math.min(100, Math.max(1, Number(quality) || 75))
  const pipeline = sharp(buffer)
  const metadata = await pipeline.metadata()
  const format = (metadata.format || mimetype?.split('/')[1])?.toLowerCase()

  let compressedBuffer = buffer
  let outputFormat = format
  let info = metadata

  if (format === 'jpeg' || format === 'jpg') {
    const result = await pipeline
      .clone()
      .jpeg({
        quality: normalizedQuality,
        progressive: true,
        chromaSubsampling: '4:4:4',
      })
      .toBuffer({ resolveWithObject: true })
    compressedBuffer = result.data
    info = result.info
  } else if (format === 'png') {
    const result = await pipeline
      .clone()
      .png({
        quality: normalizedQuality,
        compressionLevel: normalizedQuality >= 90 ? 9 : 8,
        palette: true,
      })
      .toBuffer({ resolveWithObject: true })
    compressedBuffer = result.data
    info = result.info
  } else if (format === 'webp') {
    const result = await pipeline
      .clone()
      .webp({
        quality: normalizedQuality,
      })
      .toBuffer({ resolveWithObject: true })
    compressedBuffer = result.data
    info = result.info
    outputFormat = 'webp'
  } else if (format === 'gif') {
    const optimized = await imagemin.buffer(buffer, {
      plugins: [
        imageminGifsicle({
          optimizationLevel: normalizedQuality >= 90 ? 2 : 3,
          colors: normalizedQuality >= 90 ? 256 : 128,
        }),
      ],
    })
    compressedBuffer = optimized
    outputFormat = 'gif'
  } else if (format === 'svg' || mimetype === 'image/svg+xml') {
    const svgContent = buffer.toString('utf8')
    const optimized = optimizeSvg(svgContent, {
      multipass: true,
    })
    compressedBuffer = Buffer.from(optimized.data, 'utf8')
    outputFormat = 'svg'
    info = {
      ...info,
      size: compressedBuffer.length,
    }
  } else {
    throw new Error('Unsupported image format for compression')
  }

  return {
    buffer: compressedBuffer,
    info: {
      original: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format || format,
        size: buffer.length,
      },
      compressed: {
        width: info?.width ?? metadata.width,
        height: info?.height ?? metadata.height,
        format: outputFormat,
        size: compressedBuffer.length,
        quality: normalizedQuality,
      },
    },
  }
}


