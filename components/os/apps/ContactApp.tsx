"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { btnPrimary, doc } from "../ui";

const label = "mb-3 flex flex-col gap-1.5 text-[12px] text-[#77767c]";
const field =
  "resize-none rounded-[10px] border border-[#2a2a2f] bg-[#111113] px-3 py-2.5 text-[14px] text-[#ecebe8] outline-none focus:border-accent";

export default function ContactApp() {
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  const href = `mailto:${site.email}?subject=${encodeURIComponent("Hello from your portfolio")}&body=${encodeURIComponent(
    `${message}${from ? `\n\n— ${from}` : ""}`,
  )}`;

  return (
    <form className={doc} onSubmit={(e) => e.preventDefault()}>
      <label className={label}>
        To
        <input className={field} value={site.email} readOnly />
      </label>
      <label className={label}>
        From
        <input className={field} value={from} onChange={(e) => setFrom(e.target.value)} placeholder="you@company.com" type="email" />
      </label>
      <label className={label}>
        Message
        <textarea
          className={field}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Let's build something…"
        />
      </label>
      <div className="flex items-center justify-between gap-3 text-[12px]">
        <a className={`${btnPrimary} bg-accent`} href={href}>
          Send
        </a>
        <span className="flex gap-3">
          {site.socials.map((s) => (
            <a key={s.label} className="text-[#8a8990] no-underline hover:text-white" href={s.href} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </span>
      </div>
    </form>
  );
}
