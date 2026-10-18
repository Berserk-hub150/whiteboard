"use client";

import { useEffect, useRef } from "react";
import type { UIState } from "@/engine/types";
import type { Whiteboard } from "@/engine/whiteboard";
import TextEditor from "./TextEditor";

export default function Canvas({ wb, ui }: { wb: Whiteboard; ui: UIState }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    return wb.attach(canvas);
  }, [wb]);

  return (
    <>
      <canvas ref={ref} className="absolute inset-0 block h-full w-full touch-none select-none" />
      {ui.editing && ui.camera && <TextEditor key={ui.editing.session} wb={wb} edit={ui.editing} camera={ui.camera} />}
    </>
  );
}
