"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Pannello flottante "vetro": chiaro di giorno, scuro se il sistema è in dark mode. */
export const panel =
  "pointer-events-auto rounded-2xl bg-white/85 text-neutral-800 shadow-lg shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/85 dark:text-neutral-100 dark:shadow-black/40 dark:ring-white/10";

export const subtle = "text-neutral-500 dark:text-neutral-400";

const hoverBg = "hover:bg-black/5 dark:hover:bg-white/10";

interface BtnProps {
  label: string;
  shortcut?: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
  className?: string;
  /** Dove compare il tooltip. */
  tip?: "bottom" | "top";
  /** Allineamento orizzontale del tooltip (usare "end"/"start" vicino ai bordi dello schermo). */
  align?: "center" | "start" | "end";
}

/**
 * Bottone icona con tooltip. onMouseDown evita di rubare il focus alla lavagna
 * (così scorciatoie e barra spaziatrice continuano a funzionare).
 */
export function Btn({ label, shortcut, onClick, active, disabled, danger, children, className = "", tip = "bottom", align = "center" }: BtnProps) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={`flex h-10 min-w-[34px] items-center justify-center rounded-xl px-1 transition-all sm:min-w-10 sm:px-2 duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-30 ${
          active
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
            : danger
              ? "text-red-600 hover:bg-red-500/10 dark:text-red-400"
              : hoverBg
        } ${className}`}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-50 hidden whitespace-nowrap rounded-lg bg-neutral-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity delay-500 dark:bg-white dark:text-neutral-900 [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:opacity-100 ${
          tip === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
        } ${align === "center" ? "left-1/2 -translate-x-1/2" : align === "end" ? "right-0" : "left-0"}`}
      >
        {label}
        {shortcut && (
          <kbd className="ml-2 rounded bg-white/20 px-1 py-px font-mono text-[10px] dark:bg-black/10">{shortcut}</kbd>
        )}
      </span>
    </div>
  );
}

export function Swatch({
  color,
  active,
  onClick,
  label,
  size = "h-6 w-6",
}: {
  color: string;
  active: boolean;
  onClick: () => void;
  label?: string;
  size?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label ?? color}
      aria-pressed={active}
      title={label ?? color}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{ backgroundColor: color }}
      className={`${size} rounded-full border border-black/15 transition-transform duration-150 hover:scale-110 dark:border-white/25 ${
        active ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900" : ""
      }`}
    />
  );
}

export function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`text-[11px] font-semibold uppercase tracking-wider ${subtle}`}>{label}</div>
      {children}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 text-sm"
    >
      <span>{label}</span>
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-neutral-300 dark:bg-neutral-600"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ id: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-0.5 rounded-xl bg-black/5 p-0.5 dark:bg-white/10">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onChange(o.id)}
          className={`rounded-[10px] px-2 py-1.5 text-xs font-medium transition-all ${
            value === o.id ? "bg-white shadow-sm dark:bg-neutral-700" : `${subtle} hover:text-neutral-900 dark:hover:text-white`
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Chiude un popover al click fuori o con Esc. */
export function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

export function MenuItem({
  icon,
  label,
  hint,
  onClick,
  danger,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-40 ${
        danger ? "text-red-600 hover:bg-red-500/10 dark:text-red-400" : hoverBg
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex min-w-0 flex-col">
        <span className="font-medium">{label}</span>
        {hint && <span className={`text-xs ${subtle}`}>{hint}</span>}
      </span>
    </button>
  );
}
