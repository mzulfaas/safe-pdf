# 🔒 SafePDF

> **100% Private, Client-Side PDF Compressor.** Your files never leave your browser.

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Why SafePDF?

Most online PDF compression tools upload your sensitive documents (CVs, financial statements, contracts, IDs) to remote servers.

**SafePDF is different.** All compression operations run locally inside your browser using modern WebAssembly and JavaScript technologies. 

- 🛡️ **100% Private**: Zero server uploads. No backend server has access to your files.
- ⚡ **Fast & Responsive**: Powered by Vue 3 and Vite.
- 💸 **Completely Free**: No subscription limits, no file size paywalls.
- 📱 **Mobile & Desktop Friendly**: Clean, intuitive, and responsive UI.

---

## 🛠️ Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vite.dev/)
- **PDF Engine**: Client-side PDF manipulation libraries / WebAssembly

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

```bash
# Clone the repository
git clone https://github.com/mzulfaas/safe-pdf.git

# Enter project directory
cd safe-pdf

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📦 Build for Production

```bash
npm run build
```

The compiled assets will be ready in the `dist/` directory, ready to be deployed to **Vercel**, **Cloudflare Pages**, or **GitHub Pages**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
