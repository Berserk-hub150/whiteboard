export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** x/y = coordinata mondo dell'angolo in alto a sinistra del viewport. */
export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export type ToolId =
  | "select"
  | "hand"
  | "pen"
  | "eraser"
  | "line"
  | "arrow"
  | "rect"
  | "ellipse"
  | "text";

export type GridMode = "none" | "dots" | "lines";

interface BaseEl {
  id: string;
  color: string;
  /** Spessore del tratto in unità mondo. */
  width: number;
}

export interface StrokeEl extends BaseEl {
  type: "stroke";
  points: Point[];
}

export interface LineEl extends BaseEl {
  type: "line" | "arrow";
  a: Point;
  b: Point;
}

export interface BoxEl extends BaseEl {
  type: "rect" | "ellipse";
  x: number;
  y: number;
  w: number;
  h: number;
  fill: boolean;
}

export interface TextEl extends BaseEl {
  type: "text";
  x: number;
  y: number;
  text: string;
  fontSize: number;
}

/**
 * Gli elementi sono trattati come immutabili: ogni modifica produce un nuovo
 * oggetto. Questo rende undo/redo (snapshot dell'array) e le cache (WeakMap)
 * corrette e a costo quasi nullo.
 */
export type El = StrokeEl | LineEl | BoxEl | TextEl;

export interface TextEdit {
  /** Identifica la sessione di editing: i commit di sessioni vecchie vengono ignorati. */
  session: number;
  /** id dell'elemento esistente in modifica, null se è un testo nuovo. */
  id: string | null;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

/** Stato osservabile dalla UI React (immutabile, sostituito a ogni cambiamento). */
export interface UIState {
  tool: ToolId;
  color: string;
  width: number;
  fill: boolean;
  bgColor: string;
  grid: GridMode;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  selectionCount: number;
  /** true se lo strumento corrente o la selezione contengono forme riempibili. */
  showFill: boolean;
  hasContent: boolean;
  recentColors: string[];
  editing: TextEdit | null;
  /** Presente solo durante l'editing di un testo (serve a posizionare la textarea). */
  camera: Camera | null;
}

export interface PersistedBoard {
  version: 1;
  elements: El[];
  camera?: Camera;
  bgColor?: string;
  grid?: GridMode;
  color?: string;
  width?: number;
  fill?: boolean;
  recentColors?: string[];
}

export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 8;
