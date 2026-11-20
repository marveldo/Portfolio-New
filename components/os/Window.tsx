"use client";

import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Icon } from "./icons";
import type { WindowState } from "./types";

type Props = {
  win: WindowState;
  title: string;
  front: boolean;
  mobile: boolean;
  getScale: () => number;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMove: (x: number, y: number) => void;
  children: ReactNode;
};

const MENU_BAR = 30;

const dot = "h-3 w-3 rounded-full";

export default function Window({ win, title, front, mobile, getScale, onFocus, onClose, onMinimize, onMove, children }: Props) {
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; scale: number } | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (mobile || e.button !== 0 || (e.target as HTMLElement).closest("button")) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: win.x, oy: win.y, scale: getScale() };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const x = d.ox + (e.clientX - d.sx) / d.scale;
    const y = d.oy + (e.clientY - d.sy) / d.scale;
    onMove(Math.max(-win.w + 120, x), Math.max(MENU_BAR, y));
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <section
      className={`absolute flex flex-col overflow-hidden bg-[#1a1a1d] shadow-[0_30px_80px_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(0,0,0,0.6)] animate-win-in transition-[opacity,translate,scale] duration-250 ${
        mobile ? "left-0 top-7.5 h-[calc(100%-30px)] w-full" : "rounded-[14px] border border-white/9"
      }${win.min ? " pointer-events-none translate-y-45 scale-[0.6] opacity-0" : ""}`}
      style={mobile ? { zIndex: win.z } : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onPointerDownCapture={onFocus}
      aria-label={title}
      aria-hidden={win.min}
    >
      <div
        className="grid h-9.5 flex-none cursor-grab touch-none grid-cols-[90px_1fr_90px] items-center border-b border-white/6 bg-[#202024] px-3 text-[13px] text-[#b9b8bd] active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {mobile ? (
          <button className="inline-flex items-center gap-0.5 font-medium text-accent" onClick={onMinimize}>
            <Icon name="back" size={18} />
            Home
          </button>
        ) : (
          <span className="flex gap-1.75">
            <button className={`${dot} ${front ? "bg-[#ff5f57]" : "bg-[#3a3a40]"}`} aria-label={`Close ${title}`} onClick={onClose} />
            <button className={`${dot} ${front ? "bg-[#febc2e]" : "bg-[#3a3a40]"}`} aria-label={`Minimize ${title}`} onClick={onMinimize} />
            <span className={`${dot} ${front ? "bg-[#28c840]" : "bg-[#3a3a40]"}`} />
          </span>
        )}
        <span className="truncate text-center">{title}</span>
        <span />
      </div>
      <div className="relative flex-1 select-text overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-lg [&::-webkit-scrollbar-thumb]:bg-[#333]">
        {children}
      </div>
    </section>
  );
}
