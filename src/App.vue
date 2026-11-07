<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ShieldCheck,
  FileText,
  CloudUpload,
  Download,
  Lock,
  Sparkles,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Zap,
  HardDrive,
  Globe,
  Layers,
  ChevronDown,
  HelpCircle,
  Sliders
} from '@lucide/vue'
import {
  compressPdf,
  formatBytes,
  getPdfMetadata,
  type CompressionPreset,
  type CompressionProgress,
  type CompressionResult,
  type PdfMetadata
} from './services/pdfCompressor'

// Language State (Default: English)
type Language = 'en' | 'id'
const locale = ref<Language>('en')

function toggleLanguage() {
  locale.value = locale.value === 'en' ? 'id' : 'en'
}

// State
const selectedFile = ref<File | null>(null)
const pdfMetadata = ref<PdfMetadata | null>(null)
const selectedPreset = ref<CompressionPreset>('recommended')
const isDragging = ref(false)
const isCompressing = ref(false)
const progress = ref<CompressionProgress | null>(null)
const result = ref<CompressionResult | null>(null)
const errorMessage = ref<string | null>(null)

// FAQ Accordion State
const openFaqIndex = ref<number | null>(0)
function toggleFaq(index: number) {
  openFaqIndex.value = openFaqIndex.value === index ? null : index
}

