import { site } from "@/content/site";
import { doc, docH2, docP } from "../ui";

const statusTone: Record<string, string> = {
  next: "border-accent text-accent",
  preview: "border-[#2f5a44] text-[#7cf2b0]",
  done: "border-[#2f5a44] text-[#7cf2b0]",
};

export default function KernelApp() {
  return (
    <article className={doc}>
      <small className="font-mono text-[11px] tracking-[0.14em] text-accent">KERNEL.PLAN</small>
      <h2 className={docH2}>The real {site.osName}</h2>
      <p className={docP}>{site.kernel.intro}</p>
      <ol className="mt-4 mb-5 list-none p-0">
        {site.kernel.steps.map((s, i) => (
          <li key={s.label} className="flex items-center justify-between gap-3 border-b border-[#2a2a2f] py-2.75">
            <span>
              <i className="mr-2.5 font-mono text-[#55555c] not-italic">{String(i + 1).padStart(2, "0")}</i>
              {s.label}
            </span>
            <em
              className={`rounded-full border px-2 py-0.5 font-mono text-[11px] not-italic ${
                statusTone[s.status] ?? "border-[#3a3a40] text-[#8a8990]"
              }`}
            >
              {s.status}
            </em>
          </li>
        ))}
      </ol>
      <button className="rounded-[10px] border border-[#3a3a40] px-4 py-2.5 text-[#77767c] disabled:cursor-not-allowed" disabled>
        Boot real kernel · not yet
      </button>
    </article>
  );
}
