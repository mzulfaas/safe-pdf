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
  HardDrive
} from '@lucide/vue'
import {
  compressPdf,
  formatBytes,
  PRESETS,
  type CompressionPreset,
  type CompressionProgress,
  type CompressionResult
} from './services/pdfCompressor'

// State
const selectedFile = ref<File | null>(null)
const selectedPreset = ref<CompressionPreset>('recommended')
const isDragging = ref(false)
const isCompressing = ref(false)
const progress = ref<CompressionProgress | null>(null)
const result = ref<CompressionResult | null>(null)
const errorMessage = ref<string | null>(null)

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

function handleFileSelect(file: File) {
  errorMessage.value = null
  result.value = null

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    errorMessage.value = 'Mohon unggah berkas dengan format PDF.'
    return
  }

  selectedFile.value = file
}

function removeSelectedFile() {
  selectedFile.value = null
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
    totalPages: 1,
    percent: 0,
    statusText: 'Menyiapkan proses kompresi...'
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
      err?.message || 'Terjadi kesalahan saat memproses berkas PDF. Pastikan file tidak terenkripsi/rusak.'
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
                <ShieldCheck class="w-3 h-3" /> 100% Client-Side
              </span>
            </div>
            <p class="text-xs text-slate-500 hidden sm:block">Zero Server Uploads • Bebas & Privat</p>
          </div>
        </div>

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
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
      <!-- Hero Header -->
      <div class="text-center max-w-2xl mb-8">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Kompres Berkas PDF Anda Secara <span class="text-emerald-600">Aman & Privat</span>
        </h1>
        <p class="text-slate-600 text-sm sm:text-base leading-relaxed">
          Semua proses kompresi berjalan langsung di memori browser Anda. 
          <span class="font-semibold text-slate-800">Berkas tidak pernah dikirim ke server mana pun</span>, 
          sehingga dokumen sensitif (KTP, CV, laporan keuangan) tetap aman seutuhnya.
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
            <p class="font-semibold">Perhatian</p>
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
            Tarik & Lepas berkas PDF Anda ke sini
          </h3>
          <p class="text-slate-500 text-sm mb-5">
            atau klik untuk memilih berkas dari perangkat Anda
          </p>

          <button 
            type="button" 
            class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm shadow-emerald-200 transition-colors"
          >
            <FileText class="w-4 h-4" />
            Pilih Berkas PDF
          </button>

          <p class="text-xs text-slate-400 mt-4 flex items-center gap-1.5">
            <Lock class="w-3.5 h-3.5 text-emerald-600" /> 
            Diproses lokal di perangkat Anda (Tidak ada batas ukuran)
          </p>
        </div>

        <!-- STATE 2: File Selected & Options -->
        <div v-else-if="selectedFile && !result" class="space-y-6">
          <!-- File Details Card -->
          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div class="flex items-center gap-3.5 overflow-hidden">
              <div class="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <FileText class="w-6 h-6" />
              </div>
              <div class="overflow-hidden">
                <h4 class="font-semibold text-slate-900 truncate text-sm sm:text-base">
                  {{ selectedFile.name }}
                </h4>
                <p class="text-xs text-slate-500">
                  Ukuran Asli: <span class="font-medium text-slate-700">{{ formattedOriginalSize }}</span>
                </p>
              </div>
            </div>

            <button 
              v-if="!isCompressing"
              @click="removeSelectedFile"
              class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Ganti berkas"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>

          <!-- Compression Preset Selector -->
          <div v-if="!isCompressing">
            <label class="block text-sm font-bold text-slate-800 mb-3">
              Pilih Tingkat Kompresi:
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                v-for="(config, key) in PRESETS"
                :key="key"
                type="button"
                @click="selectedPreset = key as CompressionPreset"
                :class="[
                  'text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between',
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
                      {{ config.reductionEstimate }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 leading-relaxed">
                    {{ config.description }}
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
                {{ progress?.statusText || 'Sedang memproses...' }}
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
              Harap jangan menutup browser selama proses berlangsung.
            </p>
          </div>

          <!-- Submit Button -->
          <div v-if="!isCompressing" class="pt-2">
            <button
              @click="startCompression"
              class="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm shadow-emerald-200 flex items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer"
            >
              <Sparkles class="w-5 h-5" />
              Mulai Kompresi Sekarang
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
              Kompresi Berhasil!
            </h3>
            <p class="text-slate-500 text-sm">
              Dokumen Anda telah dioptimalkan tanpa pernah menyentuh internet.
            </p>
          </div>

          <!-- Size Comparison Card -->
          <div class="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-lg mx-auto">
            <div class="p-2">
              <span class="block text-xs text-slate-400 font-medium">Ukuran Asli</span>
              <span class="text-sm sm:text-base font-bold text-slate-600 line-through">
                {{ formatBytes(result.originalSize) }}
              </span>
            </div>

            <div class="p-2 border-x border-slate-200">
              <span class="block text-xs text-emerald-600 font-medium">Ukuran Baru</span>
              <span class="text-sm sm:text-base font-bold text-emerald-700">
                {{ formattedCompressedSize }}
              </span>
            </div>

            <div class="p-2">
              <span class="block text-xs text-slate-400 font-medium">Penghematan</span>
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
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm shadow-emerald-200 transition-all hover:shadow-md"
            >
              <Download class="w-5 h-5" />
              Unduh PDF Hasil Kompresi
            </a>

            <button
              @click="removeSelectedFile"
              class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors cursor-pointer"
            >
              <RotateCcw class="w-4 h-4" />
              Kompres Berkas Lain
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
          <h4 class="font-bold text-slate-900 text-sm">Privasi 100% Terjaga</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            Tidak ada backend, tidak ada database. Berkas PDF Anda tidak pernah diunggah atau disimpan di cloud kami.
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap class="w-5 h-5" />
          </div>
          <h4 class="font-bold text-slate-900 text-sm">Gratis & Tanpa Batas</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            Kompres sebanyak yang Anda mau tanpa batasan kuota antrean atau paksaan berlangganan bulanan.
          </p>
        </div>

        <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-2">
          <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <HardDrive class="w-5 h-5" />
          </div>
          <h4 class="font-bold text-slate-900 text-sm">Open Source di GitHub</h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            Seluruh kode transparan dan dapat diaudit secara terbuka untuk membuktikan integritas keamanan sistem.
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
      <div class="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          © 2026 <strong>SafePDF</strong>. Dikembangkan secara open-source oleh <strong>Muhamad Zulfa Assyfa</strong>.
        </p>
        <p class="flex items-center gap-1">
          Ditenagai oleh <span class="font-semibold text-emerald-600">Vue 3</span>, <span class="font-semibold text-blue-600">TypeScript</span> & <span class="font-semibold text-cyan-600">Tailwind CSS</span>
        </p>
      </div>
    </footer>
  </div>
</template>