// Translations & SEO Content
const t = computed(() => {
  if (locale.value === 'id') {
    return {
      tagline: '100% Client-Side • Tanpa Server',
      subTagline: 'Tanpa Upload Server • Bebas & Privat',
      heroTitlePrefix: 'Kompres Berkas PDF Secara',
      heroTitleHighlight: 'Aman & Privat',
      heroDesc: 'Semua proses kompresi berjalan langsung di memori browser Anda. Berkas Anda tidak pernah dikirim ke server mana pun, menjaga kerahasiaan dokumen penting Anda (KTP, CV, paspor, laporan keuangan).',
      dropTitle: 'Tarik & Lepas berkas PDF Anda ke sini',
      dropSubtitle: 'atau klik untuk memilih berkas dari perangkat Anda',
      selectBtn: 'Pilih Berkas PDF',
      privacyNote: 'Diproses lokal di perangkat Anda (Tanpa batas ukuran berkas)',
      choosePreset: 'Pilih Tingkat Kompresi:',
      startBtn: 'Mulai Kompresi Sekarang',
      successTitle: 'Kompresi Berhasil!',
      successDesc: 'Dokumen Anda telah dioptimalkan secara lokal tanpa menyentuh internet.',
      originalSize: 'Ukuran Asli',
      newSize: 'Ukuran Baru',
      saved: 'Penghematan',
      downloadBtn: 'Unduh PDF Hasil Kompresi',
      compressAnother: 'Kompres Berkas Lain',
      invalidPdf: 'Mohon unggah berkas berformat PDF yang valid.',
      dontClose: 'Harap jangan menutup browser selama proses berlangsung.',
      pages: 'halaman',
      trust1Title: '100% Privat & Rahasia',
      trust1Desc: 'Tidak ada backend, tidak ada database. Berkas PDF Anda tidak pernah diunggah atau disimpan di cloud.',
      trust2Title: 'Gratis & Tanpa Batas',
      trust2Desc: 'Kompres sebanyak yang Anda mau tanpa batasan kuota antrean harian atau paksaan berlangganan.',
      trust3Title: 'Open Source di GitHub',
      trust3Desc: 'Seluruh kode sumber bersifat publik dan dapat diaudit secara terbuka untuk membuktikan integritas keamanan.',
      howTitle: 'Cara Kompres PDF dalam 3 Langkah Mudah',
      howSubtitle: 'Cepat, aman, dan tanpa perlu registrasi akun apa pun.',
      steps: [
        { title: '1. Masukkan Berkas PDF', desc: 'Tarik dan lepas atau pilih berkas PDF dari komputer/HP Anda.' },
        { title: '2. Tentukan Tingkat Kompresi', desc: 'Pilih opsi Kompresi Maksimal, Direkomendasikan, atau Kualitas Tinggi.' },
        { title: '3. Unduh Seketika', desc: 'Hasil kompresi selesai dalam hitungan detik dan siap Anda unduh langsung.' }
      ],
      faqTitle: 'Pertanyaan yang Sering Diajukan (FAQ)',
      faqSubtitle: 'Semua yang perlu Anda ketahui tentang keamanan dan cara kerja SafePDF.',
      faqs: [
        {
          q: 'Apakah berkas PDF saya diunggah ke server SafePDF?',
          a: 'Sama sekali tidak! Berbeda dengan kompresor online biasa (seperti iLovePDF atau Smallpdf), SafePDF menggunakan teknologi client-side. Dokumen Anda dibaca dan dikompresi langsung oleh prosesor (CPU/RAM) perangkat Anda sendiri. Data tidak pernah meninggalkan browser Anda.'
        },
        {
          q: 'Apakah ada batasan ukuran berkas atau kuota harian?',
          a: 'Tidak ada batasan buatan. Anda bisa mengompresi dokumen sebesar apa pun dan sebanyak apa pun yang Anda inginkan tanpa antrean dan tanpa dipungut biaya.'
        },
        {
          q: 'Apakah teks di dalam PDF tetap jelas setelah dikompresi?',
          a: 'Ya. Pilihan "Direkomendasikan" dan "Kualitas Tinggi" mempertahankan ketajaman teks dengan sangat baik sambil memangkas ukuran gambar dan metadata berlebih.'
        },
        {
          q: 'Bagaimana cara SafePDF bekerja secara teknis?',
          a: 'SafePDF menggabungkan Vue 3, library PDF.js dari Mozilla, dan pdf-lib. Halaman PDF dianalisis dan dirender secara lokal menggunakan HTML5 Canvas, lalu disusun kembali menjadi berkas PDF baru yang ramping dan terkompresi.'
        }
      ],
      presets: {
        extreme: { label: 'Kompresi Maksimal', desc: 'Ukuran file terkecil. Ideal untuk batas upload email/portal (< 2MB).', est: '~70% - 90%' },
        recommended: { label: 'Direkomendasikan', desc: 'Keseimbangan terbaik antara keterbacaan teks dan penghematan ukuran.', est: '~50% - 75%' },
        low: { label: 'Kualitas Tinggi', desc: 'Kualitas visual sangat tajam dengan kompresi ringan.', est: '~25% - 40%' }
      }
    }
  }

  return {
    tagline: '100% Client-Side • Zero Server Uploads',
    subTagline: 'Zero Server Uploads • Fast & Confidential',
    heroTitlePrefix: 'Compress PDF Files',
    heroTitleHighlight: 'Privately & Free',
    heroDesc: 'All compression happens entirely inside your browser memory. Your files are never uploaded to any remote server, ensuring sensitive documents (CVs, passports, invoices) stay 100% confidential.',
    dropTitle: 'Drop your PDF file here',
    dropSubtitle: 'or click to browse from your device',
    selectBtn: 'Choose PDF File',
    privacyNote: 'Processed locally on your device (No file size limits)',
    choosePreset: 'Select Compression Level:',
    startBtn: 'Compress PDF Now',
    successTitle: 'Compression Complete!',
    successDesc: 'Your document was optimized locally without ever touching the cloud.',
    originalSize: 'Original Size',
    newSize: 'New Size',
    saved: 'Saved',
    downloadBtn: 'Download Compressed PDF',
    compressAnother: 'Compress Another File',
    invalidPdf: 'Please upload a valid PDF file.',
    dontClose: 'Please keep this browser tab open during compression.',
    pages: 'pages',
    trust1Title: '100% Private & Confidential',
    trust1Desc: 'Zero backend, zero tracking, zero database. Your documents never touch external servers or cloud storage.',
    trust2Title: 'Free & Truly Unlimited',
    trust2Desc: 'Compress as many documents as you need with zero hourly limits, queue delays, or subscription paywalls.',
    trust3Title: 'Open Source on GitHub',
    trust3Desc: 'Fully transparent and auditable codebase, showcasing modern Vue 3, TypeScript, and client-side WebAssembly.',
    howTitle: 'How to Compress PDF in 3 Simple Steps',
    howSubtitle: 'Fast, secure, and completely free with no signup required.',
    steps: [
      { title: '1. Select Your PDF', desc: 'Drag and drop or browse any PDF file directly from your computer or phone.' },
      { title: '2. Choose Compression Level', desc: 'Pick from Extreme, Recommended, or High Quality based on your target file size.' },
      { title: '3. Instant Local Download', desc: 'Your optimized PDF is generated in seconds and ready for immediate download.' }
    ],
    faqTitle: 'Frequently Asked Questions',
    faqSubtitle: 'Everything you need to know about SafePDF privacy and performance.',
    faqs: [
      {
        q: 'Are my PDF files uploaded to any remote servers?',
        a: 'Never. Unlike traditional online tools that store your documents on third-party servers, SafePDF works 100% client-side. The file is processed directly inside your browser memory using your device’s CPU. No data is ever transmitted across the internet.'
      },
      {
        q: 'Is there any file size limit or daily compression quota?',
        a: 'No artificial limits! You can compress files of any size as many times as you like. Because processing uses your own device hardware, you will never encounter wait queues or paywalls.'
      },
      {
        q: 'Will the compressed PDF retain legible text and formatting?',
        a: 'Yes! The "Recommended" and "High Quality" presets are calibrated to maintain crisp typography and document readability while optimizing heavy embedded graphics and removing redundant metadata streams.'
      },
      {
        q: 'How does client-side PDF compression work under the hood?',
        a: 'SafePDF leverages Mozilla’s PDF.js rendering pipeline and pdf-lib. Document pages are inspected and rasterized locally onto offscreen HTML5 canvases, dynamically re-encoded at optimal quality ratios, and reassembled into a fresh, lightweight PDF.'
      }
    ],
    presets: {
      extreme: { label: 'Extreme Compression', desc: 'Smallest file size. Ideal for strict upload limits and email attachments (< 2MB).', est: '~70% - 90%' },
      recommended: { label: 'Recommended', desc: 'Optimal balance between crisp readability and substantial file reduction.', est: '~50% - 75%' },
      low: { label: 'High Quality', desc: 'Maximum visual sharpness and clarity with mild file size compression.', est: '~25% - 40%' }
    }
  }
})

