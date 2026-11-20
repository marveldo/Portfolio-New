"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/content/site";
import { demoCategories, demoEvents, naira, type DemoEvent } from "@/content/demo";
import type { OsApi } from "../types";
import { btnPrimary, doneText, emptyText, linkBack, pageTitle } from "../ui";

type View =
  | { name: "list" }
  | { name: "detail"; id: number }
  | { name: "order"; id: number; reference: string }
  | { name: "ticket"; id: number; reference: string | null };

const row = "flex items-center justify-between border-b border-dashed border-[#ece8e2] py-2.75 text-[13px]";
const rowLabel = "text-[#8a857d]";
const payField = "mb-2 flex justify-between rounded-[10px] border border-[#ece8e2] px-3 py-2.5 text-[13px]";

const newReference = () => "evt_" + Math.random().toString(16).slice(2, 10);

function Poster({ event, big = false }: { event: DemoEvent; big?: boolean }) {
  return (
    <span
      className={`relative block overflow-hidden ${big ? "min-h-65 rounded-[14px] mobile:min-h-45" : "h-27.5"}`}
      style={{ background: event.hue }}
    >
      <i className="absolute -top-10 -right-7.5 h-30 w-30 rounded-full bg-white/22" />
      <i className="absolute -bottom-5 left-5 h-15 w-15 rounded-full bg-black/15" />
      <i className="absolute top-[30%] left-[60%] h-3.5 w-3.5 rounded-full bg-white" />
      <em className="absolute top-2.5 left-3 rounded-full bg-black/25 px-2 py-0.75 text-[11px] font-semibold text-white not-italic">{event.category}</em>
    </span>
  );
}

function Qr({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let h = 2166136261;
    for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return Array.from({ length: 49 }, () => {
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return (h >>> 0) % 2 === 0;
    });
  }, [seed]);
  return (
    <div className="grid grid-cols-[repeat(7,10px)] gap-0.5 rounded-lg bg-white p-2.5" aria-hidden="true">
      {cells.map((on, i) => (
        <i key={i} className={`h-2.5 w-2.5 ${on ? "bg-[#16151a]" : "bg-[#eee]"}`} />
      ))}
    </div>
  );
}

