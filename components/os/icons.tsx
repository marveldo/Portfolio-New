import type { ReactElement } from "react";

export type IconKey = "ticket" | "book" | "terminal" | "file" | "mail" | "chip" | "arrowUpRight" | "back";

const paths: Record<IconKey, ReactElement> = {
  ticket: (
    <>
      <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z" />
      <path d="M14 5v12" strokeDasharray="2 2" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5h-6A.5.5 0 0 1 4 17z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5h6a.5.5 0 0 0 .5-.5z" />
    </>
  ),
  terminal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="m7 10 3 2.5L7 15M12.5 15H17" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  chip: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 9h6v6H9zM9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </>
  ),
  arrowUpRight: <path d="M7 17 17 7M8 7h9v9" />,
  back: <path d="M15 6l-6 6 6 6" />,
};

export function Icon({ name, size = 22 }: { name: IconKey; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const tones: Record<string, string> = {
  events: "bg-accent text-white border-transparent",
  shop: "bg-[#f2c14e] text-[#2a1d0c] border-transparent",
  terminal: "bg-[#0b0b0c] text-[#7cf2b0] border-white/7",
  about: "bg-[#ecebe8] text-[#111] border-white/7",
  contact: "bg-[#2f6bff] text-white border-transparent",
  kernel: "bg-[#1d1d21] text-accent border-white/7",
};

export function AppIcon({ icon, tone, size = 44 }: { icon: IconKey; tone: string; size?: number }) {
  return (
    <span
      className={`flex flex-none items-center justify-center rounded-xl border ${tones[tone] ?? "bg-[#232327] border-white/7"}`}
      style={{ width: size, height: size }}
    >
      <Icon name={icon} size={Math.round(size / 2)} />
    </span>
  );
}
