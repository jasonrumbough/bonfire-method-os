import { useState } from "react";

const AIR_QUESTIONS = [
  { id: "ai1", q: "I regularly audit the health of my fire — not just activity, but actual impact.", p: "Audit" },
  { id: "ai2", q: "I intentionally invest in what the season is asking of me.", p: "Invest" },
  { id: "ai3", q: "I build in structured time to reflect on what the fire has taught me.", p: "Reflect" },
  { id: "ai4", q: "I catch drift early — before small misalignments become large problems.", p: "Audit" },
  { id: "ai5", q: "My rhythms of tending the fire are consistent, not just reactive.", p: "Reflect" },
];

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

const LABEL_MAP = { 1:"Never",2:"Rarely",3:"Rarely",4:"Sometimes",5:"Sometimes",6:"Often",7:"Often",8:"Consistently",9:"Consistently",10:"Always" };

export default function AirPage({ data, update }) {
  const air = data.airRhythm || {};
  const scores = data.auditScores || {};

  const saveJournal = (key, subKey, val) => {
    update({ ...data, airRhythm: { ...air, [key]: { ...(air[key] || {}), [subKey]: val, lastUpdated: new Date().toISOString() } } });
  };

  const saveScore = (id, val) => {
    update({ ...data, auditScores: { ...scores, [id]: val } });
  };

  const airAvg = AIR_QUESTIONS.reduce((sum, q) => sum + (scores[q.id] || 0), 0) / AIR_QUESTIONS.length;

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

      <div className="card">
        <div className="card-header">
          <div className="card-title">📊 AIR Self-Assessment</div>
          {airAvg > 0 && (
            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#E8593C" }}>
              {airAvg.toFixed(1)} / 10
            </div>
          )}
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--fog)", marginBottom: 16 }}>
          Rate each statement honestly. This score feeds your dashboard.
        </div>
        {AIR_QUESTIONS.map(q => {
          const val = scores[q.id] || 0;
          return (
            <div key={q.id} className="form-group" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <label style={{ margin: 0, flex: 1, paddingRight: 12 }}>{q.q}</label>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 60 }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#E8593C" }}>{val || "—"}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--smoke)", textAlign: "center" }}>{val ? LABEL_MAP[val] : ""}</div>
                </div>
              </div>
              <input type="range" min={1} max={10} value={val || 5}
                onChange={e => saveScore(q.id, parseInt(e.target.value))}
                onMouseDown={() => { if (!val) saveScore(q.id, 5); }}
                style={{ width: "100%", accentColor: "#E8593C" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--smoke)", marginTop: 2 }}>
                <span>1 — Never</span><span>10 — Always</span>
              </div>
            </div>
          );
        })}
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
                onChange={e => saveJournal(r.key, "q" + (i + 1), e.target.value)}
                placeholder="Reflect honestly..." />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
