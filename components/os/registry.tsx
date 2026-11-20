import { projects } from "@/content/site";
import type { AppDef } from "./types";
import EventsApp from "./apps/EventsApp";
import ShopApp from "./apps/ShopApp";
import TerminalApp from "./apps/TerminalApp";
import AboutApp from "./apps/AboutApp";
import ContactApp from "./apps/ContactApp";
import KernelApp from "./apps/KernelApp";

const projectApps: AppDef[] = projects.map((project, i) => {
  const events = project.app === "events";
  return {
    id: project.id,
    title: project.name,
    icon: events ? "ticket" : "book",
    tone: project.app,
    size: events ? { w: 780, h: 540 } : { w: 700, h: 500 },
    pos: { x: 150 + i * 110, y: 70 + i * 40 },
    render: (api) => (events ? <EventsApp project={project} api={api} /> : <ShopApp project={project} />),
  };
});

export const apps: AppDef[] = [
  ...projectApps,
  {
    id: "terminal",
    title: "Terminal",
    icon: "terminal",
    tone: "terminal",
    size: { w: 600, h: 380 },
    pos: { x: 600, y: 330 },
    render: (api) => <TerminalApp api={api} />,
  },
  {
    id: "about",
    title: "about.txt",
    icon: "file",
    tone: "about",
    size: { w: 470, h: 440 },
    pos: { x: 380, y: 130 },
    render: () => <AboutApp />,
  },
  {
    id: "contact",
    title: "Contact",
    icon: "mail",
    tone: "contact",
    size: { w: 470, h: 430 },
    pos: { x: 420, y: 150 },
    render: () => <ContactApp />,
  },
  {
    id: "kernel",
    title: "kernel.plan",
    icon: "chip",
    tone: "kernel",
    size: { w: 500, h: 470 },
    pos: { x: 700, y: 90 },
    render: () => <KernelApp />,
  },
];

export const appById: Record<string, AppDef> = Object.fromEntries(apps.map((a) => [a.id, a]));
