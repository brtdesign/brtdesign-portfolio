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
    slug: "cascade",
    title: "Cascade Capital",
    summary: "Crafted a calm, trustworthy wealth experience for first-time investors.",
    focus: ["Brand", "Design Systems", "Web"],
    year: "2024"
  },
  {
    slug: "lumen",
    title: "Lumen Health",
    summary: "Built a patient onboarding flow that cut drop-off in half.",
    focus: ["Service Design", "Prototyping", "Growth"],
    year: "2023"
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
