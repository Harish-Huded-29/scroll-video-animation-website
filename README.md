# Scroll Video Maker (Node.js & TypeScript for Cloudflare Pages)

A pixel-perfect, 1:1 replica of `scrollvideo.py` built with **Node.js**, **TypeScript**, and **Next.js**, fully optimized for **instant deployment on Cloudflare Pages**.

Turn any video into a silky-smooth, interactive scroll animation website.

---

## ✨ Features (1:1 with Python Version)

- **Identical 3D Interactive Design**:
  - Fullscreen 3D dynamic undulating mesh canvas background with mouse cursor physics.
  - 3D Holographic Floating Logo with live cursor tilt, sheen reflection, and spinning accent ring.
  - Iridescent shimmering title with animated gradient.
  - Interactive info buttons `(i)` with floating glassmorphism popover dialogs.
- **Identical Planning Engine**:
  - Exact frame calculation mathematics, memory budgeting, and pixels-per-frame (PPF) interpolation.
  - Continuous smoothness slider (1 to 100) with Light, Balanced, Smooth, Silky, and Ultra modes.
  - Resolution selector (720p HD, 1080p Full HD, 1440p 2K, 2160p 4K).
  - WebP, JPG, PNG, and AVIF formats with custom quality compression.
  - Fill Screen (Cover) vs. Show Whole Video (Contain) video fit modes.
  - Real-time plan calculation with green optimization badges and warning indicators.
- **3D Progress Stage**:
  - 3D rotating film cube with 6 holographic faces.
  - Glowing pulsing ring with dual 3D orbiting particles.
  - Real-time percentage display and animated gradient shine bar.
- **Scroll-Controlled Viewer & Website Exporter**:
  - Sticky fullscreen canvas tracking scroll position with delta-time easing.
  - Top glassmorphism navigation bar: Fullscreen toggle, Edit video, and Download/Export.
  - **Export Options**: Export only frames OR complete working websites in **HTML/JS**, **React + Vite**, or **Next.js**.
  - Modern browser Native Directory Picker (`showDirectoryPicker`) to save directly to local folder.
  - High-speed ZIP download powered by JSZip.
  - Complete AI Integration Prompt (`INTEGRATION_PROMPT.md`) instructing AI models to interview you first before embedding the animation into an existing website.

---

## 🚀 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To create a static production build:

```bash
npm run build
```

The output will be placed in the `out/` directory.

---

## 🌐 How to Deploy to Cloudflare Pages

### Option 1: Git Integration via Cloudflare Dashboard (Recommended)

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Deploy Scroll Video Maker to Cloudflare Pages"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository and configure the build settings:
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
4. Click **Save and Deploy**. Cloudflare Pages will build and deploy your application across its global edge network!

### Option 2: Deploy directly via Wrangler CLI

```bash
# 1. Build the static site
npm run build

# 2. Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=scroll-video-maker
```

---

## ⚡ Why Cloudflare Pages is Ideal

1. **Ultra-Fast Global Edge Delivery**: Static assets and pre-rendered pages are cached and served from Cloudflare's 300+ data centers worldwide with zero cold starts.
2. **No Upload Limits**: All video decoding runs directly inside the user's browser using GPU hardware acceleration. You can process 100MB+ 4K videos without hitting cloud function request payload caps.
3. **Zero Server Maintenance & Unmetered Bandwidth**: 100% static client-side application with zero compute costs.
