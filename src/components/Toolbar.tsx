"use client";

import type { ToolId, UIState } from "@/engine/types";
import type { Whiteboard } from "@/engine/whiteboard";
import { icons, type IconName } from "./icons";
import { Btn, panelClass } from "./ui";

const TOOLS: Array<{ id: ToolId; label: string; key: string; icon: IconName }> = [
  { id: "select", label: "Seleziona", key: "V", icon: "select" },
  { id: "hand", label: "Sposta vista", key: "H", icon: "hand" },
  { id: "pen", label: "Penna", key: "P", icon: "pen" },
  { id: "eraser", label: "Gomma", key: "E", icon: "eraser" },
  { id: "line", label: "Linea", key: "L", icon: "line" },
  { id: "arrow", label: "Freccia", key: "A", icon: "arrow" },
  { id: "rect", label: "Rettangolo", key: "R", icon: "rect" },
  { id: "ellipse", label: "Ellisse", key: "O", icon: "ellipse" },
  { id: "text", label: "Testo", key: "T", icon: "text" },
];

export default function Toolbar({ wb, ui }: { wb: Whiteboard; ui: UIState }) {
  return (
    <div className={`${panelClass} flex max-w-[calc(100vw-1rem)] items-center gap-0.5 overflow-x-auto p-1`}>
      {TOOLS.map((t) => (
        <Btn key={t.id} title={`${t.label} (${t.key})`} active={ui.tool === t.id} onClick={() => wb.setTool(t.id)}>
          {icons[t.icon]}
        </Btn>
      ))}
    </div>
  );
}
