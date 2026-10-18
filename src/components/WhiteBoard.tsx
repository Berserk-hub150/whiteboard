"use client";

import { useRef, useState } from "react";
import { isDark } from "@/engine/render";
import { useWhiteboard } from "@/hooks/useWhiteboard";
import Canvas from "./Canvas";
import StylePanel from "./StylePanel";
import Toolbar from "./Toolbar";
import { icons } from "./icons";
import { Btn, panelClass } from "./ui";

export default function WhiteBoard() {
  const { wb, ui } = useWhiteboard();
  const [styleOpen, setStyleOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    const res = wb.importJSON(await file.text());
    if (!res.ok) window.alert(res.error);
  }

  const hasSelection = ui.selectionCount > 0;

  return (
    <div className="fixed inset-0 overflow-hidden">
      <Canvas wb={wb} ui={ui} />

      {/* UI sopra il canvas: il contenitore lascia passare i click, i pannelli no */}
      <div className="pointer-events-none absolute inset-0 z-10 select-none">
        {/* Strumenti */}
        <div className="absolute left-1/2 top-2 -translate-x-1/2">
          <Toolbar wb={wb} ui={ui} />
        </div>

        {/* Stile */}
        <div className="absolute left-2 top-2 max-h-[calc(100%-5rem)] overflow-y-auto">
          <div className={`${panelClass} mb-2 w-fit p-1 md:hidden`}>
            <Btn title="Stile" active={styleOpen} onClick={() => setStyleOpen((o) => !o)}>
              {icons.style}
            </Btn>
          </div>
          <div className={`${styleOpen ? "block" : "hidden"} md:block`}>
            <StylePanel wb={wb} ui={ui} />
          </div>
        </div>

        {/* File */}
        <div className={`${panelClass} absolute right-2 top-2 flex items-center gap-0.5 p-1`}>
          <Btn title="Esporta PNG" onClick={() => void wb.exportPNG()}>
            {icons.image}
          </Btn>
          <Btn title="Salva lavagna (.json)" onClick={wb.exportJSON}>
            {icons.save}
          </Btn>
          <Btn title="Apri lavagna (.json)" onClick={() => fileRef.current?.click()}>
            {icons.open}
          </Btn>
          <Btn title="Svuota lavagna" danger disabled={!ui.hasContent} onClick={wb.clear}>
            {icons.trash}
          </Btn>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        {/* Azioni sulla selezione */}
        {hasSelection && (
          <div className={`${panelClass} absolute bottom-14 left-1/2 flex -translate-x-1/2 items-center gap-0.5 p-1 md:bottom-2`}>
            <span className="px-2 text-xs text-white/60">{ui.selectionCount} selezionat{ui.selectionCount === 1 ? "o" : "i"}</span>
            <Btn title="Duplica (Ctrl+D)" onClick={wb.duplicateSelection}>
              {icons.copy}
            </Btn>
            <Btn title="Porta in primo piano (])" onClick={wb.bringToFront}>
              {icons.front}
            </Btn>
            <Btn title="Manda sullo sfondo ([)" onClick={wb.sendToBack}>
              {icons.back}
            </Btn>
            <Btn title="Elimina (Canc)" danger onClick={wb.deleteSelection}>
              {icons.trash}
            </Btn>
          </div>
        )}

        {/* Annulla / ripeti */}
        <div className={`${panelClass} absolute bottom-2 left-2 flex items-center gap-0.5 p-1`}>
          <Btn title="Annulla (Ctrl+Z)" disabled={!ui.canUndo} onClick={wb.undo}>
            {icons.undo}
          </Btn>
          <Btn title="Ripeti (Ctrl+Shift+Z)" disabled={!ui.canRedo} onClick={wb.redo}>
            {icons.redo}
          </Btn>
        </div>

        {/* Zoom */}
        <div className={`${panelClass} absolute bottom-2 right-2 flex items-center gap-0.5 p-1`}>
          <Btn title="Riduci (Ctrl+-)" onClick={wb.zoomOut}>
            {icons.minus}
          </Btn>
          <button
            type="button"
            title="Zoom 100% (Ctrl+0)"
            onMouseDown={(e) => e.preventDefault()}
            onClick={wb.resetZoom}
            className="h-9 w-14 rounded-lg text-center text-xs tabular-nums hover:bg-white/15"
          >
            {Math.round(ui.zoom * 100)}%
          </button>
          <Btn title="Ingrandisci (Ctrl++)" onClick={wb.zoomIn}>
            {icons.plus}
          </Btn>
          <Btn title="Adatta al contenuto (1)" onClick={wb.zoomToFit}>
            {icons.fit}
          </Btn>
        </div>

        {/* Suggerimenti a lavagna vuota */}
        {!ui.hasContent && !ui.editing && (
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-sm"
            style={{ color: isDark(ui.bgColor) ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
          >
            <p className="text-base font-medium">Lavagna infinita</p>
            <p className="mt-1">
              Trascina per disegnare · Spazio o tasto destro + trascina per spostarti · Ctrl + rotella per lo zoom
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
