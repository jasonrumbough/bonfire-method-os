import { useState, useEffect } from "react";

export default function SparkPage({ data, update }) {
  const spark = data.spark || {};
  const [form, setForm] = useState({
    target:  spark.target  || "",
    outcome: spark.outcome || "",
    avoid:   spark.avoid   || "",
    method:  spark.method  || "",
  });
  const [saved, setSaved] = useState(false);

  // Build statement dynamically from the four fields
  const buildStatement = (f) => {
    const target  = f.target.trim()  || "[target audience]";
    const outcome = f.outcome.trim() || "[positive outcome]";
    const avoid   = f.avoid.trim()   || "[negative consequence]";
    const method  = f.method.trim()  || "[method/process]";
    return "I help " + target + " achieve " + outcome + " while avoiding " + avoid + " through " + method + ".";
  };

  const statement = buildStatement(form);
  const isComplete = form.target && form.outcome && form.avoid && form.method;

  const save = () => {
    update({ ...data, spark: { ...form }, sparkStatement: isComplete ? statement : data.sparkStatement || "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Auto-save as user types (debounced via useEffect)
  useEffect(() => {
    if (!isComplete) return;
    const t = setTimeout(() => {
      update({ ...data, spark: { ...form }, sparkStatement: statement });
    }, 800);
    return () => clearTimeout(t);
  }, [form.target, form.outcome, form.avoid, form.method]);

  const SIX_P = [
    { p: "Passion",     prompt: "What topics energize you? What work makes you lose track of time?" },
    { p: "Pain",        prompt: "What personal struggles shaped your most meaningful work?" },
    { p: "Pattern",     prompt: "What problems do you keep seeing that others overlook?" },
    { p: "Practice",    prompt: "What skills have you built through years of deliberate work?" },
    { p: "Provision",   prompt: "How does your spark create sustainable financial provision?" },
    { p: "Personality", prompt: "How are you naturally wired to lead? (Visionary, Builder, Shepherd…)" },
  ];

  const fieldStyle = (val) => ({
    borderColor: val.trim() ? "rgba(232,89,60,0.4)" : undefined,
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Spark</div>
        <div className="page-desc">Define the fire that starts everything — your purpose, your why.</div>
      </div>

      {/* Dynamic Spark Statement — top of page, built from the four fields */}
      <div className="card ember-glow" style={{ marginBottom:"1.5rem" }}>
        <div style={{ fontSize:"0.68rem", color:"var(--ember)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:8 }}>
          My Spark Statement
        </div>
        <div style={{
          fontFamily:"var(--font-display)",
          fontSize:"1.1rem",
          color: isComplete ? "var(--cream)" : "var(--smoke)",
          lineHeight:1.7,
          fontStyle:"italic",
          minHeight:"2.5rem",
          transition:"color 0.3s",
        }}>
          {statement}
        </div>
        {!isComplete && (
          <div style={{ fontSize:"0.72rem", color:"var(--smoke)", marginTop:8 }}>
            Fill in all four fields below to complete your statement.
          </div>
        )}
      </div>

      {/* Four builder fields */}
      <div className="card">
        <div className="card-title" style={{ marginBottom:4 }}>Statement Builder</div>
        <div className="card-sub" style={{ marginBottom:"1.25rem" }}>
          I help [Target] achieve [Outcome] while avoiding [Negative] through [Method].
        </div>

        <div className="two-col">
          <div className="form-group">
            <label>Who do you serve? <span style={{ color:"var(--ember)" }}>Target Audience</span></label>
            <input style={fieldStyle(form.target)} value={form.target}
              onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              placeholder="burned-out leaders, high-performing executives..." />
          </div>
          <div className="form-group">
            <label>What do they achieve? <span style={{ color:"var(--ember)" }}>Positive Outcome</span></label>
            <input style={fieldStyle(form.outcome)} value={form.outcome}
              onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}
              placeholder="rebuild clarity and sustainable impact..." />
          </div>
          <div className="form-group">
            <label>What do they avoid? <span style={{ color:"var(--ember)" }}>Negative Consequence</span></label>
            <input style={fieldStyle(form.avoid)} value={form.avoid}
              onChange={e => setForm(f => ({ ...f, avoid: e.target.value }))}
              placeholder="burnout, exhaustion, system collapse..." />
          </div>
          <div className="form-group">
            <label>How do you do it? <span style={{ color:"var(--ember)" }}>Method / Process</span></label>
            <input style={fieldStyle(form.method)} value={form.method}
              onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
              placeholder="the Bonfire Method framework..." />
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, alignItems:"center" }}>
          {saved && <span className="save-confirm">✓ Saved</span>}
          <button className="btn btn-primary" onClick={save} disabled={!isComplete}>
            Save Statement
          </button>
        </div>
      </div>

      {/* Six P's Discovery Notes */}
      <div className="card">
        <div className="card-title" style={{ marginBottom:12 }}>Six P's Discovery</div>
        <div className="card-sub" style={{ marginBottom:"1.25rem" }}>
          Reflect on each source. Your answers here should inform the fields above.
        </div>
        {SIX_P.map(p => (
          <div key={p.p} className="form-group">
            <label style={{ color:"var(--ember-light)", fontSize:"0.82rem" }}>{p.p}</label>
            <div style={{ fontSize:"0.73rem", color:"var(--smoke)", marginBottom:6 }}>{p.prompt}</div>
            <textarea rows={2}
              value={(data.sixPNotes || {})[p.p] || ""}
              onChange={e => update({ ...data, sixPNotes: { ...(data.sixPNotes || {}), [p.p]: e.target.value } })}
              placeholder="Your reflections..." />
          </div>
        ))}
      </div>
    </div>
  );
}