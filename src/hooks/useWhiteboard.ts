"use client";

import { useState, useSyncExternalStore } from "react";
import { Whiteboard } from "@/engine/whiteboard";

/** Crea l'engine una sola volta e ne espone lo stato osservabile alla UI. */
export function useWhiteboard() {
  const [wb] = useState(() => new Whiteboard());
  const ui = useSyncExternalStore(wb.subscribe, wb.getSnapshot, wb.getServerSnapshot);
  return { wb, ui };
}
