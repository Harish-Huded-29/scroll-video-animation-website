import { PreviewConfig } from "./types";

export type FrameworkType = "html" | "react" | "node";

export interface GeneratedFile {
  path: string; // Relative path inside the project folder, e.g. "index.html", "src/App.jsx", etc.
  content: string;
}

export function generateIntegrationPrompt(
  projectName: string,
  config: PreviewConfig
): string {
  return `# AI Website Integration Guide for ${projectName}

Use this prompt to seamlessly embed your exported video scroll frames into an existing website using Claude, Antigravity, Cursor, ChatGPT, or v0.

---

### COPY & PASTE THIS PROMPT TO YOUR AI ASSISTANT:

\`\`\`markdown
Act as an Elite Creative Frontend Architect and Senior UI Engineer specializing in award-winning interactive websites (Awwwards Site of the Year / Apple / Linear grade).

I have exported an image sequence of video frames (${config.count} frames, format: ${config.ext}, target resolution: ${config.width}x${config.height}, recommended scroll length: ${config.screens} screens) saved in my project under the "frames/" directory (e.g., "frame_0001.${config.ext}" through "frame_${String(config.count).padStart(config.pad, "0")}.${config.ext}").

My goal is to integrate this high-performance canvas scroll animation into my existing website (or build a dedicated interactive showpiece section).

==================================================
CRITICAL FIRST STEP: INTERVIEW & CLARIFICATION
==================================================
Before generating or writing ANY code, you MUST first interview me by asking the following 4 clarifying questions:

1. **Target Location & Section Placement:**
   - Where in my current website should this scroll animation live?
     * Top Hero section (first visual experience when opening the site)
     * Mid-page product feature showcase (between other content sections)
     * Full-width immersive background takeover while content scrolls above it
     * Dedicated standalone product launch / showpiece landing page

2. **Your Tech Stack & Styling Architecture:**
   - What framework and styling tools does your website use?
     * Next.js (App Router or Pages Router with TypeScript)
     * React (Vite / CRA / Remix)
     * Plain HTML5 + Vanilla JavaScript + CSS
     * Vue 3 / Nuxt 3 / SvelteKit / Astro
     * Styling: Tailwind CSS, CSS Modules, Styled Components, or Vanilla CSS?

3. **Narrative Text & Headline Content:**
   - What headlines, descriptions, badges, numbers, or Call-to-Action (CTA) buttons should appear over the video as the user scrolls?
   - Do you want to use the default 4-stage narrative template:
     * Phase 1 (0% – 22% Scroll): Centered Hero introduction + subtitle
     * Phase 2 (26% – 48% Scroll): Left-aligned Architecture / Feature spotlight + metric
     * Phase 3 (52% – 74% Scroll): Right-aligned Performance / Technology deep-dive
     * Phase 4 (78% – 100% Scroll): Centered Call-To-Action (CTA) button & finale
     (Or let me provide custom copy and scroll trigger ranges!)

4. **Scroll Rhythm & Pacing:**
   - How long should the scroll experience feel?
     * Fast & Punchy (~3 to 5 screen heights): Best for quick product reveals.
     * Balanced & Cinematic (~8 to 12 screen heights): Recommended sweet spot.
     * Ultra-Smooth Deep-Dive (~15 to 20 screen heights): Maximum fidelity.

==================================================
TECHNICAL ENGINE SPECIFICATIONS (FOR IMPLEMENTATION)
==================================================
Once I answer the questions above, implement the complete solution adhering strictly to these engineering standards:

- **60fps/120fps Canvas Engine**:
  * Implement an HTML5 Canvas rendering loop driven by requestAnimationFrame.
  * Use delta-time independent easing interpolation (currentFrame += (targetFrame - currentFrame) * ease) so scrolling feels silky-smooth on 60Hz, 120Hz (ProMotion), and 144Hz displays with zero jitter.
- **Retina & High-DPI Display Sharpness**:
  * Dynamically adjust canvas internal resolution to window.devicePixelRatio (capped at 2 to conserve GPU memory) while locking CSS width/height to 100%.
- **Zero Black Bars ("object-fit: cover" Math)**:
  * Scale and center each frame using Math.max(canvas.width / img.width, canvas.height / img.height) so the video fills 100% of the viewport without black bars or distortion across ultrawide monitors, tablets, and phones.
- **Progressive Two-Tier Frame Preloader**:
  * Load the initial batch of frames (and keyframes) first so the canvas is interactive in under 1 second, then stream remaining frames silently in the background with a subtle glowing loading bar.
- **Section Isolation & Zero Layout Breakage**:
  * Encapsulate everything inside a scoped scroll-area container (position: relative;) with a sticky canvas stage (position: sticky; top: 0; height: 100vh; height: 100dvh; overflow: hidden;).
  * Ensure existing website navigation, headers, footers, and sibling sections are completely unaffected.
- **Smooth Narrative Overlay Triggers**:
  * Drive narrative text block transitions via scroll percentage with CSS opacity and transform: translateY(), toggling pointer-events: auto only when visible.
- **Mobile Touch & Trackpad Optimization**:
  * Fully support touch scrolling on iOS/Android and trackpad inertia scrolling without page stutter.

Please begin by asking me the 4 clarifying questions above so we can tailor the code perfectly to my website!
\`\`\`
`;
}

