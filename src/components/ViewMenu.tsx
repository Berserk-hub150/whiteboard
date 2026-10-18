"use client";

import { BG_PRESETS } from "@/engine/constants";
import type { GridMode, UIState } from "@/engine/types";
import type { Whiteboard } from "@/engine/whiteboard";
import { icons } from "./icons";
import { Btn, panel, Section, Segmented, Swatch, usePopover } from "./ui";

const GRIDS: Array<{ id: GridMode; label: string }> = [
  { id: "none", label: "Nessuna" },
  { id: "dots", label: "Punti" },
  { id: "lines", label: "Righe" },
];

export default function ViewMenu({ wb, ui }: { wb: Whiteboard; ui: UIState }) {
  const { open, setOpen, ref } = usePopover();
  return (
    <div ref={ref} className="relative">
      <Btn label="Sfondo e griglia" align="end" active={open} onClick={() => setOpen(!open)}>
        {icons.palette}
      </Btn>
      {open && (
        <div className={`${panel} animate-pop-in absolute right-0 top-full z-30 mt-2 flex w-64 flex-col gap-4 p-3.5`}>
          <Section label="Sfondo">
            <div className="flex flex-wrap gap-2">
              {BG_PRESETS.map((c) => (
                <Swatch key={c} color={c} label={`Sfondo ${c}`} size="h-7 w-7" active={ui.bgColor === c} onClick={() => wb.setBgColor(c)} />
              ))}
            </div>
          </Section>
          <Section label="Griglia">
            <Segmented value={ui.grid} options={GRIDS} onChange={wb.setGrid} />
          </Section>
        </div>
      )}
    </div>
  );
}
