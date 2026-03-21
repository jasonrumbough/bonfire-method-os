import { useState } from "react";

const RHYTHMS = [
  { key: "daily", label: "Daily", icon: "🌅",
    questions: ["What matters most today?", "Where is my energy right now?", "Who needs my leadership today?"] },
  { key: "weekly", label: "Weekly", icon: "📅",
    questions: ["What structure worked or broke down this week?", "What results did this week actually produce?", "Is my calendar reflecting my true priorities?"] },
  { key: "monthly", label: "Monthly", icon: "🗓️",
    questions: ["Is momentum building or quietly stalling?", "Where is capacity stretched too thin?", "Is the vision still clear to everyone carrying it?"] },
  { key: "quarterly", label: "Quarterly", icon: "📆",
    questions: ["Are long-term goals advancing or trapped in short-term execution?", "Are the people carrying the mission healthy enough to sustain it?", "Do the systems still support the mission, or do they need rebuilding?"] },
];

export default function AirPage({ data, update }) {
  const air = data.airRhythm || {};

  const save = (key, subKey, val) => {
    update({ ...data, airRhythm: { ...air, [key]: { ...(air[key] || {}), [subKey]: val, lastUpdated: new Date().toISOString() } } });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">💨 AIR Rhythm</div>
        <div className="page-desc">Audit. Invest. Reflect. The cycle that keeps the fire breathing.</div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>The AIR Cycle</div>
        <div className="three-col">
          {[
            { letter: "A", label: "Audit", desc: "Step back and ask: What is actually happening? Not what you hope — what is true.", color: "#E8593C" },
            { letter: "I", label: "Invest", desc: "Strengthen what matters. Reposition the logs. Clear the ash. Add fuel where needed.", color: "#C9922F" },
            { letter: "R", label: "Reflect", desc: "Turn experience into wisdom. What worked? What drained? What patterns are emerging?", color: "#2A9D8F" },
          ].map(a => (
            <div key={a.letter} style={{ background: "var(--ash)", borderRadius: 10, padding: "1rem", borderTop: "3px solid " + a.color }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: a.color, marginBottom: 6 }}>{a.letter}</div>
              <div style={{ fontWeight: 600, marginBottom: 4, fontSize: "0.9rem" }}>{a.label}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--fog)", lineHeight: 1.5 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {RHYTHMS.map(r => (
        <div key={r.key} className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{r.icon} {r.label} Fire Check</div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--smoke)" }}>
              {(air[r.key] || {}).lastUpdated
                ? "Last: " + new Date((air[r.key]).lastUpdated).toLocaleDateString()
                : "Not started"}
            </div>
          </div>
          {r.questions.map((q, i) => (
            <div key={i} className="form-group">
              <label>{q}</label>
              <textarea rows={2}
                value={((air[r.key] || {})[("q" + (i + 1))]) || ""}
                onChange={e => save(r.key, "q" + (i + 1), e.target.value)}
                placeholder="Reflect honestly..." />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}