export function generateHtmlTemplate(
  projectName: string,
  config: PreviewConfig
): GeneratedFile[] {
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName} - Scroll Video Animation</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <!-- Scroll progress bar at top -->
  <div id="progress"></div>

  <!-- Main scroll area controlling canvas playback -->
  <div id="scroll-area" style="height: ${(config.screens + 1) * 100}vh;">
    <div id="stage">
      <canvas id="canvas"></canvas>

      <!-- Overlay narrative text blocks -->
      <div class="overlay-container">
        <!-- Block 1: Hero Intro (0% - 24%) -->
        <div class="text-block" id="block-1">
          <div class="badge">SCROLL INTERACTION</div>
          <h1>Redefining Digital Experience</h1>
          <p>Scroll down to explore every frame of the journey.</p>
        </div>

        <!-- Block 2: Key Innovation (26% - 50%) -->
        <div class="text-block left-align" id="block-2">
          <span class="index">01 / ARCHITECTURE</span>
          <h2>Engineered for Seamless Motion</h2>
          <p>Every frame is synchronized to user input, blending high-fidelity visuals with zero lag.</p>
          <div class="metric">120 FPS · 0ms Input Latency</div>
        </div>

        <!-- Block 3: Deep Tech Detail (52% - 75%) -->
        <div class="text-block right-align" id="block-3">
          <span class="index">02 / PERFORMANCE</span>
          <h2>Pixel-Perfect Detail at Scale</h2>
          <p>Hardware-accelerated rasterization ensures clarity across desktop, tablet, and mobile screens.</p>
        </div>

        <!-- Block 4: Call To Action (78% - 100%) -->
        <div class="text-block" id="block-4">
          <h2>Ready to Build Something Extraordinary?</h2>
          <p>Transform static video into interactive, living web experiences.</p>
          <div class="cta-row">
            <a href="#explore" class="btn primary">Get Started Now →</a>
            <a href="#learn" class="btn secondary">Learn More</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="hint">Scroll ↓</div>

  <script src="app.js"></script>
