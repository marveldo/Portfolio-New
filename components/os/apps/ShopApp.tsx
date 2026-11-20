"use client";

import { useState } from "react";
import type { Project } from "@/content/site";
import { demoBooks, naira } from "@/content/demo";
import { btnPrimary, doneText, emptyText, linkBack, pageTitle } from "../ui";

const serif = "[font-family:Georgia,serif]";
const outlineBtn = "rounded-full border border-[#2a1d0c]";
const qtyBtn = `h-6 w-6 leading-none ${outlineBtn}`;

type View = "shop" | "cart" | "done";

export default function ShopApp({ project }: { project: Project }) {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [view, setView] = useState<View>("shop");
  const [paying, setPaying] = useState(false);

  const lines = Object.entries(cart).map(([id, qty]) => ({ book: demoBooks.find((b) => b.id === Number(id))!, qty }));
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.book.price * l.qty, 0);

  const add = (id: number) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: number) =>
    setCart((c) => {
      const next = { ...c };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });

  const checkout = () => {
    setPaying(true);
    window.setTimeout(() => {
      setPaying(false);
      setCart({});
      setView("done");
    }, 900);
  };

  return (
    <div className="min-h-full bg-[#f4efe6] text-[#2a1d0c]">
      <div className="sticky top-0 z-2 flex items-center justify-between border-b border-[#e4dccd] bg-[#f4efe6] px-5 py-3.5">
        <b className={`${serif} text-[22px] italic`}>{project.name}</b>
        <button className={`${outlineBtn} px-3.5 py-1.5 text-[13px]`} onClick={() => setView("cart")}>
          Cart <span className="ml-1 inline-block min-w-4.5 rounded-full bg-[#2a1d0c] px-1.25 text-center text-[11px] text-[#f4efe6]">{count}</span>
        </button>
      </div>

      {view === "shop" && (
        <div className="grid grid-cols-3 gap-4.5 p-5 mobile:grid-cols-2">
          {demoBooks.map((b) => (
            <div key={b.id} className="group">
              <div
                className="flex aspect-3/4 flex-col justify-between rounded-[4px_10px_10px_4px] px-3.5 py-4 shadow-[inset_6px_0_0_rgba(0,0,0,0.25),0_10px_24px_rgba(42,29,12,0.2)] transition-transform duration-250 group-hover:-translate-y-1 group-hover:-rotate-1"
                style={{ background: b.cover, color: b.ink }}>
                <b className={`${serif} text-[18px] leading-[1.15]`}>{b.title}</b>
                <small className="text-[11px] opacity-85">{b.author}</small>
              </div>
              <div className="flex items-center justify-between px-0.5 pt-2.5 text-[13px] font-semibold">
                <span>{naira(b.price)}</span>
                <button className={`${outlineBtn} px-3 py-1 text-[12px] hover:bg-[#2a1d0c] hover:text-[#f4efe6]`} onClick={() => add(b.id)}>{cart[b.id] ? `Added · ${cart[b.id]}` : "Add"}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "cart" && (
        <div className="px-7 py-6">
          <h2 className={pageTitle}>Your cart</h2>
          {count === 0 && <p className={emptyText}>Your cart is empty.</p>}
          {lines.map(({ book, qty }) => (
            <div key={book.id} className="grid grid-cols-[28px_1fr_auto_90px] items-center gap-3 border-b border-[#e4dccd] py-2.5 text-[14px]">
              <span className="h-8 w-6 rounded-[2px_5px_5px_2px]" style={{ background: book.cover }} />
              <b>{book.title}</b>
              <span className="inline-flex items-center gap-2.5">
                <button className={qtyBtn} aria-label={`Remove one ${book.title}`} onClick={() => remove(book.id)}>
                  −
                </button>
                {qty}
                <button className={qtyBtn} aria-label={`Add one ${book.title}`} onClick={() => add(book.id)}>
                  +
                </button>
              </span>
              <span className="text-right">{naira(book.price * qty)}</span>
            </div>
          ))}
          {count > 0 && (
            <>
              <div className="flex justify-between py-4 text-[16px]">
                <span>Total</span>
                <b>{naira(total)}</b>
              </div>
              <button className={`${btnPrimary} w-full bg-accent`} disabled={paying} onClick={checkout}>
                {paying ? "Processing…" : `Checkout · ${naira(total)}`}
              </button>
            </>
          )}
          <button className={`${linkBack} mt-4 block`} onClick={() => setView("shop")}>
            ← Keep browsing
          </button>
        </div>
      )}

      {view === "done" && (
        <div className="px-7 py-6">
          <h2 className={pageTitle}>Order confirmed</h2>
          <p className={doneText}>Paid with test checkout. A receipt went to guest@demo.dev.</p>
          <button className={`${linkBack} mt-4 block`} onClick={() => setView("shop")}>
            ← Back to the shelf
          </button>
        </div>
      )}
    </div>
  );
}
