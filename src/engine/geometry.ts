import type { El, Point, Rect } from "./types";

export const FONT_FAMILY =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
export const LINE_HEIGHT = 1.25;

export const fontOf = (size: number) => `${size}px ${FONT_FAMILY}`;

/** Dimensione del testo a partire dallo spessore scelto nello slider. */
export const fontSizeFor = (width: number) => Math.max(16, Math.round(width * 6));

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return dist(p, a);
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1);
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/* ------------------------------------------------------------------ rect */

export function rectFromPoints(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  };
}

export const inflate = (r: Rect, n: number): Rect => ({
  x: r.x - n,
  y: r.y - n,
  w: r.w + n * 2,
  h: r.h + n * 2,
});

export const rectContains = (r: Rect, p: Point) =>
  p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

export const rectsIntersect = (a: Rect, b: Rect) =>
  a.x <= b.x + b.w && a.x + a.w >= b.x && a.y <= b.y + b.h && a.y + a.h >= b.y;

export function unionRects(rects: Rect[]): Rect | null {
  if (rects.length === 0) return null;
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  for (const r of rects) {
    x1 = Math.min(x1, r.x);
    y1 = Math.min(y1, r.y);
    x2 = Math.max(x2, r.x + r.w);
    y2 = Math.max(y2, r.y + r.h);
  }
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

/** Distanza di un punto dal contorno di un rettangolo (positiva sia dentro che fuori). */
function distToRectOutline(p: Point, r: Rect): number {
  const inside = rectContains(r, p);
  if (inside) {
    return Math.min(p.x - r.x, r.x + r.w - p.x, p.y - r.y, r.y + r.h - p.y);
  }
  const dx = Math.max(r.x - p.x, 0, p.x - (r.x + r.w));
  const dy = Math.max(r.y - p.y, 0, p.y - (r.y + r.h));
  return Math.hypot(dx, dy);
}

/* ------------------------------------------------------------------ text */

let measureCtx: CanvasRenderingContext2D | null = null;

export function measureText(text: string, fontSize: number): { w: number; h: number } {
  const lines = text.split("\n");
  if (!measureCtx && typeof document !== "undefined") {
    measureCtx = document.createElement("canvas").getContext("2d");
  }
  let w = 0;
  if (measureCtx) {
    measureCtx.font = fontOf(fontSize);
    for (const l of lines) w = Math.max(w, measureCtx.measureText(l).width);
  } else {
    for (const l of lines) w = Math.max(w, l.length * fontSize * 0.6);
  }
  return { w: Math.max(w, fontSize * 0.5), h: lines.length * fontSize * LINE_HEIGHT };
}

/* ---------------------------------------------------------------- bounds */

export function arrowHeadLength(a: Point, b: Point, width: number): number {
  return Math.min(Math.max(14, width * 4.5), dist(a, b) * 0.6);
}

const boundsCache = new WeakMap<El, Rect>();

/** Bounding box in coordinate mondo, comprensivo dello spessore del tratto. */
export function boundsOf(el: El): Rect {
  const cached = boundsCache.get(el);
  if (cached) return cached;
  const hw = el.width / 2;
  let r: Rect;
  switch (el.type) {
    case "stroke": {
      let x1 = Infinity;
      let y1 = Infinity;
      let x2 = -Infinity;
      let y2 = -Infinity;
      for (const p of el.points) {
        if (p.x < x1) x1 = p.x;
        if (p.y < y1) y1 = p.y;
        if (p.x > x2) x2 = p.x;
        if (p.y > y2) y2 = p.y;
      }
      r = { x: x1 - hw, y: y1 - hw, w: x2 - x1 + el.width, h: y2 - y1 + el.width };
      break;
    }
    case "line":
    case "arrow": {
      const pad = hw + (el.type === "arrow" ? arrowHeadLength(el.a, el.b, el.width) : 0);
      r = inflate(rectFromPoints(el.a, el.b), pad);
      break;
    }
    case "rect":
    case "ellipse":
      r = inflate({ x: el.x, y: el.y, w: el.w, h: el.h }, hw);
      break;
    case "text": {
      const m = measureText(el.text, el.fontSize);
      r = { x: el.x, y: el.y, w: m.w, h: m.h };
      break;
    }
  }
  boundsCache.set(el, r);
  return r;
}

/** Bounding box geometrico (senza lo spessore del tratto): base per il ridimensionamento. */
export function geomBoundsOf(el: El): Rect {
  switch (el.type) {
    case "stroke": {
      let x1 = Infinity;
      let y1 = Infinity;
      let x2 = -Infinity;
      let y2 = -Infinity;
      for (const p of el.points) {
        if (p.x < x1) x1 = p.x;
        if (p.y < y1) y1 = p.y;
        if (p.x > x2) x2 = p.x;
        if (p.y > y2) y2 = p.y;
      }
      return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
    }
    case "line":
    case "arrow":
      return rectFromPoints(el.a, el.b);
    case "rect":
    case "ellipse":
      return { x: el.x, y: el.y, w: el.w, h: el.h };
    case "text":
      return boundsOf(el);
  }
}

/* ------------------------------------------------------------- hit-test */

/** `tol` è la tolleranza in unità mondo (es. 6px / zoom). */
export function hitTest(el: El, p: Point, tol: number): boolean {
  const hw = el.width / 2 + tol;
  switch (el.type) {
    case "stroke": {
      const pts = el.points;
      if (pts.length === 1) return dist(p, pts[0]) <= hw;
      for (let i = 0; i < pts.length - 1; i++) {
        if (distToSegment(p, pts[i], pts[i + 1]) <= hw) return true;
      }
      return false;
    }
    case "line":
    case "arrow":
      return distToSegment(p, el.a, el.b) <= hw;
    case "rect": {
      if (el.fill && rectContains(el, p)) return true;
      return distToRectOutline(p, el) <= hw;
    }
    case "ellipse": {
      const rx = el.w / 2;
      const ry = el.h / 2;
      if (rx < 0.5 || ry < 0.5) {
        return distToSegment(p, { x: el.x, y: el.y }, { x: el.x + el.w, y: el.y + el.h }) <= hw;
      }
      const dx = p.x - (el.x + rx);
      const dy = p.y - (el.y + ry);
      const dc = Math.hypot(dx, dy);
      const q = Math.hypot(dx / rx, dy / ry);
      if (el.fill && q <= 1) return true;
      // distanza radiale dal contorno (approssimazione ottima per hit-test)
      const d = dc === 0 ? Math.min(rx, ry) : Math.abs(dc - dc / q);
      return d <= hw;
    }
    case "text":
      return rectContains(inflate(boundsOf(el), tol), p);
  }
}

/* ----------------------------------------------------------- transforms */

export function translateEl(el: El, dx: number, dy: number): El {
  switch (el.type) {
    case "stroke":
      return { ...el, points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
    case "line":
    case "arrow":
      return {
        ...el,
        a: { x: el.a.x + dx, y: el.a.y + dy },
        b: { x: el.b.x + dx, y: el.b.y + dy },
      };
    case "rect":
    case "ellipse":
    case "text":
      return { ...el, x: el.x + dx, y: el.y + dy };
  }
}

/** Scala un elemento rispetto al punto (ox, oy). sx, sy devono essere > 0. */
export function scaleEl(el: El, ox: number, oy: number, sx: number, sy: number): El {
  const mx = (x: number) => ox + (x - ox) * sx;
  const my = (y: number) => oy + (y - oy) * sy;
  switch (el.type) {
    case "stroke":
      return { ...el, points: el.points.map((p) => ({ x: mx(p.x), y: my(p.y) })) };
    case "line":
    case "arrow":
      return {
        ...el,
        a: { x: mx(el.a.x), y: my(el.a.y) },
        b: { x: mx(el.b.x), y: my(el.b.y) },
      };
    case "rect":
    case "ellipse":
      return { ...el, x: mx(el.x), y: my(el.y), w: el.w * sx, h: el.h * sy };
    case "text":
      return {
        ...el,
        x: mx(el.x),
        y: my(el.y),
        fontSize: Math.max(6, el.fontSize * ((sx + sy) / 2)),
      };
  }
}

/* --------------------------------------------------------- simplification */

/** Ramer–Douglas–Peucker iterativo (nessun rischio di stack overflow). */
export function simplify(points: Point[], eps: number): Point[] {
  const n = points.length;
  if (n < 3) return points;
  const keep = new Uint8Array(n);
  keep[0] = 1;
  keep[n - 1] = 1;
  const stack: Array<[number, number]> = [[0, n - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    let maxD = 0;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = distToSegment(points[i], points[s], points[e]);
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (idx > 0 && maxD > eps) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return points.filter((_, i) => keep[i] === 1);
}
