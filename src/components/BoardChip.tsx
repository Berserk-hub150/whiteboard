"use client";

import { useState } from "react";
import type { UIState } from "@/engine/types";
import type { Whiteboard } from "@/engine/whiteboard";
import { icons } from "./icons";
import { Btn, panel, subtle } from "./ui";

function saveLabel(ui: UIState): { text: string; error: boolean } {
  if (ui.saveState === "error") return { text: "Salvataggio non riuscito: spazio esaurito", error: true };
  if (ui.saveState === "saving") return { text: "Salvataggio…", error: false };
  if (!ui.lastSaved) return { text: "Salvata in questo browser", error: false };
  const t = new Date(ui.lastSaved).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  return { text: `Salvata alle ${t}`, error: false };
}

/** Nome della lavagna (modificabile con un click) + stato di salvataggio + accesso alla libreria. */
export default function BoardChip({ wb, ui, onOpenLibrary }: { wb: Whiteboard; ui: UIState; onOpenLibrary: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const status = saveLabel(ui);

  function commit() {
    setEditing(false);
    if (draft.trim() && draft.trim() !== ui.boardName) wb.renameBoard(ui.boardId, draft);
  }

  return (
    <div className={`${panel} flex max-w-[calc(100vw-12.5rem)] items-center gap-1 p-1.5 pr-3 sm:max-w-xs`}>
      <Btn label="Le mie lavagne" align="start" onClick={onOpenLibrary}>
        {icons.boards}
      </Btn>
      <div className="flex min-w-0 flex-col leading-tight">
        {editing ? (
          <input
            autoFocus
            value={draft}
            maxLength={80}
            aria-label="Nome della lavagna"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            className="w-40 rounded-md bg-black/5 px-1.5 py-0.5 text-sm font-semibold outline-none ring-2 ring-indigo-500 dark:bg-white/10"
          />
        ) : (
          <button
            type="button"
            title="Rinomina"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setDraft(ui.boardName);
              setEditing(true);
            }}
            className="truncate rounded-md px-1.5 py-0.5 text-left text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/10"
          >
            {ui.boardName}
          </button>
        )}
        <span className={`truncate px-1.5 text-[11px] ${status.error ? "font-medium text-red-600 dark:text-red-400" : subtle}`}>
          {status.text}
        </span>
      </div>
    </div>
  );
}