</body>
</html>
`;

  const styleCss = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  background: #0b0b0d;
  color: #f4f4f5;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  overflow-x: hidden;
}

#progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
  z-index: 100;
  transition: width 0.1s linear;
}

#scroll-area {
  position: relative;
  width: 100%;
}

#stage {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Narrative Overlay Container */
.overlay-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: grid;
  place-items: center;
  padding: 24px;
}

.text-block {
  position: absolute;
  max-width: 620px;
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.35s ease, transform 0.35s ease;
  pointer-events: none;
}

.text-block.active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.text-block.left-align {
  left: 8%;
  text-align: left;
}

.text-block.right-align {
  right: 8%;
  text-align: right;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(165, 180, 252, 0.4);
  font-size: 0.75rem;
  font-weight: 700;
  color: #a5b4fc;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.index {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #818cf8;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #ffffff 40%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

h2 {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-bottom: 10px;
}

p {
  color: #a1a1aa;
  font-size: clamp(0.95rem, 1.8vw, 1.15rem);
  line-height: 1.6;
}

.metric {
  margin-top: 16px;
  display: inline-block;
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.85rem;
  font-weight: 600;
  color: #e4e4e7;
}

.cta-row {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn.primary {
  background: #ffffff;
  color: #0b0b0d;
}

.btn.primary:hover {
  background: #f4f4f5;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

#hint {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.85rem;
  color: #ffffff;
  pointer-events: none;
  transition: opacity 0.4s ease;
  animation: bounce 1.8s infinite;
}

#hint.hide {
  opacity: 0;
}

@keyframes bounce {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, 6px); }
}
`;

  const appJs = `// Configuration generated by Scroll Video Maker
const CONFIG = {
  count: ${config.count},
  prefix: "${config.prefix}",
  pad: ${config.pad},
  ext: "${config.ext}",
  fit: "${config.fit}",
  ease: ${config.ease},
  screens: ${config.screens}
};

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
const progressBar = document.getElementById("progress");
const scrollArea = document.getElementById("scroll-area");
const hint = document.getElementById("hint");

const blocks = [
  { el: document.getElementById("block-1"), start: 0.00, end: 0.22 },
  { el: document.getElementById("block-2"), start: 0.26, end: 0.48 },
  { el: document.getElementById("block-3"), start: 0.52, end: 0.74 },
  { el: document.getElementById("block-4"), start: 0.78, end: 1.00 }
];

const frames = new Array(CONFIG.count).fill(null);
let currentFrame = 0;
let targetFrame = 0;
let lastRenderedImg = null;
let cw = 0, ch = 0;

function frameUrl(i) {
  const numStr = String(i + 1).padStart(CONFIG.pad, "0");
  return \`frames/\${CONFIG.prefix}\${numStr}.\${CONFIG.ext}\`;
}

function loadFrame(i) {
  return new Promise((resolve) => {
    if (frames[i]) return resolve();
    const img = new Image();
    img.src = frameUrl(i);
    img.onload = () => { frames[i] = img; resolve(); };
    img.onerror = () => resolve();
  });
}

async function preloadFrames() {
  // Pass 1: Coarse load for instant interactivity
  const stride = Math.max(1, Math.round(CONFIG.count / 30));
  for (let i = 0; i < CONFIG.count; i += stride) {
    await loadFrame(i);
  }
  if (frames[0]) {
    resize();
    paint(frames[0]);
  }
  // Pass 2: Load remaining frames in background
  for (let i = 0; i < CONFIG.count; i++) {
    if (!frames[i]) loadFrame(i);
  }
}

function nearestLoaded(idx) {
  const clamped = Math.max(0, Math.min(CONFIG.count - 1, idx));
  for (let d = 0; d < CONFIG.count; d++) {
    if (frames[clamped - d]) return frames[clamped - d];
    if (frames[clamped + d]) return frames[clamped + d];
  }
  return null;
}

function paint(img) {
  const s = CONFIG.fit === "cover"
    ? Math.max(cw / img.width, ch / img.height)
    : Math.min(cw / img.width, ch / img.height);
  const w = img.width * s;
  const h = img.height * s;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cw = canvas.width = Math.round(canvas.clientWidth * dpr);
  ch = canvas.height = Math.round(canvas.clientHeight * dpr);
  lastRenderedImg = null;
  onScroll();
}

function onScroll() {
  const total = scrollArea.offsetHeight - window.innerHeight;
  if (total <= 0) return;
  const p = Math.min(1, Math.max(0, window.scrollY / total));
  targetFrame = p * (CONFIG.count - 1);
  progressBar.style.width = (p * 100) + "%";

  if (window.scrollY > 40) hint.classList.add("hide");

  // Animate overlay text blocks
  blocks.forEach(b => {
    if (b.el) {
      if (p >= b.start && p <= b.end) {
        b.el.classList.add("active");
      } else {
        b.el.classList.remove("active");
      }
    }
  });
}

let lastT = performance.now();
function tick(t) {
  const dt = Math.min(0.1, (t - lastT) / 1000);
  lastT = t;
  const k = 1 - Math.pow(1 - CONFIG.ease, dt * 60);

  currentFrame += (targetFrame - currentFrame) * k;
  if (Math.abs(targetFrame - currentFrame) < 0.005) {
    currentFrame = targetFrame;
  }

  const img = nearestLoaded(Math.round(currentFrame));
  if (img && img !== lastRenderedImg) {
    paint(img);
    lastRenderedImg = img;
  }

  requestAnimationFrame(tick);
}

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", resize);
requestAnimationFrame(tick);
preloadFrames();
`;

  const packageJson = `{
  "name": "${projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}",
  "version": "1.0.0",
  "description": "Interactive Scroll Video Landing Page",
  "scripts": {
    "start": "npx serve ."
  },
  "devDependencies": {
    "serve": "^14.2.4"
  }
}
`;

  const readmeMd = `# ${projectName} - Scroll Video Animation Website

A standalone, high-performance scroll-driven video animation website.

## 📁 Folder Structure
\`\`\`
${projectName}/
├── frames/              # Frame image sequence (${config.count} frames)
├── index.html           # Main website markup & text triggers
├── style.css            # Responsive styles & glassmorphism overlays
├── app.js               # Canvas scroll controller with delta-time easing
├── package.json         # Optional script to run local server
├── requirements.txt     # Python simple server command
├── INTEGRATION_PROMPT.md # Prompt to integrate into existing websites with AI
└── README.md
\`\`\`

## 🚀 How to Run Locally

### Option 1: Open Directly in Browser
Double-click \`index.html\` to open it in Chrome, Edge, Safari, or Firefox.

### Option 2: Using Node.js
\`\`\`bash
npx serve .
\`\`\`

### Option 3: Using Python
\`\`\`bash
python -m http.server 8000
\`\`\`
Then visit [http://localhost:8000](http://localhost:8000).

## 🤖 Integrate Into Your Website With AI
Check out \`INTEGRATION_PROMPT.md\` in this folder. You can copy-paste that prompt into Claude, Antigravity, Cursor, or ChatGPT to seamlessly integrate this animation section into any existing website.
`;

  const requirementsTxt = `# Python server command:
# python -m http.server 8000
`;

  return [
    { path: "index.html", content: indexHtml },
    { path: "style.css", content: styleCss },
    { path: "app.js", content: appJs },
    { path: "package.json", content: packageJson },
    { path: "requirements.txt", content: requirementsTxt },
    { path: "README.md", content: readmeMd },
    { path: "INTEGRATION_PROMPT.md", content: generateIntegrationPrompt(projectName, config) },
  ];
}

