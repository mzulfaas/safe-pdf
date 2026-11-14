# SafePDF 🔒📄

> **100% Private, Client-Side PDF Compression Engine.**  
> Compress PDFs directly inside your browser memory using WebAssembly and HTML5 Canvas. Zero file uploads, zero telemetry, and zero server storage.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-safepdf--app.vercel.app-black?logo=vercel&logoColor=white)](https://safepdf-app.vercel.app)
[![Privacy: 100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20In--RAM-10B981)](#privacy-architecture)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎬 Live Demo & Video Showcase

![SafePDF Demo Showcase](https://raw.githubusercontent.com/mzulfaas/safe-pdf/main/public/demo.gif)

> 📹 **High-Definition Video**: [safepdf_demo_showcase.mp4](safepdf_demo_showcase.mp4) (Watch raw 1080p recording in GitHub video player)  
> 🔗 **Interactive Web App**: [https://safepdf-app.vercel.app](https://safepdf-app.vercel.app)

---

## 💡 The Problem with Traditional PDF Compressors

Whenever you use top-ranking search results to compress a PDF, you are usually forced to upload private tax filings, signed contracts, medical records, or government IDs to third-party cloud servers. 

Most services retain documents on their disks, expose sensitive files to data breaches, or impose arbitrary daily paywalls on basic document compression.

**SafePDF replaces cloud pipelines with local hardware execution.** Modern consumer laptops and smartphones have more than enough CPU and GPU rasterization power to parse, render, downsample, and repackage PDFs directly in browser RAM.

---

## 🛠️ Privacy Architecture & Pipeline

SafePDF relies on a decoupled, client-side rendering and reconstruction pipeline:

```
[ User PDF File ]
       │
       ▼
[ Web Worker: pdfjs-dist ]
  • Decodes PDF document tree off-main-thread
  • Renders targeted pages onto in-memory HTML5 <canvas>
       │
       ▼
[ Canvas Quantization Engine ]
  • Downscales resolution based on selected preset
  • Re-encodes raster frames to optimized JPEG streams
       │
       ▼
[ Document Reassembly: pdf-lib ]
  • Creates a clean PDF container in browser memory
  • Embeds compressed JPEG byte buffers as PDF pages
       │
       ▼
[ In-Memory Blob URL ] ───► Instant Download (0 Outbound Packets)
```

### Architectural Guarantees
1. **Zero Outbound Packets**: Open your browser DevTools Network tab while compressing a file. No file payloads, multipart forms, or telemetry blobs are ever transmitted.
2. **Web Worker Isolation**: PDF decoding runs inside Mozilla's PDF.js Web Worker (`pdf.worker.min.mjs`), keeping the Vue 3 UI fluid at 60 FPS even during intensive rasterization.
3. **RAM-Only Lifecycle**: All temporary page canvases and TypedArrays are garbage-collected as soon as the final blob is generated.

---

## ⚡ Compression Presets & Benchmarks

SafePDF provides three calibrated compression profiles:

| Preset | Scale Factor | JPEG Quality | File Size Reduction | Best Suited For |
| :--- | :---: | :---: | :---: | :--- |
| **Extreme Compression** | `1.0x` | `0.55` | **70% - 90%** | Strict portal limits (e.g. government portals, email attachments < 2 MB) |
| **Recommended** | `1.35x` | `0.72` | **50% - 75%** | Optimal balance of crisp typography, image clarity, and compact size |
| **High Quality** | `1.7x` | `0.85` | **25% - 40%** | Retaining high-resolution charts, presentation slides, and fine print |

> **Real-World Metric**: An 18-page scanned business contract (14.2 MB) compresses down to 2.8 MB in ~3.4 seconds on an M-series Mac or modern Intel/AMD laptop without sending a single byte over the wire.

---

## ⚖️ Engineering Tradeoffs

* **Pros**: Complete privacy compliance (GDPR, HIPAA-friendly by design), zero server maintenance cost, zero database bills, unlimited usage without rate limits.
* **Tradeoff**: Very large documents (e.g. 200+ high-DPI scanned pages) demand considerable browser memory during rasterization. For typical everyday documents (5 to 50 pages), memory usage stays comfortably within standard browser tab limits.

---

## 💻 Tech Stack

* **Frontend Framework**: [Vue 3](https://vuejs.org/) (`<script setup>` Composition API)
* **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/)
* **PDF Decoding & Rasterization**: [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) (`pdfjs-dist`)
* **PDF Generation & Binary Assembly**: [pdf-lib](https://pdf-lib.js.org/)
* **Icons**: [Lucide Vue](https://lucide.dev/)
* **Tooling & Build System**: [Vite 6](https://vite.dev/) + [TypeScript 5](https://www.typescriptlang.org/)

---

## 🏃 Getting Started Locally

### Prerequisites
* Node.js (v18.0 or newer)
* npm, pnpm, or yarn

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/mzulfaas/safe-pdf.git
cd safe-pdf

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
# Compile and bundle TypeScript & Vue assets
npm run build
```

Production-ready static files are generated in `dist/`, ready for zero-configuration hosting on Vercel, Cloudflare Pages, or GitHub Pages.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Authored by [Muhamad Zulfa](https://github.com/mzulfaas). Contributions and feedback are welcome.
