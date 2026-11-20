"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createDeskRuntime, type DeskRuntime } from "./deskRuntime";

type Props = {
  zoomed: boolean;
  children: ReactNode;
  onReady?: () => void;
  onFail?: () => void;
  onArrive?: () => void;
};

export default function DeskScene({ zoomed, children, onReady, onFail, onArrive }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const flatRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<DeskRuntime | null>(null);
  const zoomedRef = useRef(zoomed);
  const callbacks = useRef({ onReady, onFail, onArrive });
  const [host] = useState(() => {
    const el = document.createElement("div");
    el.className = "os-host";
    return el;
  });

  useEffect(() => {
    callbacks.current = { onReady, onFail, onArrive };
  });

  useEffect(() => {
    const stage = stageRef.current;
    const flat = flatRef.current;
    if (!stage || !flat) return;
    let runtime: DeskRuntime;
    try {
      runtime = createDeskRuntime({
        stage,
        flat,
        host,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        onFirstFrame: () => callbacks.current.onReady?.(),
        onArrive: () => callbacks.current.onArrive?.(),
      });
    } catch {
      callbacks.current.onFail?.();
      return;
    }
    runtimeRef.current = runtime;
    if (zoomedRef.current) runtime.flyTo(true, true);
    return () => {
      runtimeRef.current = null;
      runtime.dispose();
    };
  }, [host]);

  useEffect(() => {
    zoomedRef.current = zoomed;
    runtimeRef.current?.flyTo(zoomed);
  }, [zoomed]);

  return (
    <>
      <div className="stage" ref={stageRef} />
      <div className="flat" ref={flatRef} />
      {createPortal(children, host)}
    </>
  );
}
