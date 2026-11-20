"use client";

import { useEffect, useRef, useState } from "react";
import { projects, site } from "@/content/site";

const LINE_MS = 90;
const MAX_MS = 1600;

const lines = [
  `${site.osName} ${site.kernel.version} — shell only, kernel in development`,
  "",
  "[  ok  ] mounted /home/guest",
  `[  ok  ] mounted /projects (${projects.map((p) => p.id).join(", ")})`,
  `[  ok  ] loaded runtimes: ${site.languages.map((l) => l.toLowerCase()).join("  ")}`,
  ...projects.map((p) => `[  ok  ] started ${p.id}.service (demo data)`),
  "[  ok  ] started notifications.socket",
  "[ wait ] kernel.plan — see roadmap",
  "",
  "starting desktop…",
];

export default function BootScreen({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const done = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const start = performance.now();
    let finishTimer = 0;
    const finish = () => {
      if (done.current) return;
      done.current = true;
      setShown(lines.length);
      finishTimer = window.setTimeout(() => onDoneRef.current(), 250);
    };
    const tick = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const next = Math.min(lines.length, Math.floor(elapsed / LINE_MS));
      setShown(next);
      if (next >= lines.length || elapsed >= MAX_MS) finish();
    }, 40);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(finishTimer);
    };
  }, []);

  const skip = () => {
    if (done.current) return;
    done.current = true;
    onDoneRef.current();
  };

  return (
    <div className="absolute inset-0 z-[1001] cursor-pointer bg-[#050505] px-12 py-10 mobile:px-5 mobile:py-7" onClick={skip} role="status" aria-live="polite">
      <pre className="m-0 font-mono text-[15px] leading-[1.7] whitespace-pre-wrap text-[#b9bbb5] mobile:text-[12px]">{lines.slice(0, shown).join("\n")}</pre>
      <span className="absolute right-7 bottom-[22px] font-mono text-[12px] text-[#4a4a50]">click to skip</span>
    </div>
  );
}
