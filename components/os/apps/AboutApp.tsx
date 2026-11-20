import { site } from "@/content/site";
import { doc, docH2, docH3, docP } from "../ui";

export default function AboutApp() {
  return (
    <article className={doc}>
      <h2 className={docH2}>{site.about.title}</h2>
      {site.about.paragraphs.map((p) => (
        <p key={p} className={docP}>
          {p}
        </p>
      ))}
      <h3 className={docH3}>Languages</h3>
      <div className="flex flex-wrap gap-1.5">
        {site.languages.map((l) => (
          <span key={l} className="rounded-full border border-[#3a3a40] px-2.5 py-1 font-mono text-[12px]">
            {l}
          </span>
        ))}
      </div>
      <h3 className={docH3}>Next</h3>
      <p className={docP}>{site.about.next}</p>
    </article>
  );
}
