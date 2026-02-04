import { useState } from "react";

const CASES = [
  {
    slug: "cadence",
    title: "Cadence Fitness",
    summary: "Built a unified member hub to keep fitness communities engaged between sessions.",
    focus: ["Member Experience", "Product UI", "Research"],
    year: "2025"
  },
  {
    slug: "owtv",
    title: "OWTV",
    summary: "Refreshed product and brand touchpoints for a growing media network.",
    focus: ["Brand", "Product UX", "Web"],
    year: "2024"
  },
  {
    slug: "tag-your-bag",
    title: "Tag Your Bag",
    summary: "Simplified onboarding flows for busy operations teams.",
    focus: ["Service Design", "Prototyping", "Operations UX"],
    year: "2023"
  },
  {
    slug: "xpress-weigh",
    title: "Xpress Weigh",
    summary: "Streamlined weigh-in workflows for logistics teams.",
    focus: ["Systems", "Product UI", "Design Systems"],
    year: "2022"
  }
];

export default function CaseGrid() {
  const [active, setActive] = useState(CASES[0].slug);
  const selected = CASES.find((item) => item.slug === active);

  return (
    <div className="grid">
      <div className="card">
        <p className="chip">Active Case</p>
        <h3 style={{ marginTop: 16 }}>{selected.title}</h3>
        <p style={{ color: "var(--muted)" }}>{selected.summary}</p>
        <div className="tag-list">
          {selected.focus.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <a className="button primary" href={`/case-studies/${selected.slug}`}>
          View case study
        </a>
      </div>
      <div className="card">
        <p className="chip">Select a case</p>
        <div className="timeline" style={{ marginTop: 16 }}>
          {CASES.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setActive(item.slug)}
              className="timeline-item"
              style={{
                textAlign: "left",
                cursor: "pointer",
                borderColor: active === item.slug ? "var(--accent)" : undefined
              }}
            >
              <strong>{item.title}</strong>
              <span style={{ color: "var(--muted)" }}>{item.year}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
