import { useState, useRef } from "react";

const TYPES = ["MBTI (e.g., INTJ)", "DiSC (e.g., High-D)", "Enneagram (e.g., Type 3)", "StrengthsFinder", "KOLBE", "Other"];

export default function PersonalityPage({ data, update }) {
  const personality = data.personality || {};
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState("");
  const fileRef = useRef();

  const save = (key, val) => update({ ...data, personality: { ...personality, [key]: val } });

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setParseResult("");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      const isPdf = file.name.toLowerCase().endsWith(".pdf");
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: isPdf
                ? [
                    { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
                    { type: "text", text: "Extract key personality insights from this assessment. Provide: 1) Type/code/profile, 2) Top 3-5 strengths, 3) Blind spots or derailers, 4) Natural leadership style, 5) What energizes this person. Be concise and practical." }
                  ]
                : [{ type: "text", text: "Extract key personality insights. Provide: 1) Type/code, 2) Top 3-5 strengths, 3) Blind spots, 4) Leadership style, 5) What energizes this person. File: " + file.name }]
            }]
          })
        });
        const d = await res.json();
        const result = d.content?.[0]?.text || "Could not parse file.";
        setParseResult(result);
        save("uploadedInsights", result);
        save("uploadedFileName", file.name);
      } catch (err) {
        setParseResult("Error parsing file. Please enter data manually below.");
      }
      setParsing(false);
    };
    reader.readAsDataURL(file);
  };

  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    update({ ...data, personality: { ...(data.personality||{}), ...personality } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Personality Profile</div>
        <div className="page-desc">Understanding how your fire naturally burns — the Personality P of the Six P's.</div>
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Upload Assessment Report</div>
        <div className="upload-zone" onClick={() => fileRef.current?.click()}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📄</div>
          <div>{parsing ? "Parsing with AI..." : "Click to upload a PDF or document"}</div>
          <div style={{ fontSize: "0.72rem", marginTop: 4, color: "var(--smoke)" }}>DISC, MBTI, StrengthsFinder, Enneagram, etc.</div>
          {parsing && <div style={{ marginTop: 12 }}><span className="spinner" /></div>}
        </div>
        <input type="file" ref={fileRef} style={{ display: "none" }} accept=".pdf,.docx,.doc,.txt" onChange={handleFile} />

        {(parseResult || personality.uploadedInsights) && (
          <div style={{ marginTop: 12, background: "var(--ash)", borderRadius: 8, padding: "1rem", fontSize: "0.85rem", color: "var(--pale)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            <div style={{ fontSize: "0.7rem", color: "var(--ember)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              AI-Extracted Insights {personality.uploadedFileName ? "— " + personality.uploadedFileName : ""}
            </div>
            {parseResult || personality.uploadedInsights}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Manual Profile Entry</div>
        <div className="two-col">
          <div className="form-group">
            <label>Assessment Type</label>
            <select value={personality.assessmentType || ""} onChange={e => save("assessmentType", e.target.value)}>
              <option value="">Select...</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Your Type / Profile Code</label>
            <input value={personality.type || ""} onChange={e => save("type", e.target.value)} placeholder="e.g., INTJ, High-D, Type 3..." />
          </div>
        </div>
        <div className="form-group"><label>Top Strengths</label><textarea rows={3} value={personality.strengths || ""} onChange={e => save("strengths", e.target.value)} placeholder="Your natural strengths..." /></div>
        <div className="form-group"><label>Blind Spots / Derailers</label><textarea rows={2} value={personality.blindSpots || ""} onChange={e => save("blindSpots", e.target.value)} placeholder="Where you need to compensate..." /></div>
        <div className="form-group"><label>How I Lead Best</label><textarea rows={2} value={personality.leadershipStyle || ""} onChange={e => save("leadershipStyle", e.target.value)} placeholder="Your natural leadership wiring..." /></div>
        <div className="form-group"><label>What Energizes Me</label><textarea rows={2} value={personality.energizers || ""} onChange={e => save("energizers", e.target.value)} placeholder="Contexts, activities, roles that give you energy..." /></div>
        <div className="form-group"><label>What Drains Me</label><textarea rows={2} value={personality.drainers || ""} onChange={e => save("drainers", e.target.value)} placeholder="What consistently costs you..." /></div>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginTop:"1.5rem", gap:8, alignItems:"center" }}>
        {saved && <span style={{ fontSize:"0.78rem", color:"#5DCAA5" }}>✓ Saved</span>}
        <button className="btn btn-primary" onClick={handleSave}>💾 Save Personality Profile</button>
      </div>
    </div>
  );
}