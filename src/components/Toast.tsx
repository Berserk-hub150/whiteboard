"use client";

import { useEffect } from "react";
import { icons } from "./icons";

export interface ToastMsg {
  id: number;
  text: string;
  kind: "ok" | "error";
}

export default function Toast({ toast, onDone }: { toast: ToastMsg | null; onDone: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, toast.kind === "error" ? 5000 : 2800);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;
  return (
    <div
      key={toast.id}
      role="status"
      className={`animate-pop-in pointer-events-auto flex max-w-[calc(100vw-1rem)] items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
        toast.kind === "error" ? "bg-red-600" : "bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900"
      }`}
    >
      <span className="h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4">{toast.kind === "ok" ? icons.check : icons.close}</span>
      {toast.text}
    </div>
  );
}