export function generateReactTemplate(
  projectName: string,
  config: PreviewConfig
): GeneratedFile[] {
  const packageJson = `{
  "name": "${projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
`;

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;

  const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} - React Scroll Video</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

  const mainJsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  const indexCss = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #0b0b0d;
  color: #f4f4f5;
  font-family: system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}
`;

  const appJsx = `import React, { useEffect, useRef, useState } from 'react';

const CONFIG = {
  count: ${config.count},
  prefix: "${config.prefix}",
  pad: ${config.pad},
  ext: "${config.ext}",
  fit: "${config.fit}",
  ease: ${config.ease},
  screens: ${config.screens}
};

export default function App() {
  const canvasRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const frames = new Array(CONFIG.count).fill(null);
    let target = 0;
    let current = 0;
    let lastImg = null;
    let cw = 0, ch = 0;

    const getUrl = (i) => {
      const num = String(i + 1).padStart(CONFIG.pad, '0');
      return \`/frames/\${CONFIG.prefix}\${num}.\${CONFIG.ext}\`;
    };

    const loadFrame = (i) => {
      return new Promise((resolve) => {
        if (frames[i]) return resolve();
        const img = new Image();
        img.src = getUrl(i);
        img.onload = () => { frames[i] = img; resolve(); };
        img.onerror = () => resolve();
      });
    };

    const preload = async () => {
      const stride = Math.max(1, Math.round(CONFIG.count / 30));
      for (let i = 0; i < CONFIG.count; i += stride) {
        await loadFrame(i);
      }
      if (frames[0]) {
        resize();
        paint(frames[0]);
      }
      for (let i = 0; i < CONFIG.count; i++) {
        if (!frames[i]) loadFrame(i);
      }
    };

    const nearestLoaded = (idx) => {
      const clamped = Math.max(0, Math.min(CONFIG.count - 1, idx));
      for (let d = 0; d < CONFIG.count; d++) {
        if (frames[clamped - d]) return frames[clamped - d];
        if (frames[clamped + d]) return frames[clamped + d];
      }
      return null;
    };

    const paint = (img) => {
      const s = CONFIG.fit === 'cover'
        ? Math.max(cw / img.width, ch / img.height)
        : Math.min(cw / img.width, ch / img.height);
      const w = img.width * s;
      const h = img.height * s;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = canvas.width = Math.round(canvas.clientWidth * dpr);
      ch = canvas.height = Math.round(canvas.clientHeight * dpr);
      lastImg = null;
      handleScroll();
    };

    const handleScroll = () => {
      if (!scrollAreaRef.current) return;
      const total = scrollAreaRef.current.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, window.scrollY / total));
      target = p * (CONFIG.count - 1);
      setScrollPct(p);
    };

    let lastT = performance.now();
    let animId = 0;

    const tick = (t) => {
      const dt = Math.min(0.1, (t - lastT) / 1000);
      lastT = t;
      const k = 1 - Math.pow(1 - CONFIG.ease, dt * 60);

      current += (target - current) * k;
      if (Math.abs(target - current) < 0.005) {
        current = target;
      }

      const img = nearestLoaded(Math.round(current));
      if (img && img !== lastImg) {
        paint(img);
        lastImg = img;
      }

      animId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(tick);
    preload();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ background: '#0b0b0d', color: '#fff', minHeight: '100vh' }}>
      {/* Top progress bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: \`\${scrollPct * 100}%\`,
        background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899)',
        zIndex: 50
      }} />

      {/* Main scroll timeline */}
      <div ref={scrollAreaRef} style={{ height: \`\${(CONFIG.screens + 1) * 100}vh\`, position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

          {/* Overlay Text Blocks */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'grid',
            placeItems: 'center',
            padding: '24px'
          }}>
            {/* Block 1 */}
            <div style={{
              position: 'absolute',
              textAlign: 'center',
              opacity: scrollPct >= 0 && scrollPct <= 0.22 ? 1 : 0,
              transform: scrollPct >= 0 && scrollPct <= 0.22 ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.35s ease',
              maxWidth: '620px'
            }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(165,180,252,0.4)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#a5b4fc',
                marginBottom: '12px'
              }}>INTERACTIVE REACT ENGINE</span>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '12px' }}>
                Redefining Digital Experience
              </h1>
              <p style={{ color: '#a1a1aa', fontSize: '1.1rem' }}>
                Scroll down to explore every frame of the journey.
              </p>
            </div>

            {/* Block 2 */}
            <div style={{
              position: 'absolute',
              left: '8%',
              maxWidth: '480px',
              textAlign: 'left',
              opacity: scrollPct >= 0.26 && scrollPct <= 0.48 ? 1 : 0,
              transform: scrollPct >= 0.26 && scrollPct <= 0.48 ? 'translateX(0)' : 'translateX(-30px)',
              transition: 'all 0.35s ease'
            }}>
              <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem' }}>01 / ARCHITECTURE</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 700, margin: '8px 0' }}>Engineered for Smoothness</h2>
              <p style={{ color: '#a1a1aa' }}>Hardware accelerated rendering synchronized down to the millisecond.</p>
            </div>

            {/* Block 3 */}
            <div style={{
              position: 'absolute',
              right: '8%',
              maxWidth: '480px',
              textAlign: 'right',
              opacity: scrollPct >= 0.52 && scrollPct <= 0.74 ? 1 : 0,
              transform: scrollPct >= 0.52 && scrollPct <= 0.74 ? 'translateX(0)' : 'translateX(30px)',
              transition: 'all 0.35s ease'
            }}>
              <span style={{ color: '#c084fc', fontWeight: 700, fontSize: '0.85rem' }}>02 / PERFORMANCE</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 700, margin: '8px 0' }}>Pixel-Perfect at Scale</h2>
              <p style={{ color: '#a1a1aa' }}>Responsive rasterization ensures clarity across all viewports.</p>
            </div>

            {/* Block 4 */}
            <div style={{
              position: 'absolute',
              textAlign: 'center',
              opacity: scrollPct >= 0.78 && scrollPct <= 1 ? 1 : 0,
              transform: scrollPct >= 0.78 && scrollPct <= 1 ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.35s ease',
              maxWidth: '620px'
            }}>
              <h2 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '12px' }}>
                Ready to Build Something Extraordinary?
              </h2>
              <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>
                Transform static media into living, breathing web experiences.
              </p>
              <button style={{
                padding: '14px 28px',
                borderRadius: '12px',
                background: '#fff',
                color: '#000',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}>Get Started Now →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

  const readmeMd = `# ${projectName} - React Scroll Video Project

Built with Vite + React.

## 🚀 How to Run Locally

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 How to Build for Production
\`\`\`bash
npm run build
\`\`\`

## 🤖 Integrate Into Existing Projects with AI
See \`INTEGRATION_PROMPT.md\` to easily integrate this scroll component into your existing React or Next.js app.
`;

  const requirementsTxt = `# Requirements
Node.js 18+
npm install
`;

  return [
    { path: "package.json", content: packageJson },
    { path: "vite.config.js", content: viteConfig },
    { path: "index.html", content: indexHtml },
    { path: "src/main.jsx", content: mainJsx },
    { path: "src/index.css", content: indexCss },
    { path: "src/App.jsx", content: appJsx },
    { path: "README.md", content: readmeMd },
    { path: "requirements.txt", content: requirementsTxt },
    { path: "INTEGRATION_PROMPT.md", content: generateIntegrationPrompt(projectName, config) },
  ];
}

export function generateNodeNextTemplate(
  projectName: string,
  config: PreviewConfig
): GeneratedFile[] {
  const packageJson = `{
  "name": "${projectName.toLowerCase().replace(/[^a-z0-9_-]/g, "-")}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.1.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
`;

  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`;

  const layoutJsx = `import './globals.css';

export const metadata = {
  title: '${projectName} - Next.js Scroll Video',
  description: 'Interactive scroll-driven animation website',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

  const globalsCss = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #0b0b0d;
  color: #f4f4f5;
  font-family: system-ui, -apple-system, sans-serif;
  overflow-x: hidden;
}
`;

  const pageJsx = `"use client";

import React, { useEffect, useRef, useState } from 'react';

const CONFIG = {
  count: ${config.count},
  prefix: "${config.prefix}",
  pad: ${config.pad},
  ext: "${config.ext}",
  fit: "${config.fit}",
  ease: ${config.ease},
  screens: ${config.screens}
};

export default function HomePage() {
  const canvasRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const frames = new Array(CONFIG.count).fill(null);
    let target = 0;
    let current = 0;
    let lastImg = null;
    let cw = 0, ch = 0;

    const getUrl = (i) => {
      const num = String(i + 1).padStart(CONFIG.pad, '0');
      return \`/frames/\${CONFIG.prefix}\${num}.\${CONFIG.ext}\`;
    };

    const loadFrame = (i) => {
      return new Promise((resolve) => {
        if (frames[i]) return resolve();
        const img = new Image();
        img.src = getUrl(i);
        img.onload = () => { frames[i] = img; resolve(); };
        img.onerror = () => resolve();
      });
    };

    const preload = async () => {
      const stride = Math.max(1, Math.round(CONFIG.count / 30));
      for (let i = 0; i < CONFIG.count; i += stride) {
        await loadFrame(i);
      }
      if (frames[0]) {
        resize();
        paint(frames[0]);
      }
      for (let i = 0; i < CONFIG.count; i++) {
        if (!frames[i]) loadFrame(i);
      }
    };

    const nearestLoaded = (idx) => {
      const clamped = Math.max(0, Math.min(CONFIG.count - 1, idx));
      for (let d = 0; d < CONFIG.count; d++) {
        if (frames[clamped - d]) return frames[clamped - d];
        if (frames[clamped + d]) return frames[clamped + d];
      }
      return null;
    };

    const paint = (img) => {
      const s = CONFIG.fit === 'cover'
        ? Math.max(cw / img.width, ch / img.height)
        : Math.min(cw / img.width, ch / img.height);
      const w = img.width * s;
      const h = img.height * s;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = canvas.width = Math.round(canvas.clientWidth * dpr);
      ch = canvas.height = Math.round(canvas.clientHeight * dpr);
      lastImg = null;
      handleScroll();
    };

    const handleScroll = () => {
      if (!scrollAreaRef.current) return;
      const total = scrollAreaRef.current.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, window.scrollY / total));
      target = p * (CONFIG.count - 1);
      setScrollPct(p);
    };

    let lastT = performance.now();
    let animId = 0;

    const tick = (t) => {
      const dt = Math.min(0.1, (t - lastT) / 1000);
      lastT = t;
      const k = 1 - Math.pow(1 - CONFIG.ease, dt * 60);

      current += (target - current) * k;
      if (Math.abs(target - current) < 0.005) {
        current = target;
      }

      const img = nearestLoaded(Math.round(current));
      if (img && img !== lastImg) {
        paint(img);
        lastImg = img;
      }

      animId = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', resize);
    animId = requestAnimationFrame(tick);
    preload();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ background: '#0b0b0d', color: '#fff', minHeight: '100vh' }}>
      {/* Top progress bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '3px',
        width: \`\${scrollPct * 100}%\`,
        background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899)',
        zIndex: 50
      }} />

      {/* Main scroll timeline */}
      <div ref={scrollAreaRef} style={{ height: \`\${(CONFIG.screens + 1) * 100}vh\`, position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

          {/* Overlay Text Blocks */}
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'grid',
            placeItems: 'center',
            padding: '24px'
          }}>
            {/* Block 1 */}
            <div style={{
              position: 'absolute',
              textAlign: 'center',
              opacity: scrollPct >= 0 && scrollPct <= 0.22 ? 1 : 0,
              transform: scrollPct >= 0 && scrollPct <= 0.22 ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.35s ease',
              maxWidth: '620px'
            }}>
              <span style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(165,180,252,0.4)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#a5b4fc',
                marginBottom: '12px'
              }}>NEXT.JS FULLSTACK ENGINE</span>
              <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '12px' }}>
                Redefining Digital Experience
              </h1>
              <p style={{ color: '#a1a1aa', fontSize: '1.1rem' }}>
                Scroll down to explore every frame of the journey.
              </p>
            </div>

            {/* Block 2 */}
            <div style={{
              position: 'absolute',
              left: '8%',
              maxWidth: '480px',
              textAlign: 'left',
              opacity: scrollPct >= 0.26 && scrollPct <= 0.48 ? 1 : 0,
              transform: scrollPct >= 0.26 && scrollPct <= 0.48 ? 'translateX(0)' : 'translateX(-30px)',
              transition: 'all 0.35s ease'
            }}>
              <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem' }}>01 / ARCHITECTURE</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 700, margin: '8px 0' }}>Engineered for Smoothness</h2>
              <p style={{ color: '#a1a1aa' }}>Hardware accelerated rendering synchronized down to the millisecond.</p>
            </div>

            {/* Block 3 */}
            <div style={{
              position: 'absolute',
              right: '8%',
              maxWidth: '480px',
              textAlign: 'right',
              opacity: scrollPct >= 0.52 && scrollPct <= 0.74 ? 1 : 0,
              transform: scrollPct >= 0.52 && scrollPct <= 0.74 ? 'translateX(0)' : 'translateX(30px)',
              transition: 'all 0.35s ease'
            }}>
              <span style={{ color: '#c084fc', fontWeight: 700, fontSize: '0.85rem' }}>02 / PERFORMANCE</span>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 700, margin: '8px 0' }}>Pixel-Perfect at Scale</h2>
              <p style={{ color: '#a1a1aa' }}>Responsive rasterization ensures clarity across all viewports.</p>
            </div>

            {/* Block 4 */}
            <div style={{
              position: 'absolute',
              textAlign: 'center',
              opacity: scrollPct >= 0.78 && scrollPct <= 1 ? 1 : 0,
              transform: scrollPct >= 0.78 && scrollPct <= 1 ? 'scale(1)' : 'scale(0.95)',
              transition: 'all 0.35s ease',
              maxWidth: '620px'
            }}>
              <h2 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '12px' }}>
                Ready to Build Something Extraordinary?
              </h2>
              <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>
                Transform static media into living, breathing web experiences.
              </p>
              <button style={{
                padding: '14px 28px',
                borderRadius: '12px',
                background: '#fff',
                color: '#000',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}>Deploy to Vercel Now →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

  const readmeMd = `# ${projectName} - Next.js Scroll Video Project

Built with Next.js 15 & React 19.

## 🚀 How to Run Locally

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deploy to Vercel
Push this repository to GitHub and import it on [vercel.com](https://vercel.com). Vercel deploys Next.js automatically with zero configuration.

## 🤖 Integrate Into Existing Projects with AI
See \`INTEGRATION_PROMPT.md\` in this folder.
`;

  const requirementsTxt = `# Requirements
Node.js 18.18+ or 20+
npm install
`;

  return [
    { path: "package.json", content: packageJson },
    { path: "next.config.js", content: nextConfig },
    { path: "app/layout.jsx", content: layoutJsx },
    { path: "app/globals.css", content: globalsCss },
    { path: "app/page.jsx", content: pageJsx },
    { path: "README.md", content: readmeMd },
    { path: "requirements.txt", content: requirementsTxt },
    { path: "INTEGRATION_PROMPT.md", content: generateIntegrationPrompt(projectName, config) },
  ];
}

