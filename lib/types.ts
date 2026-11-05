export interface VideoProbe {
  width: number;
  height: number;
  duration: number;
  fps: number;
  frames: number;
}

export type ImageFormat = "webp" | "jpg" | "png" | "avif";
export type VideoFit = "cover" | "contain";

export interface SettingsOptions {
  screens: number;
  smoothness: number;
  width: number;
  format: ImageFormat;
  compression: number;
  frames: number;
  fit: VideoFit;
}

export interface PlanNote {
  kind: "green" | "err";
  title: string;
  text: string;
  tip: string;
}

export interface CalculationPlan {
  count: number;
  width: number;
  height: number;
  ppf: number;
  est_mb: number;
  notes: PlanNote[];
  ease: number;
  smooth_name: string;
  smooth_pct: number;
  closestIdx: number;
}

export interface FrameData {
  bitmap?: ImageBitmap;
  blob?: Blob;
  url?: string;
  name: string;
}

export interface PreviewConfig {
  count: number;
  ext: string;
  prefix: string;
  pad: number;
  width: number;
  height: number;
  screens: number;
  smoothness: number;
  ease: number;
  fit: VideoFit;
  v: number;
  mb: number;
  frames: FrameData[];
  options: SettingsOptions;
}