// Drag and drop handlers
function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFileSelect(files[0])
  }
}

function onFileInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFileSelect(target.files[0])
  }
}

async function handleFileSelect(file: File) {
  errorMessage.value = null
  result.value = null
  pdfMetadata.value = null

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    errorMessage.value = t.value.invalidPdf
    return
  }

  selectedFile.value = file

  try {
    const meta = await getPdfMetadata(file)
    pdfMetadata.value = meta
  } catch (e) {
    console.warn('Metadata inspection skipped:', e)
  }
}

function removeSelectedFile() {
  selectedFile.value = null
  pdfMetadata.value = null
  result.value = null
  errorMessage.value = null
  progress.value = null
}

async function startCompression() {
  if (!selectedFile.value) return

  isCompressing.value = true
  errorMessage.value = null
  progress.value = {
    currentPage: 0,
    totalPages: pdfMetadata.value?.totalPages || 1,
    percent: 0,
    statusText: locale.value === 'id' ? 'Menyiapkan proses kompresi...' : 'Preparing compression...'
  }

  try {
    const res = await compressPdf(
      selectedFile.value,
      selectedPreset.value,
      (p) => {
        progress.value = p
      }
    )
    result.value = res
  } catch (err: any) {
    console.error(err)
    errorMessage.value =
      err?.message || (locale.value === 'id' ? 'Terjadi kesalahan saat memproses berkas PDF.' : 'Error compressing PDF. Please ensure the file is not corrupted or password-protected.')
  } finally {
    isCompressing.value = false
  }
}

const formattedOriginalSize = computed(() => {
  return selectedFile.value ? formatBytes(selectedFile.value.size) : '0 Bytes'
})

