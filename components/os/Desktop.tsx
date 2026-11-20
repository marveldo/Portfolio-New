"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { projects, site } from "@/content/site";
import { demoEvents } from "@/content/demo";
import { AppIcon, Icon } from "./icons";
import { appById, apps } from "./registry";
import BootScreen from "./BootScreen";
import Window from "./Window";
import { useClock } from "./useClock";
import type { AppId, OsApi, WindowState } from "./types";

type Props = {
  mode: "desk" | "mobile";
  started: boolean;
  interactive: boolean;
  onStart: () => void;
  onExit?: () => void;
};

type Phase = "lock" | "boot" | "ready";

const logoCell = "h-1.5 w-1.5 rounded-[1.5px] bg-[#ecebe8]";
const barBtn = "text-[#a9a8ad] hover:text-white";

type Toast = { id: number; title: string; body: string; from: AppId; leaving: boolean };

export default function Desktop({ mode, started, interactive, onStart, onExit }: Props) {
  const mobile = mode === "mobile";
  const rootRef = useRef<HTMLDivElement>(null);
  const zTop = useRef(10);
  const toastId = useRef(0);
  const timers = useRef(new Set<number>());
  const welcomed = useRef(false);
  const [phase, setPhase] = useState<Phase>("lock");
  const [wins, setWins] = useState<WindowState[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selected, setSelected] = useState<AppId | null>(null);
  const clock = useClock(site.timeZone);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const launch = useCallback((id: AppId) => {
    const app = appById[id];
    if (!app) return false;
    setWins((ws) => {
      const z = ++zTop.current;
      if (ws.some((w) => w.id === id)) return ws.map((w) => (w.id === id ? { ...w, min: false, z } : w));
      return [...ws, { id, x: app.pos.x, y: app.pos.y, w: app.size.w, h: app.size.h, z, min: false }];
    });
    return true;
  }, []);

  const toast = useCallback(
    (title: string, body: string, from: AppId = projects[0]?.id ?? "terminal") => {
      const id = ++toastId.current;
      setToasts((ts) => [...ts, { id, title, body, from, leaving: false }]);
      later(() => setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t))), 3600);
      later(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4000);
    },
    [later],
  );

  const api: OsApi = useMemo(() => ({ launch, toast }), [launch, toast]);

  useEffect(() => {
    if (started && phase === "lock") setPhase("boot");
  }, [started, phase]);

  const onBooted = useCallback(() => {
    setPhase("ready");
    if (welcomed.current) return;
    welcomed.current = true;
    const first = projects[0];
    if (!mobile && first) {
      launch(first.id);
      later(() => launch("terminal"), 350);
    }
    if (first) later(() => toast(first.name, `Someone just registered for ${demoEvents[0].title}`, first.id), 2600);
  }, [launch, later, mobile, toast]);

  const focus = (id: AppId) =>
    setWins((ws) => {
      const top = ws.reduce((m, w) => Math.max(m, w.z), 0);
      if (ws.find((w) => w.id === id)?.z === top) return ws;
      const z = ++zTop.current;
      return ws.map((w) => (w.id === id ? { ...w, z } : w));
    });

  const close = (id: AppId) => setWins((ws) => ws.filter((w) => w.id !== id));
  const minimize = (id: AppId) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, min: true } : w)));
  const move = (id: AppId, x: number, y: number) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)));

  const getScale = useCallback(() => {
    const el = rootRef.current;
    if (!el || !el.offsetWidth) return 1;
    return el.getBoundingClientRect().width / el.offsetWidth || 1;
  }, []);

  const frontId = wins.filter((w) => !w.min).reduce<WindowState | null>((top, w) => (!top || w.z > top.z ? w : top), null)?.id;
  const running = new Set(wins.map((w) => w.id));

  return (
    <div
      ref={rootRef}
      data-mobile={mobile || undefined}
      className={`relative isolate overflow-hidden bg-[#111113] font-sans text-[14px] text-[#ecebe8] select-none ${
        mobile ? "h-dvh w-full" : "h-200 w-7xl"
      }`}
    >
      <div
        className="absolute inset-0 bg-[#121214] bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px]"
        aria-hidden="true"
      >
        <div className="absolute right-12 bottom-21 text-[150px] leading-none font-bold tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.09)] mobile:right-5 mobile:bottom-27.5 mobile:text-[72px]">
          {site.osName}
        </div>
        <div className="absolute right-13 bottom-16.5 font-mono text-[11px] text-[#55555c] mobile:right-5.5 mobile:bottom-24">
          {site.kernel.version} · the kernel is in development
        </div>
      </div>

      <header className="absolute inset-x-0 top-0 z-900 flex h-7.5 items-center justify-between border-b border-white/6 bg-[rgba(18,18,20,0.92)] px-3.5 text-[13px]">
        <div className="flex items-center gap-4.5">
          <span className="grid grid-cols-[repeat(2,6px)] gap-0.5" aria-hidden="true">
            <i className={logoCell} />
            <i className={logoCell} />
            <i className={logoCell} />
            <i className={`${logoCell} bg-accent`} />
          </span>
          <b>{site.osName}</b>
          {projects[0] && (
            <button className={`${barBtn} mobile:hidden`} onClick={() => launch(projects[0].id)}>
              Projects
            </button>
          )}
          <button className={`${barBtn} mobile:hidden`} onClick={() => launch("terminal")}>
            Terminal
          </button>
          <button className={`${barBtn} mobile:hidden`} onClick={() => launch("about")}>
            About
          </button>
        </div>
        <div className="flex items-center gap-4.5">
          <span className="text-[#a9a8ad] tabular-nums">
            {site.location} {clock.time}
          </span>
          {onExit && (
            <button className={`${barBtn} inline-flex items-center gap-1 rounded-full border border-[#3a3a40] px-2.5 py-0.5 text-[12px]`} onClick={onExit}>
              Leave desk <Icon name="arrowUpRight" size={12} />
            </button>
          )}
        </div>
      </header>

      <nav
        className={`absolute top-13 left-5.5 z-1 flex flex-col gap-2 mobile:inset-x-0 mobile:top-14 mobile:grid mobile:grid-cols-4 mobile:gap-1 mobile:px-2.5 ${
          phase === "ready" ? "animate-fade-up" : "opacity-0"
        }`}
        aria-label="Desktop"
      >
        {apps.map((a) => (
          <button
            key={a.id}
            className={`flex w-21 flex-col items-center gap-1.5 rounded-[10px] px-1 py-2 text-[12px] text-[#d8d7d4] focus-visible:bg-accent/16 focus-visible:outline-none mobile:w-auto${
              selected === a.id ? " bg-accent/16" : ""
            }`}
            onClick={() => (mobile ? launch(a.id) : setSelected(a.id))}
            onDoubleClick={() => launch(a.id)}
            onKeyDown={(e) => e.key === "Enter" && launch(a.id)}
          >
            <AppIcon icon={a.icon} tone={a.tone} />
            <span>{a.title}</span>
          </button>
        ))}
      </nav>

      <div className="absolute inset-0">
        {wins.map((w) => {
          const app = appById[w.id];
          return (
            <Window
              key={w.id}
              win={w}
              title={app.title}
              front={w.id === frontId}
              mobile={mobile}
              getScale={getScale}
              onFocus={() => focus(w.id)}
              onClose={() => close(w.id)}
              onMinimize={() => minimize(w.id)}
              onMove={(x, y) => move(w.id, x, y)}
            >
              {app.render(api)}
            </Window>
          );
        })}
      </div>

      <nav
        className={`absolute bottom-3 left-1/2 z-900 flex -translate-x-1/2 gap-2 rounded-[20px] border border-white/8 bg-[rgba(30,30,34,0.86)] p-2 mobile:hidden ${
          phase === "ready" ? "animate-fade-up" : "opacity-0"
        }`}
        aria-label="Dock"
      >
        {apps.map((a) => (
          <button
            key={a.id}
            className="relative transition-transform duration-200 hover:-translate-y-1.5 hover:scale-[1.08]"
            title={a.title}
            onClick={() => launch(a.id)}
          >
            <AppIcon icon={a.icon} tone={a.tone} />
            <em className={`absolute -bottom-1.5 left-1/2 -ml-0.5 h-1 w-1 rounded-full${running.has(a.id) ? " bg-[#ecebe8]" : ""}`} />
          </button>
        ))}
      </nav>

      <div className="absolute top-10.5 right-3.5 z-950 flex flex-col gap-2 mobile:left-3.5" aria-live="polite">
        {toasts.map((t) => {
          const app = appById[t.from];
          return (
            <button
              key={t.id}
              className={`flex w-75 items-center gap-3 rounded-[14px] border border-white/8 bg-[rgba(32,32,36,0.95)] p-3 text-left shadow-[0_14px_40px_rgba(0,0,0,0.4)] mobile:w-full ${
                t.leaving ? "animate-toast-out" : "animate-toast-in"
              }`}
              onClick={() => launch(t.from)}
            >
              {app && <AppIcon icon={app.icon} tone={app.tone} size={36} />}
              <span>
                <b className="block text-[13px]">{t.title}</b>
                <small className="mt-0.5 block text-[12px] text-[#a9a8ad]">{t.body}</small>
              </span>
            </button>
          );
        })}
      </div>

      {phase === "lock" && (
        <div className="absolute inset-0 z-1000 flex cursor-pointer flex-col items-center justify-center bg-[#0c0c0d]" onClick={onStart}>
          <div className="text-[132px] leading-none font-semibold tracking-tighter tabular-nums mobile:text-[84px]">{clock.time}</div>
          <div className="mt-1.5 text-[18px] text-[#8a8990]">{clock.date}</div>
          <div className="mt-17.5 text-[20px] font-semibold">{site.name}</div>
          <div className="mt-1 text-[14px] text-[#8a8990]">{site.role} · frontend &amp; backend</div>
          <button className="mt-5.5 animate-ring-pulse rounded-full bg-accent px-5.5 py-2.75 font-semibold text-white">Click to boot</button>
        </div>
      )}

      {phase === "boot" && <BootScreen onDone={onBooted} />}

      {!mobile && !interactive && phase !== "lock" && (
        <button className="absolute inset-0 z-2000 cursor-zoom-in" aria-label="Open the desktop" onClick={onStart} />
      )}
    </div>
  );
}
