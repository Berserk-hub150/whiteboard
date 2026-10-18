"use client";

import type { ReactNode } from "react";

export const panelClass =
  "pointer-events-auto rounded-xl border border-white/10 bg-neutral-900/85 text-white shadow-xl backdrop-blur-xl";

interface BtnProps {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
  className?: string;
}

/** Bottone icona. onMouseDown evita di rubare il focus alla lavagna (scorciatoie, barra spaziatrice). */
export function Btn({ title, onClick, active, disabled, danger, children, className = "" }: BtnProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        active
          ? "bg-white text-black"
          : danger
            ? "text-red-300 hover:bg-red-500/20"
            : "text-white hover:bg-white/15"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Swatch({
  color,
  active,
  onClick,
  title,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title ?? color}
      aria-label={title ?? color}
      aria-pressed={active}
      onClick={onClick}
      style={{ backgroundColor: color }}
      className={`h-6 w-6 rounded-md border transition-transform hover:scale-110 ${
        active ? "border-2 border-blue-400 ring-1 ring-white/70" : "border-white/30"
      }`}
    />
  );
}

export function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-white/50">{label}</div>
      {children}
    </div>
  );
}
