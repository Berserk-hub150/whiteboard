"use client";

import type { ToolId, UIState } from "@/engine/types";
import type { Whiteboard } from "@/engine/whiteboard";
import { icons, type IconName } from "./icons";
import { Btn, panel } from "./ui";

type ToolDef = { id: ToolId; label: string; key: string; icon: IconName };

const GROUPS: ToolDef[][] = [
  [
    { id: "select", label: "Seleziona", key: "V", icon: "select" },
    { id: "hand", label: "Sposta vista", key: "H", icon: "hand" },
  ],
  [
    { id: "pen", label: "Penna", key: "P", icon: "pen" },
    { id: "eraser", label: "Gomma", key: "E", icon: "eraser" },
  ],
  [
    { id: "line", label: "Linea", key: "L", icon: "line" },
    { id: "arrow", label: "Freccia", key: "A", icon: "arrow" },
    { id: "rect", label: "Rettangolo", key: "R", icon: "rect" },
    { id: "ellipse", label: "Ellisse", key: "O", icon: "ellipse" },
  ],
  [{ id: "text", label: "Testo", key: "T", icon: "text" }],
];

export default function Toolbar({ wb, ui }: { wb: Whiteboard; ui: UIState }) {
  return (
    <div
      role="toolbar"
      aria-label="Strumenti"
      className={`${panel} flex max-w-full items-center gap-1 overflow-x-auto p-1.5 lg:overflow-visible`}
    >
      {GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <div className="mr-1 h-6 w-px shrink-0 bg-black/10 dark:bg-white/15" />}
          {group.map((t) => (
            <Btn key={t.id} label={t.label} shortcut={t.key} active={ui.tool === t.id} onClick={() => wb.setTool(t.id)}>
              {icons[t.icon]}
            </Btn>
          ))}
        </div>
      ))}
    </div>
  );
}
