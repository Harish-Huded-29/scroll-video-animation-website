"use client";

import React, { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { FrameData, PreviewConfig } from "@/lib/types";
import { convertFrameToBlob } from "@/lib/videoExtractor";
import {
  FrameworkType,
  GeneratedFile,
  generateHtmlTemplate,
  generateReactTemplate,
  generateNodeNextTemplate,
} from "@/lib/websiteTemplates";

interface ViewerProps {
  config: PreviewConfig;
  onEdit: () => void;
  onNew: () => void;
}

interface ModalButton {
  label: string;
  primary?: boolean;
  onClick: () => void;
}

interface ModalState {
  show: boolean;
  kind: "ok" | "bad" | "busy";
  title: string;
  text?: string;
  path?: string;
  filesList?: string[];
  progress?: boolean;
  progressPct?: number;
  buttons?: ModalButton[];
  locked?: boolean;
}

// Helper to write a file at any relative nested path inside a FileSystemDirectoryHandle
async function writeFileToDirHandle(
  rootDir: FileSystemDirectoryHandle,
  relativePath: string,
  content: string | Blob
): Promise<void> {
  const parts = relativePath.split("/");
  let currentDir = rootDir;
  for (let i = 0; i < parts.length - 1; i++) {
    currentDir = await currentDir.getDirectoryHandle(parts[i], { create: true });
  }
  const fileName = parts[parts.length - 1];
  const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

export function ScrollVideoViewer({ config, onEdit, onNew }: ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const areaRef = useRef<HTMLDivElement | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Download options modal state
  const [showDlModal, setShowDlModal] = useState(false);
  const [downloadType, setDownloadType] = useState<"frames_only" | "frames_and_website">("frames_and_website");
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>("html");
  const [projectName, setProjectName] = useState("scroll-video-project");

  // Toast state
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal state
  const [modal, setModal] = useState<ModalState>({
    show: false,
    kind: "busy",
    title: "",
  });

  const showToast = (msg: string, ms = 3200) => {
    setToastMsg(msg);
    setToastOn(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (ms > 0) {
      toastTimerRef.current = setTimeout(() => setToastOn(false), ms);
    }
  };

  const closeModal = () => {
    if (modal.locked) return;
    setModal((prev) => ({ ...prev, show: false }));
  };

  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const lastIndexRef = useRef(-1);
  const animFrameId = useRef(0);

  // Fullscreen event listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  // High performance Canvas render loop using ImageBitmaps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let cw = 0;
    let ch = 0;

    const paint = (frame: FrameData) => {
      const source = frame.bitmap;
      if (!source) return;
      const s =
        config.fit === "cover"
          ? Math.max(cw / source.width, ch / source.height)
          : Math.min(cw / source.width, ch / source.height);
      const w = source.width * s;
      const h = source.height * s;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(source, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === cw && h === ch) return;
      cw = canvas.width = w;
      ch = canvas.height = h;
      lastIndexRef.current = -1;
      handleScroll();
    };

    const handleScroll = () => {
      if (!areaRef.current) return;
      const total = areaRef.current.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(1, Math.max(0, window.scrollY / total));
      targetFrameRef.current = p * (config.count - 1);
      setScrollProgress(p * 100);
      if (window.scrollY > 40) {
        setShowHint(false);
      }
    };

    let lastT = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(0.1, (t - lastT) / 1000);
      lastT = t;
      const k = 1 - Math.pow(1 - config.ease, dt * 60);

      currentFrameRef.current += (targetFrameRef.current - currentFrameRef.current) * k;
      if (Math.abs(targetFrameRef.current - currentFrameRef.current) < 0.005) {
        currentFrameRef.current = targetFrameRef.current;
      }

      const idx = Math.max(0, Math.min(config.count - 1, Math.round(currentFrameRef.current)));
      if (idx !== lastIndexRef.current && config.frames[idx]) {
        paint(config.frames[idx]);
        lastIndexRef.current = idx;
      }

      animFrameId.current = requestAnimationFrame(tick);
    };

    resize();
    handleScroll();
    currentFrameRef.current = targetFrameRef.current;
    if (config.frames[0]) {
      paint(config.frames[0]);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", resize);
    animFrameId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameId.current);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", resize);
    };
  }, [config]);

  // Helper to get or encode blobs for downloading
  const ensureBlobs = async (
    onStep: (done: number, total: number) => void
  ): Promise<void> => {
    const mimeType =
      config.ext === "png"
        ? "image/png"
        : config.ext === "jpg"
        ? "image/jpeg"
        : "image/webp";
    const quality =
      config.ext === "png"
        ? 1.0
        : Math.max(0.4, (config.options?.compression || 82) / 100);

    const helperCanvas = document.createElement("canvas");
    helperCanvas.width = config.width;
    helperCanvas.height = config.height;

    for (let i = 0; i < config.frames.length; i++) {
      const f = config.frames[i];
      if (!f.blob) {
        await convertFrameToBlob(
          f,
          config.width,
          config.height,
          mimeType,
          quality,
          helperCanvas
        );
      }
      onStep(i + 1, config.frames.length);
      if (i % 8 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }
  };

  const getSanitizedProjectName = (): string => {
    const clean = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, "-");
    return clean || "scroll-video-project";
  };

  // 1. Modern browser File System Access API (Save to Folder directly)
  const handleExportToFolder = async () => {
    const sanitizedName = getSanitizedProjectName();
    const picker = (
      window as unknown as {
        showDirectoryPicker?: (options: { mode: string }) => Promise<FileSystemDirectoryHandle>;
      }
    ).showDirectoryPicker;

    if (!picker) {
      showToast("Direct folder saving is not supported in this browser. Downloading as ZIP archive.");
      handleExportToZip();
      return;
    }

    try {
      const parentHandle = await picker({ mode: "readwrite" });
      if (!parentHandle) return;

      setShowDlModal(false);

      setModal({
        show: true,
        kind: "busy",
        title: "Saving project to folder…",
        text: `Creating directory "${parentHandle.name}/${sanitizedName}"…`,
        progress: true,
        progressPct: 0,
        locked: true,
      });

      // Encode any uncached frame blobs
      await ensureBlobs((done, total) => {
        const pct = Math.round((done / total) * 45);
        setModal((prev) => ({
          ...prev,
          progressPct: pct,
          text: `Encoding frames… ${done} / ${total}`,
        }));
      });

      // Create project root folder
      const projectDir = await parentHandle.getDirectoryHandle(sanitizedName, { create: true });

      // Create "frames" folder inside project folder
      const framesDir = await projectDir.getDirectoryHandle("frames", { create: true });

      for (let i = 0; i < config.frames.length; i++) {
        const frame = config.frames[i];
        if (frame.blob) {
          const fileHandle = await framesDir.getFileHandle(frame.name, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(frame.blob);
          await writable.close();
        }
        const pct = 45 + Math.round(((i + 1) / config.count) * 45);
        setModal((prev) => ({
          ...prev,
          progressPct: pct,
          text: `Writing frames… ${i + 1} / ${config.count}`,
        }));
      }

      // Generate website files if requested
      if (downloadType === "frames_and_website") {
        setModal((prev) => ({
          ...prev,
          progressPct: 94,
          text: "Writing website template files…",
        }));

        let templateFiles: GeneratedFile[] = [];
        if (selectedFramework === "html") {
          templateFiles = generateHtmlTemplate(sanitizedName, config);
        } else if (selectedFramework === "react") {
          templateFiles = generateReactTemplate(sanitizedName, config);
        } else {
          templateFiles = generateNodeNextTemplate(sanitizedName, config);
        }

        for (const file of templateFiles) {
          await writeFileToDirHandle(projectDir, file.path, file.content);
        }
      }

      const frameworkLabel =
        selectedFramework === "html"
          ? "HTML / Vanilla JS"
          : selectedFramework === "react"
          ? "React (Vite)"
          : "Next.js / Node.js";

      // Report downloaded files and show path only (no secondary zip buttons)
      setModal({
        show: true,
        kind: "ok",
        title: "All Files Downloaded!",
        text:
          downloadType === "frames_and_website"
            ? `Successfully created ${frameworkLabel} project with all ${config.count} frames.`
            : `Successfully saved all ${config.count} frames to your folder.`,
        path: `${parentHandle.name}/${sanitizedName}/`,
        filesList: [
          `${config.count} image frames in "${sanitizedName}/frames/"`,
          ...(downloadType === "frames_and_website"
            ? [
                `Working ${frameworkLabel} code and components`,
                "package.json & requirements.txt",
                "README.md with run & setup guide",
                "INTEGRATION_PROMPT.md for AI assistants",
              ]
            : []),
        ],
        buttons: [{ label: "Close", primary: true, onClick: closeModal }],
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        showToast("Folder selection cancelled.");
        return;
      }
      const errorMsg = err instanceof Error ? err.message : "Failed to write files to disk.";
      setModal({
        show: true,
        kind: "bad",
        title: "Export Error",
        text: errorMsg,
        buttons: [{ label: "Close", onClick: closeModal }],
      });
    }
  };

  // 2. Download ZIP Archive
  const handleExportToZip = async () => {
    const sanitizedName = getSanitizedProjectName();
    try {
      setShowDlModal(false);

      setModal({
        show: true,
        kind: "busy",
        title: "Preparing Project ZIP…",
        text: `Compressing ${config.count} frames (${config.mb || 0} MB)…`,
        progress: true,
        progressPct: 0,
        locked: true,
      });

      await ensureBlobs((done, total) => {
        const pct = Math.round((done / total) * 50);
        setModal((prev) => ({
          ...prev,
          progressPct: pct,
          text: `Encoding frames… ${done} / ${total}`,
        }));
      });

      const zip = new JSZip();
      const projectFolder = zip.folder(sanitizedName);
      const framesFolder = projectFolder?.folder("frames");

      for (let i = 0; i < config.frames.length; i++) {
        const frame = config.frames[i];
        if (frame.blob) {
          framesFolder?.file(frame.name, frame.blob);
        }
      }

      if (downloadType === "frames_and_website") {
        let templateFiles: GeneratedFile[] = [];
        if (selectedFramework === "html") {
          templateFiles = generateHtmlTemplate(sanitizedName, config);
        } else if (selectedFramework === "react") {
          templateFiles = generateReactTemplate(sanitizedName, config);
        } else {
          templateFiles = generateNodeNextTemplate(sanitizedName, config);
        }

        for (const file of templateFiles) {
          projectFolder?.file(file.path, file.content);
        }
      }

      setModal((prev) => ({
        ...prev,
        progressPct: 70,
        text: "Building ZIP archive…",
      }));

      const zipBlob = await zip.generateAsync(
        { type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } },
        (meta) => {
          const pct = 70 + Math.round(meta.percent * 0.3);
          setModal((prev) => ({
            ...prev,
            progressPct: pct,
            text: `Packaging archive… ${Math.round(meta.percent)}%`,
          }));
        }
      );

      const downloadUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${sanitizedName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      const frameworkLabel =
        selectedFramework === "html"
          ? "HTML / Vanilla JS"
          : selectedFramework === "react"
          ? "React (Vite)"
          : "Next.js / Node.js";

      // Report downloaded files and show path only (no secondary zip buttons)
      setModal({
        show: true,
        kind: "ok",
        title: "All Files Downloaded!",
        text: `Successfully downloaded "${sanitizedName}.zip" to your computer.`,
        path: `Downloads / ${sanitizedName}.zip`,
        filesList: [
          `${config.count} image frames in "${sanitizedName}/frames/"`,
          ...(downloadType === "frames_and_website"
            ? [
                `Working ${frameworkLabel} code and components`,
                "package.json & requirements.txt",
                "README.md with run & setup guide",
                "INTEGRATION_PROMPT.md for AI assistants",
              ]
            : []),
        ],
        buttons: [{ label: "Close", primary: true, onClick: closeModal }],
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to generate ZIP archive.";
      setModal({
        show: true,
        kind: "bad",
        title: "ZIP Generation Error",
        text: errorMsg,
        buttons: [{ label: "Close", onClick: closeModal }],
      });
    }
  };

  return (
    <div className="viewer-root">
      {/* Top progress bar */}
      <div id="progress" style={{ width: `${scrollProgress}%` }}></div>

      {/* Top navigation actions */}
      <div className="top-nav">
        <button
          className="glass"
          id="fsBtn"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen mode (Esc to exit)"
        >
          {isFullscreen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M14 4v6m0 0h6m-6 0L21 3M10 4v6m0 0H4m6 0L3 3" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
          <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
        </button>

        <button
          className="glass"
          onClick={onEdit}
          title="Edit scroll settings or change configuration"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit video
        </button>

        <button
          className="glass"
          id="dl"
          onClick={() => setShowDlModal(true)}
          title="Download frames or full website template"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4v11m0 0l-4-4m4 4l4-4" />
            <path d="M4 19h16" />
          </svg>
          Download / Export <small>({config.count} frames)</small>
        </button>
      </div>

      {/* Floating Create New button */}
      <button
        className="glass"
        id="new"
        onClick={onNew}
        title="Make another scroll video"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Create new
      </button>

      {/* Hint */}
      <div id="hint" className={!showHint ? "hide" : ""}>
        Scroll ↓
      </div>

      {/* Toast */}
      <div id="toast" className={toastOn ? "on" : ""}>
        {toastMsg}
      </div>

      {/* Scroll Area and Sticky Stage Canvas */}
      <div
        id="area"
        ref={areaRef}
        style={{ height: `${(config.screens + 1) * 100}vh` }}
      >
        <div id="stage">
          <canvas ref={canvasRef} className="viewer-canvas"></canvas>
        </div>
      </div>

      {/* Download / Export Options Dialog Modal */}
      {showDlModal && (
        <div
          className="prompt-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDlModal(false);
          }}
        >
          <div className="dl-modal-card">
            <div className="dl-modal-header">
              <div>
                <h3 className="dl-modal-title">Export &amp; Download</h3>
                <p className="dl-modal-sub">
                  Choose between exporting the raw frame sequence or a fully working website template.
                </p>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setShowDlModal(false)}
                title="Close dialog"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* 1. Choose Download Package */}
            <div className="dl-section-label">1. Choose Package</div>
            <div className="dl-type-grid">
              <div
                className={`dl-type-card ${downloadType === "frames_and_website" ? "active" : ""}`}
                onClick={() => setDownloadType("frames_and_website")}
              >
                <div className="dl-type-title">
                  <span>🌐</span> Frames + Website Project
                </div>
                <div className="dl-type-desc">
                  Includes all {config.count} frames + complete website code, components, package.json, README &amp; AI prompt.
                </div>
              </div>

              <div
                className={`dl-type-card ${downloadType === "frames_only" ? "active" : ""}`}
                onClick={() => setDownloadType("frames_only")}
              >
                <div className="dl-type-title">
                  <span>🎞️</span> Only Frames
                </div>
                <div className="dl-type-desc">
                  Extracts only the image sequence ({config.count} frames) into an organized frames/ directory.
                </div>
              </div>
            </div>

            {/* 2. Select Website Template (if frames_and_website) */}
            {downloadType === "frames_and_website" && (
              <>
                <div className="dl-section-label">2. Select Website Template</div>
                <div className="framework-grid">
                  <div
                    className={`framework-card ${selectedFramework === "html" ? "active" : ""}`}
                    onClick={() => setSelectedFramework("html")}
                  >
                    <div className="framework-icon">⚡</div>
                    <div className="framework-name">HTML / JS</div>
                    <div className="framework-tag">Vanilla · Zero config</div>
                  </div>

                  <div
                    className={`framework-card ${selectedFramework === "react" ? "active" : ""}`}
                    onClick={() => setSelectedFramework("react")}
                  >
                    <div className="framework-icon">⚛️</div>
                    <div className="framework-name">React + Vite</div>
                    <div className="framework-tag">React 19 · Fast HMR</div>
                  </div>

                  <div
                    className={`framework-card ${selectedFramework === "node" ? "active" : ""}`}
                    onClick={() => setSelectedFramework("node")}
                  >
                    <div className="framework-icon">▲</div>
                    <div className="framework-name">Next.js / Node</div>
                    <div className="framework-tag">App Router · Vercel ready</div>
                  </div>
                </div>
              </>
            )}

            {/* 3. Project Name */}
            <div className="dl-input-group">
              <label htmlFor="projName">
                {downloadType === "frames_and_website" ? "Project Folder Name" : "Folder Name"}
              </label>
              <input
                id="projName"
                type="text"
                className="dl-text-input"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, "-"))}
                placeholder="scroll-video-project"
              />
            </div>

            {/* Folder Structure Preview Box */}
            <div className="folder-tree-box">
              {downloadType === "frames_and_website" ? (
                <div>
                  <b>📁 {projectName || "scroll-video-project"}/</b><br />
                  &nbsp;&nbsp;├── 📁 <b>frames/</b> <i>({config.count} images: frame_0001.{config.ext}…)</i><br />
                  {selectedFramework === "html" && (
                    <>
                      &nbsp;&nbsp;├── 📄 index.html<br />
                      &nbsp;&nbsp;├── 🎨 style.css<br />
                      &nbsp;&nbsp;├── ⚙️ app.js<br />
                    </>
                  )}
                  {selectedFramework === "react" && (
                    <>
                      &nbsp;&nbsp;├── 📁 <b>src/</b> <i>(App.jsx, main.jsx, index.css)</i><br />
                      &nbsp;&nbsp;├── 📄 index.html &amp; vite.config.js<br />
                    </>
                  )}
                  {selectedFramework === "node" && (
                    <>
                      &nbsp;&nbsp;├── 📁 <b>app/</b> <i>(page.jsx, layout.jsx, globals.css)</i><br />
                      &nbsp;&nbsp;├── ⚙️ next.config.js<br />
                    </>
                  )}
                  &nbsp;&nbsp;├── 📦 package.json<br />
                  &nbsp;&nbsp;├── 📋 requirements.txt<br />
                  &nbsp;&nbsp;├── 📖 README.md <i>(setup &amp; run guide)</i><br />
                  &nbsp;&nbsp;└── 🤖 INTEGRATION_PROMPT.md <i>(AI interview guide)</i>
                </div>
              ) : (
                <div>
                  <b>📁 {projectName || "scroll-video-project"}/</b><br />
                  &nbsp;&nbsp;└── 📁 <b>frames/</b><br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── frame_0001.{config.ext}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├── frame_0002.{config.ext}<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── … ({config.count} frames)
                </div>
              )}
            </div>

            {/* Actions Grid */}
            <div className="dl-actions-grid">
              <button
                type="button"
                className="btn-dl-action primary"
                onClick={handleExportToFolder}
                title="Select a directory on your computer to save files directly"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                Save to Folder
              </button>

              <button
                type="button"
                className="btn-dl-action secondary"
                onClick={handleExportToZip}
                title="Download all files packaged as a ZIP archive"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download ZIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress & Completion Status Modal */}
      <div
        id="modal"
        className={modal.show ? "on" : ""}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal-card">
          <div className={`ico ${modal.kind}`}>
            {modal.kind === "ok" && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            )}
            {modal.kind === "bad" && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M12 7v6m0 4h.01" />
              </svg>
            )}
            {modal.kind === "busy" && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4v11m0 0l-4-4m4 4l4-4" />
                <path d="M4 19h16" />
              </svg>
            )}
          </div>
          <h2>{modal.title}</h2>
          {modal.text && <p>{modal.text}</p>}
          {modal.path && <div className="path">{modal.path}</div>}

          {/* Files Summary List */}
          {modal.filesList && modal.filesList.length > 0 && (
            <div className="files-summary-list">
              {modal.filesList.map((item, idx) => (
                <div key={idx}>
                  <span className="check">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          {modal.progress && (
            <div className="bar">
              <i style={{ width: `${modal.progressPct || 0}%` }}></i>
            </div>
          )}
          {modal.buttons && modal.buttons.length > 0 && (
            <div className="modal-row">
              {modal.buttons.map((b, idx) => (
                <button
                  key={idx}
                  className={`btn ${b.primary ? "primary" : ""}`}
                  onClick={b.onClick}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
