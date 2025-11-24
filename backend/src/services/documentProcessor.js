import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

export const convertDocumentBuffer = async ({ buffer, targetFormat, originalMimetype }) => {
    const target = targetFormat.toLowerCase()

    // TXT to PDF
    if (target === 'pdf') {
        const pdfDoc = await PDFDocument.create()

        // Register fontkit
        const fontkit = await import('@pdf-lib/fontkit').then(m => m.default)
        pdfDoc.registerFontkit(fontkit)

        // Load custom font
        const fontPath = new URL('../assets/fonts/LiberationSans-Regular.ttf', import.meta.url)
        const fontBytes = await fs.promises.readFile(fontPath)
        const font = await pdfDoc.embedFont(fontBytes)

        const page = pdfDoc.addPage()
        const { width, height } = page.getSize()
        const fontSize = 12
        const margin = 50

        const text = buffer.toString('utf-8')

        // Simple text wrapping logic
        const lines = text.split(/\r\n|\r|\n/)
        let y = height - margin

        let currentPage = page

        for (const line of lines) {
            if (y < margin) {
                currentPage = pdfDoc.addPage()
                y = height - margin
            }

            // Basic wrapping could be added here, for now just printing lines
            // A more robust solution would measure text width and wrap
            currentPage.drawText(line, {
                x: margin,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
            })
            y -= fontSize + 2
        }

        const pdfBytes = await pdfDoc.save()
        return {
            buffer: Buffer.from(pdfBytes),
            info: {
                original: {
                    format: 'txt',
                    size: buffer.length
                },
                converted: {
                    format: 'pdf',
                    size: pdfBytes.length
                }
            }
        }
    }

    // PDF to TXT
    if (target === 'txt') {
        let parse = pdfParse
        // Handle potential ESM/CommonJS interop issues
        if (typeof parse !== 'function' && parse.default) {
            parse = parse.default
        }

        if (typeof parse !== 'function') {
            console.error('pdf-parse import failed:', parse);
            throw new Error('Failed to load PDF parser');
        }

        const data = await parse(buffer)
        const text = data.text
        const txtBuffer = Buffer.from(text, 'utf-8')

        return {
            buffer: txtBuffer,
            info: {
                original: {
                    format: 'pdf',
                    size: buffer.length
                },
                converted: {
                    format: 'txt',
                    size: txtBuffer.length
                }
            }
        }
    }

    throw new Error(`Unsupported conversion: to ${targetFormat}`)
}
