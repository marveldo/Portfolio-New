export type ProjectApp = "events" | "shop";

export type Project = {
  id: string;
  name: string;
  app: ProjectApp;
  summary: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
};

export type KernelStep = {
  label: string;
  status: "done" | "next" | "planned" | "preview";
};

export const site = {
  name: "[Your Name]",
  handle: "[name]",
  osName: "[name]OS",
  role: "Software developer",
  location: "Lagos",
  timeZone: "Africa/Lagos",
  email: "[email@domain.com]",
  headline: ["I build both sides", "of the", "screen."],
  intro:
    "Interfaces people touch and the services underneath them. My work lives on that desk. Boot it and use it.",
  languages: ["Python", "TypeScript", "Go", "C++"],
  socials: [
    { label: "GitHub", href: "https://github.com/[username]" },
    { label: "LinkedIn", href: "https://linkedin.com/in/[username]" },
    { label: "X", href: "https://x.com/[username]" },
  ],
  about: {
    title: "Hi, I'm [Your Name].",
    paragraphs: [
      "I build products end to end: the interface people touch and the services underneath that keep it fast and correct.",
      "Lately: an event platform with real payments and live notifications, a bookstore, and a lot of time inside event loops.",
    ],
    next: "Writing an operating system. This desktop is where it will live. Open kernel.plan to follow along.",
  },
  kernel: {
    version: "preview build 0.1",
    intro:
      "This desktop is a browser shell. The kernel is the long project. When it boots, it boots here, emulated in your browser.",
    steps: [
      { label: "Bootloader", status: "next" },
      { label: "Memory manager", status: "planned" },
      { label: "Scheduler", status: "planned" },
      { label: "Filesystem", status: "planned" },
      { label: "Shell (you are looking at its preview)", status: "preview" },
    ] satisfies KernelStep[],
  },
};

export const projects: Project[] = [
  {
    id: "evento",
    name: "Evento",
    app: "events",
    summary: "Event discovery, ticketing with Paystack checkout and live notifications.",
    stack: ["Next.js", "C++ / Drogon", "PostgreSQL", "Redis", "WebSockets"],
  },
  {
    id: "mbooks",
    name: "mbooks",
    app: "shop",
    summary: "Online bookstore with cart and Paystack checkout.",
    stack: ["Paystack", "[stack]"],
  },
];
