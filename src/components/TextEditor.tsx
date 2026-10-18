"use client";

import { useEffect, useRef } from "react";
import { FONT_FAMILY, LINE_HEIGHT, measureText } from "@/engine/geometry";
import type { Camera, TextEdit } from "@/engine/types";
import type { Whiteboard } from "@/engine/whiteboard";

/** Textarea posizionata sopra il canvas per scrivere/modificare un testo. */
export default function TextEditor({ wb, edit, camera }: { wb: Whiteboard; edit: TextEdit; camera: Camera }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [edit.session]);

  const z = camera.zoom;
  const m = measureText(edit.text || " ", edit.fontSize);

  return (
    <textarea
      ref={ref}
      value={edit.text}
      spellCheck={false}
      placeholder="Scrivi…"
      onChange={(e) => wb.updateEditText(edit.session, e.target.value)}
      onBlur={() => wb.commitText(edit.session)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) {
          e.preventDefault();
          wb.commitText(edit.session);
        }
      }}
      className="absolute z-20 resize-none overflow-hidden whitespace-pre border-0 bg-transparent p-0 outline-dashed outline-1 outline-offset-4 outline-blue-400/80"
      style={{
        left: (edit.x - camera.x) * z,
        top: (edit.y - camera.y) * z,
        width: Math.ceil((m.w + edit.fontSize * 0.8) * z),
        height: Math.ceil(m.h * z) + 2,
        fontSize: edit.fontSize * z,
        lineHeight: LINE_HEIGHT,
        fontFamily: FONT_FAMILY,
        color: edit.color,
        caretColor: edit.color,
      }}
    />
  );
}
