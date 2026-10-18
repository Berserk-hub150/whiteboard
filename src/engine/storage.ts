import { MAX_ZOOM, MIN_ZOOM } from "./types";
import type { Camera, El, GridMode, PersistedBoard, Point } from "./types";

export const STORAGE_KEY = "whiteboard:v1";

const HEX = /^#[0-9a-f]{3,8}$/i;

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

function point(v: unknown): Point | null {
  if (!isObj(v) || !isNum(v.x) || !isNum(v.y)) return null;
  return { x: v.x, y: v.y };
}

export function sanitizeColor(v: unknown, fallback: string): string {
  return typeof v === "string" && HEX.test(v) ? v.toLowerCase() : fallback;
}

/** Valida un elemento proveniente da localStorage o da un file importato. */
export function sanitizeElement(raw: unknown): El | null {
  if (!isObj(raw)) return null;
  const id = typeof raw.id === "string" && raw.id ? raw.id : null;
  if (!id) return null;
  const color = sanitizeColor(raw.color, "#000000");
  const width = isNum(raw.width) ? Math.min(200, Math.max(0.5, raw.width)) : 4;

  switch (raw.type) {
    case "stroke": {
      if (!Array.isArray(raw.points) || raw.points.length === 0) return null;
      const points: Point[] = [];
      for (const p of raw.points) {
        const sp = point(p);
        if (!sp) return null;
        points.push(sp);
      }
      return { id, type: "stroke", color, width, points };
    }
    case "line":
    case "arrow": {
      const a = point(raw.a);
      const b = point(raw.b);
      if (!a || !b) return null;
      return { id, type: raw.type, color, width, a, b };
    }
    case "rect":
    case "ellipse": {
      if (!isNum(raw.x) || !isNum(raw.y) || !isNum(raw.w) || !isNum(raw.h)) return null;
      return {
        id,
        type: raw.type,
        color,
        width,
        x: raw.x,
        y: raw.y,
        w: Math.abs(raw.w),
        h: Math.abs(raw.h),
        fill: raw.fill === true,
      };
    }
    case "text": {
      if (!isNum(raw.x) || !isNum(raw.y) || typeof raw.text !== "string") return null;
      const fontSize = isNum(raw.fontSize) ? Math.min(600, Math.max(6, raw.fontSize)) : 24;
      return { id, type: "text", color, width, x: raw.x, y: raw.y, text: raw.text.slice(0, 20000), fontSize };
    }
    default:
      return null;
  }
}

function sanitizeCamera(v: unknown): Camera | undefined {
  if (!isObj(v) || !isNum(v.x) || !isNum(v.y) || !isNum(v.zoom)) return undefined;
  return { x: v.x, y: v.y, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom)) };
}

/** Restituisce null se il testo non è una lavagna valida. */
export function parseBoard(text: string): PersistedBoard | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isObj(data) || !Array.isArray(data.elements)) return null;

  const seen = new Set<string>();
  const elements: El[] = [];
  for (const raw of data.elements) {
    const el = sanitizeElement(raw);
    if (el && !seen.has(el.id)) {
      seen.add(el.id);
      elements.push(el);
    }
  }

  const grid: GridMode | undefined =
    data.grid === "none" || data.grid === "dots" || data.grid === "lines" ? data.grid : undefined;

  return {
    version: 1,
    elements,
    camera: sanitizeCamera(data.camera),
    bgColor: typeof data.bgColor === "string" && HEX.test(data.bgColor) ? data.bgColor : undefined,
    grid,
    color: typeof data.color === "string" && HEX.test(data.color) ? data.color : undefined,
    width: isNum(data.width) ? data.width : undefined,
    fill: typeof data.fill === "boolean" ? data.fill : undefined,
    recentColors: Array.isArray(data.recentColors)
      ? data.recentColors.filter((c): c is string => typeof c === "string" && HEX.test(c)).slice(0, 8)
      : undefined,
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function timestamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}
