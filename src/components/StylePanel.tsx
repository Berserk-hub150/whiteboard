"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { BG_PRESETS, MAX_WIDTH, MIN_WIDTH, PALETTE } from "@/engine/constants";
import type { GridMode, UIState } from "@/engine/types";
import type { Whiteboard } from "@/engine/whiteboard";
import { panelClass, Section, Swatch } from "./ui";

const GRIDS: Array<{ id: GridMode; label: string }> = [
  { id: "none", label: "Nessuna" },
  { id: "dots", label: "Punti" },
  { id: "lines", label: "Righe" },
];

export default function StylePanel({ wb, ui }: { wb: Whiteboard; ui: UIState }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const isText = ui.tool === "text";

  return (
    <div className={`${panelClass} flex w-52 flex-col gap-4 p-3`}>
      <Section label="Colore">
        <div className="grid grid-cols-8 gap-1">
          {PALETTE.map((c) => (
            <Swatch key={c} color={c} active={ui.color === c} onClick={() => wb.setColor(c)} />
          ))}
        </div>
        {ui.recentColors.length > 0 && (
          <div className="flex gap-1">
            {ui.recentColors.map((c) => (
              <Swatch key={c} color={c} active={ui.color === c} onClick={() => wb.setColor(c)} />
            ))}
          </div>
        )}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setPickerOpen((o) => !o)}
          className="rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
        >
          {pickerOpen ? "Chiudi selettore" : "Altro colore…"}
        </button>
        {pickerOpen && (
          <HexColorPicker color={ui.color} onChange={wb.setColor} style={{ width: "100%", height: 130 }} />
        )}
      </Section>

      <Section label={isText ? "Dimensione testo" : "Spessore"}>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={MIN_WIDTH}
            max={MAX_WIDTH}
            value={ui.width}
            onChange={(e) => wb.setWidth(Number(e.target.value))}
            className="h-1 w-full cursor-pointer accent-white"
            aria-label="Spessore"
          />
          <span className="w-7 text-right text-xs tabular-nums text-white/70">{ui.width}</span>
        </div>
      </Section>

      {ui.showFill && (
        <Section label="Riempimento">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={ui.fill}
              onChange={(e) => wb.setFill(e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            Colora l&apos;interno
          </label>
        </Section>
      )}

      <Section label="Sfondo">
        <div className="flex flex-wrap gap-1">
          {BG_PRESETS.map((c) => (
            <Swatch key={c} color={c} active={ui.bgColor === c} onClick={() => wb.setBgColor(c)} title={`Sfondo ${c}`} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1">
          {GRIDS.map((g) => (
            <button
              key={g.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wb.setGrid(g.id)}
              aria-pressed={ui.grid === g.id}
              className={`rounded-md px-1 py-1 text-xs transition-colors ${
                ui.grid === g.id ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
