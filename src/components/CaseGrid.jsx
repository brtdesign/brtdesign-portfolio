const CASES = [
  {
    slug: "cadence",
    title: "Cadence Fitness",
    summary:
      "Built a unified member hub to keep fitness communities engaged between sessions.",
    focus: ["Member Experience", "Product UI", "Research"],
    year: "2025",
  },
  {
    slug: "owtv",
    title: "OWTV",
    summary:
      "Refreshed product and brand touchpoints for a growing media network.",
    focus: ["Brand", "Product UX", "Web"],
    year: "2024",
  },
  {
    slug: "tag-your-bag",
    title: "Tag Your Bag",
    summary: "Simplified onboarding flows for busy operations teams.",
    focus: ["Service Design", "Prototyping", "Operations UX"],
    year: "2023",
  },
  {
    slug: "xpress-weigh",
    title: "Xpress Weigh",
    summary: "Streamlined weigh-in workflows for logistics teams.",
    focus: ["Systems", "Product UI", "Design Systems"],
    year: "2022",
  },
];

export default function CaseGrid() {
  return (
    <div className="split">
      {CASES.map((item) => (
        <div key={item.slug} className="card">
          <h2>{item.title}</h2>
          <p>{item.summary}</p>
          <p>{item.focus.join(" · ")}</p>
          <a className="button primary" href={`/case-studies/${item.slug}`}>
            View &gt;
          </a>
        </div>
      ))}
    </div>
  );
}