const formattedCompressedSize = computed(() => {
  return result.value ? formatBytes(result.value.compressedSize) : '0 Bytes'
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
    <!-- Navbar -->
    <header class="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
            <Lock class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl font-bold tracking-tight text-slate-900">SafePDF</span>
              <span class="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck class="w-3 h-3" /> {{ t.tagline }}
              </span>
            </div>
            <p class="text-xs text-slate-500 hidden sm:block">{{ t.subTagline }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Language Switcher Toggle -->
          <button
            type="button"
            @click="toggleLanguage"
            class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Switch Language"
          >
            <Globe class="w-3.5 h-3.5 text-slate-500" />
            <span>{{ locale.toUpperCase() }}</span>
          </button>

          <!-- GitHub Star Link -->
          <a
            href="https://github.com/mzulfaas/safe-pdf"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span class="hidden sm:inline">Star on GitHub</span>
          </a>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
      <!-- Hero Header -->
      <div class="text-center max-w-2xl mb-8">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          {{ t.heroTitlePrefix }} <span class="text-emerald-600">{{ t.heroTitleHighlight }}</span>
        </h1>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          {{ t.heroDesc }}
        </p>
      </div>

      <!-- App Card -->
      <div class="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        <!-- Error Alert -->
        <div 
          v-if="errorMessage" 
          class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3"
        >
          <AlertCircle class="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div>
            <p class="font-semibold">{{ locale === 'id' ? 'Perhatian' : 'Attention' }}</p>
            <p>{{ errorMessage }}</p>
          </div>
        </div>

        <!-- STATE 1: Dropzone (No file selected) -->
        <div 
          v-if="!selectedFile"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDrop"
          :class="[
            'border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center',
            isDragging 
              ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]' 
              : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50/60'
          ]"
          @click="($refs.fileInput as HTMLInputElement).click()"
        >
          <input 
            ref="fileInput"
            type="file" 
            accept="application/pdf,.pdf" 
            class="hidden" 
            @change="onFileInputChange"
          />

          <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
            <CloudUpload class="w-8 h-8" />
          </div>

          <h3 class="text-lg font-bold text-slate-800 mb-1">
            {{ t.dropTitle }}
          </h3>
          <p class="text-slate-500 text-sm mb-5">
            {{ t.dropSubtitle }}
          </p>

          <button 
            type="button" 
            class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-200 transition-colors"
          >
            <FileText class="w-4 h-4" />
            {{ t.selectBtn }}
          </button>

          <p class="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <Lock class="w-3.5 h-3.5 text-emerald-600" /> 
            {{ t.privacyNote }}
          </p>
        </div>

        <!-- STATE 2: File Selected & Options -->
        <div v-else-if="selectedFile && !result" class="space-y-6">
          <!-- File Details Card with Thumbnail -->
          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div class="flex items-center gap-3.5 overflow-hidden">
              <!-- Thumbnail Preview or Icon -->
              <div class="w-12 h-16 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                <img 
                  v-if="pdfMetadata?.thumbnailUrl" 
                  :src="pdfMetadata.thumbnailUrl" 
                  alt="PDF Thumbnail" 
                  class="w-full h-full object-cover"
                />
                <FileText v-else class="w-6 h-6 text-slate-500" />
              </div>

              <div class="overflow-hidden">
                <h4 class="font-semibold text-slate-900 truncate text-sm sm:text-base">
                  {{ selectedFile.name }}
                </h4>
                <div class="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span class="font-medium text-slate-700">{{ formattedOriginalSize }}</span>
                  <span v-if="pdfMetadata?.totalPages" class="flex items-center gap-1 text-slate-500">
                    • <Layers class="w-3 h-3 text-slate-400" /> {{ pdfMetadata.totalPages }} {{ t.pages }}
                  </span>
                </div>
              </div>
            </div>

            <button 
              v-if="!isCompressing"
              @click="removeSelectedFile"
              class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Remove file"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>

          <!-- Compression Preset Selector -->
          <div v-if="!isCompressing">
            <label class="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Sliders class="w-4 h-4 text-emerald-600" />
              {{ t.choosePreset }}
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="(config, key) in t.presets"
                :key="key"
                type="button"
                @click="selectedPreset = key as CompressionPreset"
                :class="[
                  'text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between cursor-pointer',
                  selectedPreset === key 
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                ]"
              >
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="font-bold text-sm text-slate-900">{{ config.label }}</span>
                    <span 
                      :class="[
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        selectedPreset === key 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-100 text-slate-600'
                      ]"
                    >
                      {{ config.est }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 leading-relaxed">
                    {{ config.desc }}
                  </p>
                </div>
              </button>
            </div>
          </div>

          <!-- Compression Progress -->
          <div v-if="isCompressing" class="py-6 space-y-4">
            <div class="flex justify-between items-center text-sm font-semibold text-slate-700">
              <span class="flex items-center gap-2">
                <RotateCcw class="w-4 h-4 animate-spin text-emerald-600" />
                {{ progress?.statusText || 'Processing...' }}
              </span>
              <span class="text-emerald-700">{{ progress?.percent || 0 }}%</span>
            </div>

            <!-- Progress bar -->
            <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div 
                class="bg-emerald-600 h-full rounded-full transition-all duration-300 ease-out"
                :style="{ width: `${progress?.percent || 0}%` }"
              ></div>
            </div>

            <p class="text-center text-xs text-slate-400">
              {{ t.dontClose }}
            </p>
          </div>

          <!-- Submit Button -->
          <div v-if="!isCompressing" class="pt-2">
            <button
              @click="startCompression"
              class="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer"
            >
              <Sparkles class="w-5 h-5" />
              {{ t.startBtn }}
            </button>
          </div>
        </div>

        <!-- STATE 3: Success Result -->
        <div v-else-if="result" class="space-y-6 text-center py-2">
          <div class="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 class="w-9 h-9" />
          </div>

          <div>
            <h3 class="text-2xl font-extrabold text-slate-900 mb-1">
              {{ t.successTitle }}
            </h3>
            <p class="text-slate-500 text-sm">
              {{ t.successDesc }}
            </p>
          </div>

          <!-- Size Comparison Card -->
          <div class="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-lg mx-auto">
            <div class="p-2">
              <span class="block text-xs text-slate-400 font-medium">{{ t.originalSize }}</span>
              <span class="text-sm sm:text-base font-bold text-slate-600 line-through">
                {{ formatBytes(result.originalSize) }}
              </span>
            </div>

            <div class="p-2 border-x border-slate-200">
              <span class="block text-xs text-emerald-600 font-medium">{{ t.newSize }}</span>
              <span class="text-sm sm:text-base font-bold text-emerald-700">
                {{ formattedCompressedSize }}
              </span>
            </div>

            <div class="p-2">
              <span class="block text-xs text-slate-400 font-medium">{{ t.saved }}</span>
              <span class="text-sm sm:text-base font-bold text-emerald-600">
                -{{ result.savedPercent }}%
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              :href="result.downloadUrl"
              :download="`compressed_${selectedFile?.name || 'document.pdf'}`"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm shadow-emerald-200 transition-all hover:shadow-md cursor-pointer"
            >
              <Download class="w-5 h-5" />
              {{ t.downloadBtn }}
            </a>

            <button
              @click="removeSelectedFile"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors cursor-pointer"
            >
              <RotateCcw class="w-4 h-4" />
              {{ t.compressAnother }}
            </button>
          </div>
        </div>

      </div>

      <!-- Feature / Trust Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-10">
        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck class="w-5 h-5" />
          </div>
          <h4 class="font-bold text-slate-900 text-sm">{{ t.trust1Title }}</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            {{ t.trust1Desc }}
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap class="w-5 h-5" />
          </div>
          <h4 class="font-bold text-slate-900 text-sm">{{ t.trust2Title }}</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            {{ t.trust2Desc }}
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2">
          <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <HardDrive class="w-5 h-5" />
          </div>
          <h4 class="font-bold text-slate-900 text-sm">{{ t.trust3Title }}</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            {{ t.trust3Desc }}
          </p>
        </div>
      </div>

      <!-- SEO SECTION 1: How It Works -->
      <section class="w-full mt-16 pt-10 border-t border-slate-200">
        <div class="text-center max-w-xl mx-auto mb-10">
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            {{ t.howTitle }}
          </h2>
          <p class="text-slate-500 text-sm">
            {{ t.howSubtitle }}
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div 
            v-for="(step, idx) in t.steps" 
            :key="idx" 
            class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative"
          >
            <div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">
              {{ idx + 1 }}
            </div>
            <h3 class="font-bold text-slate-900 text-base mb-2">{{ step.title }}</h3>
            <p class="text-slate-500 text-xs sm:text-sm leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </section>

      <!-- SEO SECTION 2: Frequently Asked Questions (FAQ) -->
      <section class="w-full mt-16 pt-10 border-t border-slate-200">
        <div class="text-center max-w-xl mx-auto mb-10">
          <div class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-3">
            <HelpCircle class="w-3.5 h-3.5" /> FAQ
          </div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            {{ t.faqTitle }}
          </h2>
          <p class="text-slate-500 text-sm">
            {{ t.faqSubtitle }}
          </p>
        </div>

        <div class="max-w-2xl mx-auto space-y-3">
          <div
            v-for="(faq, idx) in t.faqs"
            :key="idx"
            class="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-xs"
          >
            <button
              type="button"
              @click="toggleFaq(idx)"
              class="w-full p-4 sm:p-5 text-left font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
            >
              <span>{{ faq.q }}</span>
              <ChevronDown 
                :class="[
                  'w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0',
                  openFaqIndex === idx ? 'rotate-180 text-emerald-600' : ''
                ]" 
              />
            </button>

            <div
              v-show="openFaqIndex === idx"
              class="px-4 pb-5 sm:px-5 sm:pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3"
            >
              {{ faq.a }}
            </div>
          </div>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-200 bg-white py-6 mt-16 text-center text-xs text-slate-500">
      <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          © 2026 <strong>SafePDF</strong>. Built open-source by 
          <a 
            href="https://github.com/mzulfaas" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="font-semibold text-slate-800 hover:text-emerald-600 underline underline-offset-2 transition-colors"
          >
            mzulfaas
          </a>.
        </p>
        <p class="flex items-center gap-1">
          Powered by <span class="font-semibold text-emerald-600">Vue 3</span>, <span class="font-semibold text-blue-600">TypeScript</span> & <span class="font-semibold text-cyan-600">Tailwind CSS</span>
        </p>
      </div>
    </footer>
  </div>
</template>
