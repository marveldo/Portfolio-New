# portfolio-os

A personal portfolio built as a 3D desk. Visitors boot a desktop on the monitor and use real, interactive project demos inside it. The desktop is the preview shell for an OS that is still being written.

Next.js 16 · React 19 · TypeScript · three.js

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run build
npm start
```

## Make it yours

Almost everything personal lives in `content/`:

| File | What it holds |
| --- | --- |
| `content/site.ts` | Name, role, location, email, socials, headline, languages, about text, kernel roadmap, and the `projects` list |
| `content/demo.ts` | Demo data the project apps run on (events, books) |

Each entry in `projects` becomes a desktop app, a dock icon and a terminal entry. `app: "events"` renders the ticketing demo and `app: "shop"` renders the storefront demo. To add a different kind of project, add a component in `components/os/apps/` and map it in `components/os/registry.tsx`.

## How it fits together

```
app/
  layout.tsx            fonts, metadata, global styles
  page.tsx              renders <Portfolio />
components/
  Portfolio.tsx         picks desk or phone mode, owns booted/zoomed state, intro copy
  scene/
    DeskScene.tsx       mounts the three.js runtime, portals the desktop onto the monitor
    deskRuntime.ts      renderer, camera fly-in/out, parallax, flat overlay swap
    buildDesk.ts        the desk, monitor, keyboard, lamp, mug, books and lights
  os/
    Desktop.tsx         menu bar, icons, dock, windows, toasts, lock and boot
    Window.tsx          draggable window chrome
    BootScreen.tsx      boot log
    registry.tsx        every app on the desktop
    apps/               Events, Shop, Terminal, About, Contact, Kernel
    os.css              desktop styles
content/                everything you edit
```

### The screen

The desktop is plain React. While the camera is away from the monitor, it is placed on the 3D screen with `CSS3DRenderer`, so it stays real DOM. Once the camera finishes flying in, it moves into a flat overlay sized to match the screen exactly, which keeps text sharp and works on every GPU. Leaving the desk moves it back onto the monitor with its windows intact.

### Modes

- Desk: any pointer device wider than 560px, including narrow desktop windows. The camera pulls back to fit.
- Phone: touch screens up to 900px wide, windows under 560px, or no WebGL. The desktop runs full screen and apps open as full-screen sheets.
- `prefers-reduced-motion` skips the camera flight and animations.

## Next steps

- Swap the demo apps for the real products running on mock data with MSW, plus an "open live" link per project.
- Run the terminal's `run` command for real in the browser: Pyodide, Go WASM, esbuild-wasm, Emscripten.
- Boot the real kernel in the `kernel.plan` app with v86 once it produces an ISO.
