"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { BgCanvas } from "./BgCanvas";
import { ScrollVideoViewer } from "./ScrollVideoViewer";
import {
  VideoProbe,
  SettingsOptions,
  PreviewConfig,
  ImageFormat,
  VideoFit,
} from "@/lib/types";
import { DEFAULT_SETTINGS, makePlan, WIDTHS } from "@/lib/planner";
import { probeVideoFile, extractVideoFrames } from "@/lib/videoExtractor";
import { AI_SCROLL_PROMPT } from "@/lib/aiPrompt";

export function ScrollVideoApp() {
  // Current view stage: "upload" | "settings" | "generating" | "viewer"
  const [stage, setStage] = useState<"upload" | "settings" | "generating" | "viewer">("upload");

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [probe, setProbe] = useState<VideoProbe | null>(null);
  const [settings, setSettings] = useState<SettingsOptions>(DEFAULT_SETTINGS);

  // AI Prompt Modal
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Upload status
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadMsg, setUploadMsg] = useState("");
  const [err1, setErr1] = useState("");
  const [err2, setErr2] = useState("");

  // Generation progress
  const [genPct, setGenPct] = useState(0);
  const [genMsg, setGenMsg] = useState("Starting…");
  const [genSub, setGenSub] = useState("Extracting video frames…");

  // Generated preview configuration
  const [previewConfig, setPreviewConfig] = useState<PreviewConfig | null>(null);

  // Screens max limit tip
  const [showMaxTip, setShowMaxTip] = useState(false);
  const maxTipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Floating tooltip dialog state
  const [tip, setTip] = useState<{
    show: boolean;
    title: string;
    body: string;
    top: number;
    left: number;
  }>({
    show: false,
    title: "",
    body: "",
    top: 0,
    left: 0,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live plan calculation
  const plan = useMemo(() => {
    if (!probe) return null;
    return makePlan(probe, settings);
  }, [probe, settings]);

  // Floating tooltip positioning
  const handleShowTip = (e: React.MouseEvent<HTMLElement>, title: string, body: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const boxWidth = Math.min(330, window.innerWidth - 28);
    let left = rect.left + rect.width / 2 - boxWidth / 2;
    left = Math.max(14, Math.min(window.innerWidth - boxWidth - 14, left));

    const approxHeight = 110;
    let top = rect.top - approxHeight - 10;
    if (top < 10) {
      top = rect.bottom + 10;
    }

    setTip({
      show: true,
      title,
      body,
      top,
      left,
    });
  };

  const handleHideTip = () => {
    setTip((prev) => ({ ...prev, show: false }));
  };

  // Video file selection and probing
  const handleSelectFile = async (file: File) => {
    if (!file) return;

    const isVideo =
      file.type.startsWith("video/") ||
      /\.(mp4|mov|mkv|avi|webm|m4v)$/i.test(file.name);

    if (!isVideo) {
      setErr1("Please choose a video file (MP4, WebM, MOV, etc.).");
      return;
    }

    setErr1("");
    setIsUploading(true);
    setUploadPct(15);
    setUploadMsg("Reading video metadata…");

    try {
      const probeResult = await probeVideoFile(file);
      setUploadPct(100);
      setVideoFile(file);
      setProbe(probeResult);
      setIsUploading(false);
      setErr2("");
      setStage("settings");
    } catch (err: unknown) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : "Could not read this video.";
      setErr1(msg);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove("over");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleScreensChange = (val: number) => {
    setSettings((prev) => ({ ...prev, screens: val }));
    if (val >= 100) {
      setShowMaxTip(true);
      if (maxTipTimerRef.current) clearTimeout(maxTipTimerRef.current);
      maxTipTimerRef.current = setTimeout(() => setShowMaxTip(false), 3000);
    } else {
      setShowMaxTip(false);
    }
  };

  const handleStartBuild = async () => {
    if (!videoFile || !probe || !plan) {
      setErr2("Please choose a video first.");
      return;
    }

    setErr2("");
    setStage("generating");
    setGenPct(0);
    setGenMsg("Starting…");
    setGenSub("Extracting video frames in high resolution…");

    try {
      const config = await extractVideoFrames(
        videoFile,
        probe,
        plan,
        settings,
        (pct, msg) => {
          setGenPct(pct);
          setGenMsg(msg);
          if (pct < 30) {
            setGenSub("Extracting video frames in high resolution…");
          } else if (pct < 75) {
            setGenSub("Encoding and optimizing image quality…");
          } else {
            setGenSub("Finalizing interactive scroll timeline…");
          }
        }
      );

      setGenPct(100);
      setGenMsg("Done!");
      setGenSub("Opening your website…");
      await new Promise((r) => setTimeout(r, 450));

      setPreviewConfig(config);
      setStage("viewer");
    } catch (err: unknown) {
      setStage("settings");
      const msg = err instanceof Error ? err.message : "Failed to extract frames.";
      setErr2(msg);
    }
  };

  const handleResetToUpload = () => {
    setVideoFile(null);
    setProbe(null);
    setPreviewConfig(null);
    setStage("upload");
  };

  if (stage === "viewer" && previewConfig) {
    return (
      <ScrollVideoViewer
        config={previewConfig}
        onEdit={() => setStage("settings")}
        onNew={handleResetToUpload}
      />
    );
  }

  return (
    <div className="app-wrapper">
      <BgCanvas />

      {/* Floating Tooltip Dialog */}
      <div
        id="tipBox"
        className={`floating-dialog ${tip.show ? "active" : ""}`}
        style={{
          top: `${tip.top}px`,
          left: `${tip.left}px`,
          display: tip.show ? "block" : "none",
        }}
      >
        <div className="tip-header">
          <div className="tip-ico">i</div>
          <div className="tip-heading">{tip.title}</div>
        </div>
        <div
          className="tip-content"
          dangerouslySetInnerHTML={{ __html: tip.body }}
        />
      </div>

      <main>
        {/* Header Stage */}
        <header className="app-header" id="appHeader">
          <div className="header-content">
            <div className="logo-3d-wrap" id="logo3d" title="Scroll Video Maker">
              <div className="logo-glow"></div>
              <div className="logo-box" id="logoBox">
                <div className="logo-sheen"></div>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="logo-svg"
                >
                  <defs>
                    <linearGradient id="logoGrad1" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#818cf8" />
                      <stop offset="0.5" stopColor="#c084fc" />
                      <stop offset="1" stopColor="#f472b6" />
                    </linearGradient>
                    <linearGradient id="playGrad" x1="12" y1="10" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="1" stopColor="#e0e7ff" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="3"
                    y="3"
                    width="26"
                    height="26"
                    rx="7"
                    stroke="url(#logoGrad1)"
                    strokeWidth="2.2"
                    fill="rgba(99, 102, 241, 0.15)"
                  />
                  <circle cx="7.5" cy="7.5" r="1.2" fill="#818cf8" opacity="0.85" />
                  <circle cx="24.5" cy="7.5" r="1.2" fill="#c084fc" opacity="0.85" />
                  <circle cx="7.5" cy="24.5" r="1.2" fill="#c084fc" opacity="0.85" />
                  <circle cx="24.5" cy="24.5" r="1.2" fill="#f472b6" opacity="0.85" />
                  <path
                    d="M13 10.5C13 9.7 13.9 9.2 14.6 9.6L21.4 14.5C22.1 15 22.1 16 21.4 16.5L14.6 21.4C13.9 21.8 13 21.3 13 20.5V10.5Z"
                    fill="url(#playGrad)"
                    style={{ filter: "drop-shadow(0 2px 6px rgba(168, 85, 247, 0.6))" }}
                  />
                </svg>
              </div>
              <div className="logo-ring"></div>
            </div>

            <div className="hero-badge">
              <span className="live-dot"></span>
              <span className="badge-text">Interactive 3D Scroll Engine</span>
            </div>

            <h1 className="hero-title">Scroll Video Maker</h1>
            <p className="hero-sub">
              Turn your video into an interactive scroll animation.
            </p>
          </div>
        </header>

        {/* 1. CHOOSE FILE STAGE */}
        {stage === "upload" && (
          <div id="s1">
            {/* AI Prompt Button and (i) Guide */}
            <div className="prompt-header-bar">
              <button
                type="button"
                className="btn-ai-prompt"
                onClick={() => setShowPromptModal(true)}
                title="Open AI website prompt generator"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "#c084fc" }}
                >
                  <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1" />
                </svg>
                <span>AI Website Prompt Generator</span>
                <span className="badge-new">NEW</span>
              </button>

              <button
                type="button"
                className="i-btn"
                onMouseEnter={(e) =>
                  handleShowTip(
                    e,
                    "How to Use Frames in Your Website",
                    "Export your video frames using this tool, then copy our crafted AI prompt into ChatGPT, Claude, Cursor, v0, or Antigravity. It instructs the AI to first interview you on your preferences, then generate high-performance canvas code with custom text triggers!"
                  )
                }
                onMouseLeave={handleHideTip}
                aria-label="How to use frames in your website"
              >
                i
              </button>
            </div>

            <div
              id="drop"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("over");
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("over");
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("over");
              }}
              onDrop={handleDrop}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
                <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
              </svg>
              <div className="t">Drag &amp; drop your video here</div>
              <small>
                or click to browse · MP4 recommended · best with 5–20 second clips
              </small>
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                accept="video/*,.mkv,.mov"
                hidden
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleSelectFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            {isUploading && (
              <div id="upstat" style={{ marginTop: "16px" }}>
                <div id="upmsg">{uploadMsg}</div>
                <div className="bar gen-bar">
                  <i style={{ width: `${uploadPct}%` }}></i>
                </div>
              </div>
            )}

            {err1 && <div className="note err">{err1}</div>}
          </div>
        )}

        {/* 2. SETTINGS STAGE */}
        {stage === "settings" && probe && plan && (
          <div id="s2" className="card">
            <div className="file">
              <div className="file-lead">
                <div className="video-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <b>{videoFile?.name || "Uploaded Video"}</b>
                  <div className="finfo">
                    {probe.width}×{probe.height} · {probe.duration}s · {probe.fps} fps ·{" "}
                    {probe.frames} frames
                  </div>
                </div>
              </div>
              <button
                className="btn-change"
                type="button"
                title="Select a different video"
                onClick={handleResetToUpload}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Change video
              </button>
            </div>

            {/* Scroll length on main background */}
            <div className="field">
              <div className="row">
                <label htmlFor="screens">
                  Scroll length
                  <button
                    type="button"
                    className="i-btn"
                    onMouseEnter={(e) =>
                      handleShowTip(
                        e,
                        "Scroll Length",
                        "How many screen heights you scroll to play the entire video from start to finish. For example, 20 screens means scrolling through 20 page heights. Higher numbers make playback slower and more cinematic; lower numbers make it play faster. You can drag the slider or click the number to type any value!"
                      )
                    }
                    onMouseLeave={handleHideTip}
                  >
                    i
                  </button>
                </label>
                <div className="screens-display">
                  <input
                    id="screensNum"
                    type="number"
                    min="2"
                    max="1000"
                    value={settings.screens}
                    className="seamless-num"
                    title="Drag slider below or click to type any number"
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      handleScreensChange(isNaN(v) || v < 2 ? 2 : v);
                    }}
                  />
                  <span className="unit-text">screens</span>
                </div>
              </div>
              <input
                id="screens"
                type="range"
                min="2"
                max={Math.max(100, Math.ceil(settings.screens / 20) * 20)}
                value={settings.screens}
                onChange={(e) => handleScreensChange(Number(e.target.value))}
              />
              <div className="hint">
                How long you scroll to complete the video. Drag slider or type any number
                you want!
              </div>
              {showMaxTip && (
                <div id="maxTip" className="scroll-limit-tip">
                  <span className="tip-icon">💡</span> You can increase the scroll length
                  and frames by typing any number above!
                </div>
              )}
            </div>

            {/* Smoothness */}
            <div className="field">
              <div className="row">
                <label htmlFor="smooth">
                  Smoothness
                  <button
                    type="button"
                    className="i-btn"
                    onMouseEnter={(e) =>
                      handleShowTip(
                        e,
                        "Continuous Smoothness",
                        "Fine-tune your exact scroll animation smoothness continuously from 1 to 100.<br><br>• <b>Left end (Light):</b> Fewer frames, fast and lightweight.<br>• <b>Right end (Ultra):</b> Maximum frames, silky butter-smooth motion.<br>• As you drag, the app smoothly interpolates the frame rate and highlights whichever mode is closest!"
                      )
                    }
                    onMouseLeave={handleHideTip}
                  >
                    i
                  </button>
                </label>
                <span className="val">{plan.smooth_name}</span>
              </div>
              <input
                id="smooth"
                type="range"
                min="1"
                max="100"
                value={settings.smoothness}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    smoothness: Number(e.target.value),
                  }))
                }
              />
              <div className="smooth-scale">
                {[
                  { name: "Light", val: 1 },
                  { name: "Balanced", val: 25 },
                  { name: "Smooth", val: 50 },
                  { name: "Silky", val: 75 },
                  { name: "Ultra", val: 100 },
                ].map((item, idx) => (
                  <span
                    key={item.name}
                    className={`scale-label ${idx === plan.closestIdx ? "active" : ""}`}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        smoothness: item.val,
                      }))
                    }
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <div className="hint">
                Extreme left = Not smooth (Light) · Extreme right = Very smooth (Ultra).
                Drag anywhere to set your custom feel!
              </div>
            </div>

            {/* Resolution & Format */}
            <div className="two">
              <div className="field">
                <div className="row">
                  <label htmlFor="width">
                    Resolution
                    <button
                      type="button"
                      className="i-btn"
                      onMouseEnter={(e) =>
                        handleShowTip(
                          e,
                          "Resolution",
                          "Frame dimensions. Full HD (1080p) is recommended for crisp desktop monitors. HD (720p) is lightweight and loads faster. 2K/4K delivers maximum detail on large displays."
                        )
                      }
                      onMouseLeave={handleHideTip}
                    >
                      i
                    </button>
                  </label>
                </div>
                <select
                  id="width"
                  value={settings.width}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      width: Number(e.target.value),
                    }))
                  }
                >
                  <option value="1280">HD · 720p (Faster loading)</option>
                  <option value="1920">Full HD · 1080p (Recommended)</option>
                  <option value="2560">2K · 1440p (High-res)</option>
                  <option value="3840">4K · 2160p (Ultra HD)</option>
                </select>
              </div>

              <div className="field">
                <div className="row">
                  <label htmlFor="format">
                    Image format
                    <button
                      type="button"
                      className="i-btn"
                      onMouseEnter={(e) =>
                        handleShowTip(
                          e,
                          "Image Format",
                          "WebP: Recommended for small file size & high clarity.<br>JPG: Standard compatibility everywhere.<br>PNG: Lossless pixel perfection (sharpest).<br>AVIF: Next-gen ultra-compact compression."
                        )
                      }
                      onMouseLeave={handleHideTip}
                    >
                      i
                    </button>
                  </label>
                </div>
                <select
                  id="format"
                  value={settings.format}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      format: e.target.value as ImageFormat,
                    }))
                  }
                >
                  <option value="webp">WebP (Recommended · small &amp; fast)</option>
                  <option value="jpg">JPG (Universal compatibility)</option>
                  <option value="png">PNG (Lossless · maximum sharpness)</option>
                  <option value="avif">AVIF (Next-Gen · smallest size)</option>
                </select>
              </div>
            </div>

            {/* Advanced Settings */}
            <details>
              <summary>
                Advanced settings (video fit, image quality, frame count)
              </summary>
              <div className="two">
                <div className="field">
                  <div className="row">
                    <label htmlFor="fit">
                      Video fit
                      <button
                        type="button"
                        className="i-btn"
                        onMouseEnter={(e) =>
                          handleShowTip(
                            e,
                            "Video Fit",
                            "<b>Fill screen (Cover):</b> Fills 100% of the screen edge-to-edge with no black bars. Outer edges are softly cropped if screen shape differs.<br><br><b>Show whole video (Contain):</b> Shows every single pixel without cropping. Black letterbox bars appear if screen shape differs."
                          )
                        }
                        onMouseLeave={handleHideTip}
                      >
                        i
                      </button>
                    </label>
                  </div>
                  <select
                    id="fit"
                    value={settings.fit}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        fit: e.target.value as VideoFit,
                      }))
                    }
                  >
                    <option value="cover">Fill screen (Cover · fills entire screen)</option>
                    <option value="contain">Show whole video (Contain · no edges cut off)</option>
                  </select>
                  <div className="hint">How video sizes to visitor screens.</div>
                </div>

                <div className="field">
                  <div className="row">
                    <label htmlFor="comp">
                      Image quality
                      <button
                        type="button"
                        className="i-btn"
                        onMouseEnter={(e) =>
                          handleShowTip(
                            e,
                            "Image Quality",
                            "Controls compression balance (50–95). 80–85 gives high visual quality with reasonable file size. (PNG frames are always lossless)."
                          )
                        }
                        onMouseLeave={handleHideTip}
                      >
                        i
                      </button>
                    </label>
                    <span className="val">
                      {settings.format === "png"
                        ? "Lossless (HQ)"
                        : settings.compression}
                    </span>
                  </div>
                  <input
                    id="comp"
                    type="range"
                    min="50"
                    max="95"
                    value={settings.compression}
                    disabled={settings.format === "png"}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        compression: Number(e.target.value),
                      }))
                    }
                  />
                  <div className="hint">
                    {settings.format === "png"
                      ? "PNG is lossless, keeping maximum pixel quality."
                      : "Balance between visual clarity and file size."}
                  </div>
                </div>
              </div>

              <div className="field">
                <div className="row">
                  <label htmlFor="frames">
                    Exact number of frames (optional)
                    <button
                      type="button"
                      className="i-btn"
                      onMouseEnter={(e) =>
                        handleShowTip(
                          e,
                          "Exact Frame Count",
                          "Override automatic calculation to specify an exact number of frames (e.g. 150). Leave blank on Auto for the recommended count."
                        )
                      }
                      onMouseLeave={handleHideTip}
                    >
                      i
                    </button>
                  </label>
                </div>
                <input
                  id="frames"
                  type="number"
                  min="2"
                  max="5000"
                  placeholder="Auto (recommended)"
                  value={settings.frames || ""}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setSettings((prev) => ({
                      ...prev,
                      frames: isNaN(v) ? 0 : v,
                    }));
                  }}
                />
                <div className="hint">
                  Leave empty to calculate optimal frames automatically.
                </div>
              </div>
            </details>

            {/* Plan calculation & Notes in Green */}
            <div id="plan">
              <div className="grid">
                <div>
                  <b>{plan.count}</b>
                  <span>frames</span>
                </div>
                <div>
                  <b>{`${plan.width}×${plan.height}`}</b>
                  <span>resolution</span>
                </div>
                <div>
                  <b>
                    ≈{" "}
                    {plan.est_mb < 10
                      ? plan.est_mb.toFixed(1)
                      : Math.round(plan.est_mb)}{" "}
                    MB
                  </b>
                  <span>total size</span>
                </div>
              </div>
              <div className="src">
                About {plan.ppf.toFixed(1)} px of scrolling per frame · source video:{" "}
                {probe.frames} frames
              </div>
              <div id="pNotes">
                {plan.notes.map((n, idx) => (
                  <div key={idx} className={`note ${n.kind}`}>
                    <div className="note-main">
                      <span className="note-badge">✓</span>
                      <div>
                        <div className="note-title">{n.title}</div>
                        <div className="note-desc">{n.text}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="i-btn"
                      onMouseEnter={(e) => handleShowTip(e, n.title, n.tip)}
                      onMouseLeave={handleHideTip}
                      aria-label="More info"
                    >
                      i
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {err2 && <div className="note err">{err2}</div>}
            <button className="main" onClick={handleStartBuild}>
              Create scroll website
            </button>
          </div>
        )}

        {/* 3. PROGRESS WITH 3D ANIMATION */}
        {stage === "generating" && (
          <div id="s3" className="card center gen-stage">
            <div className="stage-3d">
              <div className="ring-glow"></div>
              <div className="film-cube">
                <div className="face front">🎬</div>
                <div className="face back">🎞</div>
                <div className="face right">✨</div>
                <div className="face left">⚡</div>
                <div className="face top"></div>
                <div className="face bottom"></div>
              </div>
              <div className="orbit-particle p1"></div>
              <div className="orbit-particle p2"></div>
            </div>

            <div className="gen-title">Creating Your Scroll Animation</div>
            <div className="gen-sub">{genSub}</div>

            <div className="pct-display">
              <span>{genPct}</span>
              <span className="pct-symbol">%</span>
            </div>

            <div className="gen-bar-wrap">
              <div className="bar gen-bar">
                <i style={{ width: `${genPct}%` }}></i>
              </div>
            </div>

            <div className="gen-stats">
              <div className="gen-badge">{genMsg}</div>
            </div>
          </div>
        )}

        {/* AI Website Prompt Modal Dialog */}
        {showPromptModal && (
          <div
            className="prompt-modal-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowPromptModal(false);
            }}
          >
            <div className="prompt-modal-window">
              <div className="prompt-modal-header">
                <div className="prompt-modal-title-group">
                  <div className="prompt-modal-icon">✨</div>
                  <div>
                    <h3 className="prompt-modal-title">AI Website Builder Prompt</h3>
                    <p className="prompt-modal-sub">
                      Copy &amp; paste this prompt into Claude, ChatGPT, Cursor, v0, or Antigravity to build an Awwwards-style scroll website with your downloaded frames.
                    </p>
                  </div>
                </div>
                {/* Close button at right up end */}
                <button
                  type="button"
                  className="btn-modal-close"
                  onClick={() => setShowPromptModal(false)}
                  title="Close dialog"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="prompt-code-wrap">
                <pre className="prompt-code-content">{AI_SCROLL_PROMPT}</pre>
              </div>

              <div className="prompt-modal-footer">
                <span className="prompt-footer-hint">
                  Includes full animation trigger ranges, text overlay positioning, and canvas preloader code.
                </span>
                {/* Copy button at right down end */}
                <button
                  type="button"
                  className={`btn-copy-prompt ${copied ? "copied" : ""}`}
                  onClick={() => {
                    navigator.clipboard.writeText(AI_SCROLL_PROMPT);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  title="Copy prompt to clipboard"
                >
                  {copied ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Copy Full Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

