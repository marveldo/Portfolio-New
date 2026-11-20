"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { site } from "@/content/site";
import Desktop from "./os/Desktop";

const DeskScene = dynamic(() => import("./scene/DeskScene"), { ssr: false });

type Mode = "pending" | "desk" | "mobile";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function isPhone() {
  return window.innerWidth < 560 || window.matchMedia("(pointer: coarse) and (max-width: 900px)").matches;
}

export default function Portfolio() {
  const [mode, setMode] = useState<Mode>("pending");
  const [phone, setPhone] = useState(false);
  const [started, setStarted] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  // Phones fly into the monitor like desktops, then hand over to the full-screen phone layout of the OS.
  const [onScreen, setOnScreen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    setPhone(isPhone());
    setMode(supportsWebGL() ? "desk" : "mobile");
  }, []);

  const start = useCallback(() => {
    setStarted(true);
    setZoomed(true);
  }, []);

  const leave = useCallback(() => {
    setOnScreen(false);
    setZoomed(false);
  }, []);
  const onReady = useCallback(() => setSceneReady(true), []);
  const onFail = useCallback(() => setMode("mobile"), []);
  const onArrive = useCallback(() => setOnScreen(true), []);

  useEffect(() => {
    if (mode !== "desk") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, leave]);

  const desktop = (
    <Desktop
      mode={mode === "mobile" ? "mobile" : "desk"}
      started={started}
      interactive={mode === "mobile" || zoomed}
      onStart={start}
      onExit={mode === "desk" ? leave : undefined}
    />
  );

  const [first, middle, last] = site.headline;
  const revealed = mode === "mobile" || (mode === "desk" && sceneReady);

  return (
    <main>
      {mode === "desk" && (
        <>
          <DeskScene zoomed={zoomed} onReady={onReady} onFail={onFail} onArrive={onArrive}>
            {desktop}
          </DeskScene>

          {/* Phones: once the camera lands on the monitor, the OS goes full screen in its phone layout. */}
          {phone && onScreen && (
            <div className="fixed inset-0 z-40 animate-fade-up">
              <Desktop mode="mobile" started interactive onStart={start} onExit={leave} />
            </div>
          )}

          {/* Soft fade behind the copy (from the left on wide screens, from the top in portrait) so it reads over the desk. */}
          <div
            className={`pointer-events-none fixed inset-y-0 left-0 z-4 w-[min(720px,60vw)] bg-linear-to-r from-[#0d0c0b]/85 via-[#0d0c0b]/45 to-transparent transition-opacity duration-600 portrait:inset-x-0 portrait:bottom-auto portrait:h-[55vh] portrait:w-full portrait:bg-linear-to-b ${
              zoomed ? "opacity-0" : ""
            }`}
            aria-hidden="true"
          />

          <section
            className={`fixed inset-y-0 left-[clamp(24px,5vw,80px)] z-5 flex max-w-130 flex-col justify-center pb-[6vh] transition-[opacity,translate] duration-600 max-[980px]:max-w-90 portrait:right-6 portrait:justify-start portrait:pt-[9vh] portrait:pb-0 ${
              zoomed ? "pointer-events-none -translate-x-7.5 opacity-0" : ""
            }`}
            aria-hidden={zoomed}
          >
            <div className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.12em] text-[#9b948a] uppercase">
              <i className="h-2 w-2 flex-none animate-blink rounded-full bg-accent shadow-[0_0_12px_var(--color-accent)]" />
              {site.name} · {site.role} · {site.location}
            </div>
            <h1 className="mt-6 mb-6 text-[clamp(38px,4.8vw,68px)] leading-[0.96] font-semibold tracking-[-0.045em]">
              {first}
              <br />
              {middle} <span className="text-accent">{last}</span>
            </h1>
            <p className="mt-0 mb-7 max-w-100 text-[16px] leading-[1.6] text-[#b8b1a6] max-[980px]:hidden">{site.intro}</p>
            <div className="mb-9 flex flex-wrap gap-2 max-[980px]:mb-5">
              {site.languages.map((l) => (
                <span key={l} className="rounded-full border border-[#3a342d] px-2.75 py-1.5 font-mono text-[12px] text-[#d9d3c9]">
                  {l}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                className="rounded-full bg-[#f2efe9] px-5.5 py-3.25 text-[15px] font-semibold text-[#0d0c0b] transition-colors duration-200 hover:bg-accent hover:text-white"
                onClick={start}
                tabIndex={zoomed ? -1 : 0}
              >
                Boot the desktop
              </button>
              <span className="font-mono text-[12px] text-[#7a7369] max-[1200px]:hidden">or click the monitor</span>
            </div>
          </section>

          <nav
            className={`fixed bottom-8 left-[clamp(24px,5vw,80px)] z-5 flex gap-5 font-mono text-[12px] transition-opacity duration-400 ${
              zoomed ? "pointer-events-none opacity-0" : ""
            }`}
            aria-label="Elsewhere"
          >
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                tabIndex={zoomed ? -1 : 0}
                className="text-[#6d665d] no-underline transition-colors duration-200 hover:text-[#f2efe9]"
              >
                {s.label} ↗
              </a>
            ))}
          </nav>
          <div
            className={`fixed right-10 bottom-8 z-5 font-mono text-[12px] text-[#6d665d] transition-opacity duration-400 max-[980px]:hidden ${
              zoomed ? "opacity-0" : ""
            }`}
          >
            move your mouse · esc to leave the screen
          </div>
        </>
      )}
      {mode === "mobile" && <div className="fixed inset-0">{desktop}</div>}
      <div
        className={`pointer-events-none fixed inset-0 z-30 bg-[#0d0c0b] transition-opacity duration-600 ${revealed ? "opacity-0" : ""}`}
        aria-hidden="true"
      />
    </main>
  );
}
