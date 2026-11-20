"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { projects, site } from "@/content/site";
import type { OsApi } from "../types";

type Line = { text: string; kind: "out" | "dim" | "cmd" | "ok" | "err" | "code" };

const kindColor: Record<Line["kind"], string> = {
  out: "",
  dim: "text-[#6c6f69]",
  cmd: "text-[#ecebe8]",
  ok: "text-[#7cf2b0]",
  err: "text-[#ff7a6b]",
  code: "text-[#f2c14e]",
};

const files: Record<string, { src: string; out: string; tool: string }> = {
  "hello.py": {
    tool: "pyodide",
    src: 'langs = ["python", "ts", "go", "c++"]\nprint(f"hello from {len(langs)} languages")',
    out: "hello from 4 languages",
  },
  "hello.go": {
    tool: "go/wasm",
    src: 'package main\n\nimport "fmt"\n\nfunc main() {\n    ch := make(chan string)\n    go func() { ch <- "goroutine says hi" }()\n    fmt.Println(<-ch)\n}',
    out: "goroutine says hi",
  },
  "hello.ts": {
    tool: "esbuild-wasm",
    src: 'const fib = (n: number): number => (n < 2 ? n : fib(n - 1) + fib(n - 2));\nconsole.log([...Array(10).keys()].map(fib).join(" "));',
    out: "0 1 1 2 3 5 8 13 21 34",
  },
  "hello.cpp": {
    tool: "emscripten",
    src: '#include <iostream>\n#include <numeric>\n#include <vector>\n\nint main() {\n    std::vector<int> v(10);\n    std::iota(v.begin(), v.end(), 1);\n    std::cout << std::accumulate(v.begin(), v.end(), 0) << "\\n";\n}',
    out: "55",
  },
};

const prompt = `guest@${site.handle}os:~$`;

export default function TerminalApp({ api }: { api: OsApi }) {
  const [lines, setLines] = useState<Line[]>([
    { text: `${site.osName} terminal · type help`, kind: "dim" },
    { text: "try: run hello.go", kind: "dim" },
  ]);
  const [input, setInput] = useState("");
  const history = useRef<string[]>([]);
  const cursor = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const print = (text: string, kind: Line["kind"] = "out") => setLines((ls) => [...ls, { text, kind }]);

  const run = (raw: string) => {
    const [cmd, arg] = raw.trim().split(/\s+/);
    switch (cmd) {
      case "help":
        return print("help  whoami  ls  cat <file>  run <file>  langs  projects  open <app>  roadmap  contact  neofetch  clear");
      case "whoami":
        return print(`${site.name} — ${site.role.toLowerCase()}. Frontend and backend. ${site.location}.`);
      case "ls":
        return print([...Object.keys(files), "about.txt", "kernel.plan"].join("   "));
      case "langs":
        return print(site.languages.map((l) => l.toLowerCase()).join("   "));
      case "projects":
        return print(
          projects.map((p) => `${p.id.padEnd(10)}${p.summary}`).join("\n") + (projects[0] ? `\n\ntry: open ${projects[0].id}` : ""),
        );
      case "roadmap":
        print("opening kernel.plan…", "dim");
        api.launch("kernel");
        return;
      case "contact":
        print("opening contact…", "dim");
        api.launch("contact");
        return;
      case "neofetch":
        return print(
          [
            `   ▟▙▟▙     guest@${site.handle}os`,
            `   ▜▛▜█     os      ${site.osName} ${site.kernel.version}`,
            "            shell   this desktop (kernel coming)",
            `            langs   ${site.languages.map((l) => l.toLowerCase()).join(" ")}`,
            `            apps    ${projects.map((p) => p.id).join(" ")}`,
            "            uptime  since you clicked boot",
          ].join("\n"),
        );
      case "clear":
        return setLines([]);
      case "cat":
        if (arg && files[arg]) return print(files[arg].src, "code");
        if (arg === "about.txt" || arg === "kernel.plan") {
          api.launch(arg === "about.txt" ? "about" : "kernel");
          return;
        }
        return print(`cat: ${arg ?? ""}: no such file`, "err");
      case "run": {
        const file = arg ? files[arg] : undefined;
        if (!file) return print(`run: ${arg ?? ""}: no such file — try ls`, "err");
        print(`[${file.tool}] building ${arg}…`, "dim");
        window.setTimeout(() => print(file.out, "ok"), 450);
        return;
      }
      case "open":
        if (arg && api.launch(arg)) return;
        return print(`open: ${arg ?? ""}: no such app — try projects`, "err");
      default:
        return print(`${cmd}: command not found — type help`, "err");
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      cursor.current = Math.max(0, Math.min(h.length, cursor.current + (e.key === "ArrowUp" ? -1 : 1)));
      setInput(h[cursor.current] ?? "");
      return;
    }
    if (e.key !== "Enter") return;
    const line = input.trim();
    setInput("");
    print(`${prompt} ${line}`, "cmd");
    if (!line) return;
    history.current.push(line);
    cursor.current = history.current.length;
    run(line);
  };

  return (
    <div
      className="h-full cursor-text overflow-auto bg-[#0b0b0c] px-3.5 py-3 font-mono text-[13px] text-[#cfd2cc]"
      ref={scroller}
      onClick={() => field.current?.focus({ preventScroll: true })}
    >
      {lines.map((l, i) => (
        <div key={i} className={`leading-[1.55] whitespace-pre-wrap ${kindColor[l.kind]}`}>
          {l.text}
        </div>
      ))}
      <label className="flex items-center gap-2">
        <span className="flex-none text-accent">{prompt}</span>
        <input
          className="min-w-0 flex-1 border-0 bg-transparent text-[#ecebe8] caret-[#7cf2b0] outline-none"
          ref={field}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          aria-label="Terminal input"
        />
      </label>
    </div>
  );
}
