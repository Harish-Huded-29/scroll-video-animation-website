import { CalculationPlan, SettingsOptions, VideoProbe, PlanNote } from "./types";

export const REF_VH = 900;
export const MEM_BUDGET = 3_000_000_000;
export const MAX_FRAMES = 600;
export const MIN_FRAMES = 2;
export const WIDTHS = [1280, 1920, 2560, 3840] as const;

export const DEFAULT_SETTINGS: SettingsOptions = {
  screens: 20,
  smoothness: 50,
  width: 1920,
  format: "webp",
  compression: 82,
  frames: 0,
  fit: "cover",
};

export const SMOOTH_POINTS = [
  { name: "Light", ppf: 20.0, ease: 0.30 },
  { name: "Balanced", ppf: 14.0, ease: 0.22 },
  { name: "Smooth", ppf: 10.0, ease: 0.16 },
  { name: "Silky", ppf: 7.0, ease: 0.11 },
  { name: "Ultra", ppf: 5.0, ease: 0.08 },
];

export function calcSmooth(val: number): {
  name: string;
  ppf: number;
  ease: number;
  smooth_pct: number;
  closestIdx: number;
} {
  let v = Number(val);
  if (isNaN(v)) v = 50;

  let L: number;
  let val_pct: number;
  if (v <= 5.0) {
    L = Math.min(5.0, Math.max(1.0, v));
    val_pct = Math.round(1 + ((L - 1) * 99) / 4);
  } else {
    val_pct = Math.round(Math.min(100.0, Math.max(1.0, v)));
    L = 1.0 + ((val_pct - 1) * 4.0) / 99.0;
  }

  const idx = Math.floor(L) - 1;
  let ppf: number;
  let ease: number;

  if (idx >= 4) {
    ppf = SMOOTH_POINTS[4].ppf;
    ease = SMOOTH_POINTS[4].ease;
  } else {
    const frac = L - (idx + 1);
    ppf = SMOOTH_POINTS[idx].ppf + frac * (SMOOTH_POINTS[idx + 1].ppf - SMOOTH_POINTS[idx].ppf);
    ease = SMOOTH_POINTS[idx].ease + frac * (SMOOTH_POINTS[idx + 1].ease - SMOOTH_POINTS[idx].ease);
  }

  const closestIdx = Math.max(0, Math.min(4, Math.round(L) - 1));
  const name = SMOOTH_POINTS[closestIdx].name;

  return { name, ppf, ease, smooth_pct: val_pct, closestIdx };
}

export function makePlan(probe: VideoProbe, o: SettingsOptions): CalculationPlan {
  const S = calcSmooth(o.smoothness);
  let out_w = Math.min(o.width, probe.width);
  out_w -= out_w % 2;
  let out_h = Math.round((probe.height * out_w) / probe.width);
  out_h -= out_h % 2;

  const scroll_px = o.screens * REF_VH;
  const want = o.frames ? o.frames : Math.round(scroll_px / S.ppf);
  const mem_cap = Math.max(60, Math.min(MAX_FRAMES, Math.floor(MEM_BUDGET / (out_w * out_h * 4))));

  const notes: PlanNote[] = [];
  let count = Math.min(want, probe.frames, mem_cap);

  if (mem_cap < Math.min(want, probe.frames)) {
    notes.push({
      kind: "green",
      title: "Optimized for smooth playback",
      text: `Set to ${mem_cap} frames so the page stays fast and fluid without lag.`,
      tip: "Web browsers can freeze or crash if they have to hold hundreds of heavy images in memory at once. The app automatically chooses the ideal frame count so your animation stays responsive and scrolls buttery smooth.<br><br>💡 <b>Tip:</b> If you want even more frames, simply choose a lower resolution (like 720p HD) in the Resolution dropdown above.",
    });
  } else if (probe.frames < want) {
    notes.push({
      kind: "green",
      title: "Using all video frames",
      text: `Using all ${probe.frames} available frames from your video clip.`,
      tip: `Your original video file has ${probe.frames} frames in total, so every frame is being utilized for the animation.`,
    });
  }

  count = Math.max(MIN_FRAMES, count);

  let bpp = 0.09;
  if (o.format === "avif") bpp = 0.06;
  else if (o.format === "webp") bpp = 0.09;
  else if (o.format === "jpg") bpp = 0.13;
  else if (o.format === "png") bpp = 0.50;

  bpp *= o.compression / 80;
  const est_mb = (count * out_w * out_h * bpp) / 1_048_576;

  return {
    count,
    width: out_w,
    height: out_h,
    ppf: scroll_px / count,
    est_mb,
    notes,
    ease: S.ease,
    smooth_name: S.name,
    smooth_pct: S.smooth_pct,
    closestIdx: S.closestIdx,
  };
}