export default function EventsApp({ project, api }: { project: Project; api: OsApi }) {
  const [view, setView] = useState<View>({ name: "list" });
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [checkout, setCheckout] = useState<"closed" | "open" | "verifying">("closed");

  const list = demoEvents.filter(
    (e) => (category === "All" || e.category === category) && e.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const current = "id" in view ? demoEvents.find((e) => e.id === view.id) : undefined;
  const back = (
    <button className={`${linkBack} mx-5 mt-4`} onClick={() => setView({ name: "list" })}>
      ← All events
    </button>
  );

  const pay = (event: DemoEvent, reference: string) => {
    setCheckout("verifying");
    window.setTimeout(() => {
      setCheckout("closed");
      setView({ name: "ticket", id: event.id, reference });
      api.toast("Payment received", `${naira(event.price)} · ${reference} settled`, project.id);
    }, 1100);
  };

  return (
    <div className="relative min-h-full bg-[#faf8f5] text-[#16151a]">
      <div className="sticky top-0 z-2 flex items-center gap-3.5 border-b border-[#ece8e2] bg-[#faf8f5] px-5 py-3.5">
        <b className="text-[20px] tracking-[-0.03em] text-accent">{project.name.toLowerCase()}</b>
        <input
          className="min-w-0 flex-1 rounded-[10px] border border-[#e3ded6] bg-white px-3 py-2 text-[13px] text-[#16151a] outline-none focus:border-accent"
          placeholder="Search events"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setView({ name: "list" });
          }}
        />
        <span className="text-[12px] whitespace-nowrap text-[#8a857d] mobile:hidden">guest · demo</span>
      </div>

      {view.name === "list" && (
        <>
          <div className="flex flex-wrap gap-1.5 px-5 pt-3.5 pb-1">
            {demoCategories.map((c) => (
              <button key={c} className={`rounded-full border px-3 py-1.5 text-[12px] ${
                  c === category ? "border-[#16151a] bg-[#16151a] text-white" : "border-[#e3ded6] text-[#55524d]"
                }`} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3.5 px-5 pt-3.5 pb-5.5 mobile:grid-cols-2">
            {list.map((e) => (
              <button key={e.id} className="overflow-hidden rounded-[14px] border border-[#ece8e2] bg-white text-left transition-[translate,box-shadow] duration-200 hover:-translate-y-0.75 hover:shadow-[0_12px_30px_rgba(22,21,26,0.1)]" onClick={() => setView({ name: "detail", id: e.id })}>
                <Poster event={e} />
                <span className="flex flex-col gap-0.75 p-3">
                  <b className="text-[14px]">{e.title}</b>
                  <small className="text-[12px] text-[#8a857d]">
                    {e.date} · {e.city}
                  </small>
                  <span className={`mt-1.5 text-[12px] font-semibold${e.price ? "" : " text-[#13a36f]"}`}>{naira(e.price)}</span>
                </span>
              </button>
            ))}
            {list.length === 0 && <p className={emptyText}>No events match.</p>}
          </div>
        </>
      )}

      {view.name === "detail" && current && (
        <>
          {back}
          <div className="grid grid-cols-[1fr_1fr] gap-6 px-5 pt-4 pb-6 mobile:grid-cols-[1fr]">
            <Poster event={current} big />
            <div>
              <small className="text-[12px] text-[#8a857d]">
                {current.date} · 6:00 PM · {current.city}
              </small>
              <h2 className={pageTitle}>{current.title}</h2>
              <p className="mt-0 mb-4 leading-[1.55] text-[#55524d]">{current.description}</p>
              <div className="mb-5.5 flex items-center gap-2 text-[13px] text-[#55524d]">
                <span className="h-6 w-6 rounded-full bg-[#e3ded6]" />
                Hosted by [Organizer]
              </div>
              <button
                className={`${btnPrimary} bg-accent`}
                onClick={() =>
                  current.price
                    ? setView({ name: "order", id: current.id, reference: newReference() })
                    : setView({ name: "ticket", id: current.id, reference: null })
                }
              >
                {current.price ? `Click to Register · ${naira(current.price)}` : "Register · Free"}
              </button>
            </div>
          </div>
        </>
      )}

      {view.name === "order" && current && (
        <>
          {back}
          <div className="mx-auto my-6 max-w-105 rounded-2xl border border-[#ece8e2] bg-white p-6">
            <small className="text-[11px] tracking-[0.12em] text-[#8a857d]">ORDER CREATED</small>
            <h2 className={pageTitle}>{current.title}</h2>
            <div className={row}>
              <span className={rowLabel}>Reference</span>
              <code>{view.reference}</code>
            </div>
            <div className={row}>
              <span className={rowLabel}>Amount</span>
              <b>{naira(current.price)}</b>
            </div>
            <div className={row}>
              <span className={rowLabel}>Status</span>
              <span className="rounded-full bg-[#fff3d6] px-2.25 py-0.75 text-[11px] font-semibold text-[#a36a00]">pending</span>
            </div>
            <button className={`${btnPrimary} mt-4.5 w-full bg-accent`} onClick={() => setCheckout("open")}>
              Proceed to checkout
            </button>
          </div>
          {checkout !== "closed" && (
            <div className="absolute inset-0 z-5 flex min-h-full animate-sheet-in items-center justify-center bg-[rgba(22,21,26,0.45)]" onClick={() => checkout === "open" && setCheckout("closed")}>
              <div className="w-80 animate-card-in rounded-2xl bg-white p-5.5 shadow-[0_30px_60px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col gap-0.5">
                  <b>Test checkout</b>
                  <small className="text-[12px] text-[#8a857d]">Demo only — no real payment</small>
                </div>
                <div className="my-3.5 text-[32px] font-bold tracking-[-0.03em]">{naira(current.price)}</div>
                <div className={payField}>
                  <span className={rowLabel}>Card</span>
                  <code>•••• •••• •••• 4081</code>
                </div>
                <div className={payField}>
                  <span className={rowLabel}>Email</span>
                  <code>guest@demo.dev</code>
                </div>
                <button className={`${btnPrimary} mt-2 w-full bg-[#0ba360]`} disabled={checkout === "verifying"} onClick={() => pay(current, view.reference)}>
                  {checkout === "verifying" ? "Verifying…" : `Pay ${naira(current.price)}`}
                </button>
                <button className="mt-2 w-full text-[13px] text-[#8a857d]" disabled={checkout === "verifying"} onClick={() => setCheckout("closed")}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {view.name === "ticket" && current && (
        <>
          {back}
          <div className="flex flex-col items-center px-5 py-6">
            <div className="flex w-130 max-w-full animate-pop overflow-hidden rounded-[18px] text-white shadow-[0_20px_50px_rgba(22,21,26,0.18)]" style={{ background: current.hue }}>
              <div className="min-w-0 flex-1 border-r-2 border-dashed border-white/50 px-6 py-5.5">
                <small className="text-[11px] tracking-[0.2em] opacity-80">ADMIT ONE</small>
                <h2 className="mt-2 mb-1.5 text-[26px] tracking-[-0.03em]">{current.title}</h2>
                <p className="mt-0 mb-3.5 text-[13px] opacity-90">
                  {current.date} · {current.city}
                </p>
                <code className="text-[12px] opacity-85">{view.reference ?? `free-${current.id}`}</code>
              </div>
              <div className="flex w-37.5 flex-none items-center justify-center bg-black/12">
                <Qr seed={view.reference ?? `free-${current.id}`} />
              </div>
            </div>
            <p className={doneText}>
              {view.reference
                ? "You're registered. Order paid and attendee added in one transaction."
                : "You're registered. Free event, no checkout needed."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
