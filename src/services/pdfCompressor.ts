import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument } from 'pdf-lib'

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export type CompressionPreset = 'extreme' | 'recommended' | 'low'

export interface CompressionSettings {
  scale: number
  quality: number
  label: string
  description: string
  reductionEstimate: string
}

export const PRESETS: Record<CompressionPreset, CompressionSettings> = {
  extreme: {
    scale: 1.0,
    quality: 0.55,
    label: 'Extreme Compression',
    description: 'Smallest file size. Ideal for strict upload limits and email attachments (< 2MB).',
    reductionEstimate: '~70% - 90%',
  },
  recommended: {
    scale: 1.35,
    quality: 0.72,
    label: 'Recommended',
    description: 'Optimal balance between crisp visual readability and significant size reduction.',
    reductionEstimate: '~50% - 75%',
  },
  low: {
    scale: 1.7,
    quality: 0.85,
    label: 'High Quality',
    description: 'Maximum visual sharpness and clarity with mild file size compression.',
    reductionEstimate: '~25% - 40%',
  },
}

export interface PdfMetadata {
  totalPages: number
  thumbnailUrl: string
}

export async function getPdfMetadata(file: File): Promise<PdfMetadata> {
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  })
  const sourcePdf = await loadingTask.promise
  const totalPages = sourcePdf.numPages

  let thumbnailUrl = ''
  try {
    const page = await sourcePdf.getPage(1)
    const viewport = page.getViewport({ scale: 0.4 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (context) {
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({
        canvasContext: context,
        viewport,
        canvas,
      }).promise
      thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
      canvas.width = 0
      canvas.height = 0
    }
  } catch (e) {
    console.warn('Could not generate PDF thumbnail', e)
  }

  return { totalPages, thumbnailUrl }
}

export interface CompressionProgress {
  currentPage: number
  totalPages: number
  percent: number
  statusText: string
}

export interface CompressionResult {
  blob: Blob
  downloadUrl: string
  originalSize: number
  compressedSize: number
  savedPercent: number
  totalPages: number
}

export async function compressPdf(
  file: File,
  preset: CompressionPreset,
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult> {
  const originalSize = file.size
  const settings = PRESETS[preset]

  onProgress?.({
    currentPage: 0,
    totalPages: 1,
    percent: 5,
    statusText: 'Reading PDF document in browser...',
  })

  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  })

  const sourcePdf = await loadingTask.promise
  const totalPages = sourcePdf.numPages
  const targetPdf = await PDFDocument.create()

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.({
      currentPage: pageNum,
      totalPages,
      percent: Math.round((pageNum / totalPages) * 85),
      statusText: `Compressing page ${pageNum} of ${totalPages}...`,
    })

    const page = await sourcePdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: settings.scale })

    // Create an offscreen canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Failed to create 2D canvas context in browser.')
    }

    canvas.width = viewport.width
    canvas.height = viewport.height

    // Render page into canvas
    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    }).promise

    // Convert canvas to compressed JPEG
    const jpegDataUrl = canvas.toDataURL('image/jpeg', settings.quality)
    const jpegBytes = dataUrlToUint8Array(jpegDataUrl)

    // Embed compressed image into pdf-lib
    const embeddedImage = await targetPdf.embedJpg(jpegBytes)
    const originalViewport = page.getViewport({ scale: 1.0 })

    const newPage = targetPdf.addPage([originalViewport.width, originalViewport.height])
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: originalViewport.width,
      height: originalViewport.height,
    })

    // Clean up canvas
    canvas.width = 0
    canvas.height = 0
  }

  onProgress?.({
    currentPage: totalPages,
    totalPages,
    percent: 95,
    statusText: 'Assembling final compressed PDF...',
  })

  const compressedPdfBytes = await targetPdf.save({ useObjectStreams: true })
  const compressedSize = compressedPdfBytes.byteLength
  const blob = new Blob([new Uint8Array(compressedPdfBytes)], { type: 'application/pdf' })
  const downloadUrl = URL.createObjectURL(blob)

  const savedPercent = Math.max(
    0,
    Math.round(((originalSize - compressedSize) / originalSize) * 100)
  )

  onProgress?.({
    currentPage: totalPages,
    totalPages,
    percent: 100,
    statusText: 'Done!',
  })

  return {
    blob,
    downloadUrl,
    originalSize,
    compressedSize,
    savedPercent,
    totalPages,
  }
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1]
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
