import { useState } from "react";
import Modal from "../components/Modal";
import ScoreSlider from "../components/ScoreSlider";

export default function HistoryPage({ data, update }) {
  const history = data.history || [];
  // Merge TEND check-ins from allAudits into history display
  const allAudits = data.allAudits || {};
  const tendEntries = Object.entries(allAudits).map(([key, audit]) => {
    // key is either "date" (old) or "date:timeframe" (new)
    const date = audit.date || key.split(":")[0];
    return {
      date,
      key,
      note: [
        audit.timeframe ? audit.timeframe : "",
        audit.priorities?.length ? "Priorities: " + audit.priorities.join(", ") : "",
        audit.wins ? "Wins: " + audit.wins : "",
        audit.notes ? "Notes: " + audit.notes : "",
      ].filter(Boolean).join(" | ") || "TEND check-in",
      overall: isNaN(parseFloat(audit.overall)) ? 0 : parseFloat(audit.overall),
      spark: audit.spark || "",
      systems: audit.systems || "",
      air: audit.air || "",
      timeframe: audit.timeframe || "Daily",
      isTend: true,
    };
  });
  const tendKeys = new Set(tendEntries.map(e => e.key));
  const manualHistory = history.filter(h => !tendKeys.has(h.date));
  const allHistory = [...manualHistory, ...tendEntries];
    const [selectedEntry, setSelectedEntry] = useState(null);
const [modal, setModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ date: "", note: "", overall: 3 });

  const sorted = [...allHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

  const openAdd = () => {
    setEditIdx(null);
    setForm({ date: new Date().toISOString().split("T")[0], note: "", overall: 3 });
    setModal(true);
  };
  const openEdit = (entry) => {
    setEditIdx(entry.isTend ? entry.key : history.indexOf(entry));
    setForm({
      date: entry.date ? entry.date.split("T")[0] : "",
      note: entry.note || "",
      overall: entry.overall || 3,
      timeframe: entry.timeframe || "",
      priorities: (entry.note||"").includes("Priorities:") ? entry.note.split("Priorities:")[1]?.split("|")[0]?.trim() || "" : "",
      wins: entry.wins || "",
      sessionNotes: entry.sessionNotes || "",
      isTend: entry.isTend || false,
      key: entry.key || null,
    });
    setModal(true);
  };

  const save = () => {
    if (form.isTend && form.key) {
      const updatedAudits = { ...(data.allAudits||{}) };
      updatedAudits[form.key] = {
        ...(updatedAudits[form.key]||{}),
        overall: form.overall,
        wins: form.wins,
        notes: form.sessionNotes,
        priorities: form.priorities ? form.priorities.split(",").map(p=>p.trim()).filter(Boolean) : [],
        date: form.date,
      };
      update({ ...data, allAudits: updatedAudits });
    } else {
      let next;
      if (editIdx !== null) {
        next = history.map((h, i) => i === editIdx ? { ...h, date: form.date, note: form.note, overall: form.overall } : h);
      } else {
        next = [...history, { date: form.date, note: form.note, overall: form.overall, scores: {} }];
      }
      next.sort((a, b) => new Date(b.date) - new Date(a.date));
      update({ ...data, history: next });
    }
    setModal(false);
  };

  const del = (entry) => {
    if (entry.isTend) {
      const next = { ...data.allAudits };
      delete next[entry.key];
      update({ ...data, allAudits: next });
    } else {
      update({ ...data, history: history.filter(h => h !== entry) });
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-title">HISTORY</div>
          <div className="page-desc">Your fire's journey — audit results, reflections, and milestones.</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Entry</button>
      </div>

      {/* On This Day */}
      {(()=>{
        const allAudits = data.allAudits || {};
        const today = new Date();
        const mm = today.getMonth()+1, dd = today.getDate();
        const past = Object.entries(allAudits).filter(([date]) => {
          const d = new Date(date);
          return (d.getMonth()+1)===mm && d.getDate()===dd && d.getFullYear()<today.getFullYear();
        }).sort(([a],[b])=>new Date(b)-new Date(a));
        if (!past.length) return null;
        return (
          <div className="card ember-glow" style={{marginBottom:"1.5rem"}}>
            <div style={{fontSize:"0.65rem",color:"var(--ember)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>🕯 On This Day in Past Years</div>
            {past.slice(0,3).map(([date,entry])=>(
              <div key={date} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"var(--ash)",borderRadius:8,marginBottom:6,cursor:"pointer"}} onClick={()=>setSelectedEntry({...entry,date})}>
                <div>
                  <div style={{fontSize:"0.82rem",color:"var(--pale)",fontWeight:600}}>{new Date(date).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</div>
                  {entry.wins&&<div style={{fontSize:"0.72rem",color:"var(--fog)",marginTop:2,fontStyle:"italic"}}>"{entry.wins.substring(0,70)}{entry.wins.length>70?'…':''}"</div>}
                </div>
                <div style={{textAlign:"right",minWidth:40}}>
                  <div style={{fontSize:"1.1rem",fontWeight:700,color:"var(--ember)"}}>{entry.overall||"—"}<span style={{fontSize:"0.7rem",color:"var(--smoke)"}}>/5</span></div>
                  <div style={{fontSize:"0.6rem",color:"var(--smoke)"}}>score</div>
                </div>
              </div>
            ))}
            {past.length>3&&<div style={{fontSize:"0.72rem",color:"var(--smoke)",textAlign:"center",marginTop:4}}>+{past.length-3} more on this date</div>}
          </div>
        );
      })()}


      {sorted.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--smoke)" }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>📋</div>
          No history yet. Run your first audit to begin tracking.
        </div>
      )}

      {sorted.map((entry, i) => {
        const score = entry.overall || 0;
        const color = score >= 4 ? "#5DCAA5" : score >= 2.5 ? "#F0C060" : "#E8593C";
        return (
          <div key={i} className="timeline-item">
            <div className="timeline-dot" style={{ background: color }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.72rem", color: "var(--smoke)", marginBottom: 2 }}>
                {entry.date ? new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) : "Unknown date"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: entry.note ? 4 : 0 }}>
                <span style={{ fontSize: "0.875rem", color: "var(--pale)" }}>Fire Score </span>
                <span style={{ color, fontWeight: 600, fontSize: "1rem" }}>{score.toFixed(1)}</span>
                <span style={{ color: "var(--smoke)", fontSize: "0.78rem" }}>/5.0</span>
              </div>
              {entry.note && (
                <div style={{ fontSize: "0.85rem", color: "var(--fog)", lineHeight: 1.4 }}>{entry.note}</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(entry)}>Edit</button>
              <button className="btn btn-ghost btn-sm" style={{ color: "var(--ember)" }} onClick={() => del(entry)}>Del</button>
            </div>
          </div>
        );
      })}

      {modal && (
        <Modal title={editIdx !== null ? "Edit Entry" : "Add History Entry"} onClose={() => setModal(false)}>
          <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          <div className="form-group">
            <label>Overall Fire Score (0–10)</label>
            <ScoreSlider value={form.overall} onChange={v => setForm(f => ({ ...f, overall: v }))} />
          </div>
          {form.isTend ? (<>
            <div className="form-group"><label>Timeframe</label><input className="input" value={form.timeframe||""} readOnly style={{opacity:0.6}} /></div>
            <div className="form-group"><label>Top Priorities (comma separated)</label><input className="input" value={form.priorities||""} onChange={e => setForm(f => ({ ...f, priorities: e.target.value }))} placeholder="e.g. Close deal, prep presentation" /></div>
            <div className="form-group"><label>Wins</label><textarea className="textarea" rows={2} value={form.wins||""} onChange={e => setForm(f => ({ ...f, wins: e.target.value }))} placeholder="What went well?" /></div>
            <div className="form-group"><label>Session Notes</label><textarea className="textarea" rows={3} value={form.sessionNotes||""} onChange={e => setForm(f => ({ ...f, sessionNotes: e.target.value }))} placeholder="Additional reflections..." /></div>
          </>) : (
            <div className="form-group"><label>Reflection / Note</label><textarea rows={4} value={form.note||""} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="What was happening in this season?" /></div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save</button>
          </div>
        </Modal>
      )}
      {selectedEntry && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}} onClick={()=>setSelectedEntry(null)}>
          <div style={{background:"var(--coal)",borderRadius:12,padding:"1.5rem",maxWidth:500,width:"100%",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:"1.1rem",color:"var(--cream)"}}>{new Date(selectedEntry.date).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
              <button onClick={()=>setSelectedEntry(null)} style={{background:"none",border:"none",color:"var(--smoke)",cursor:"pointer",fontSize:"1.2rem"}}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:"1rem"}}>
              {[["Overall Score",selectedEntry.overall+"/5"],["Spark",selectedEntry.spark+"/5"],["Structure",selectedEntry.structure+"/5"],["Energy",selectedEntry.energy+"/5"],["Support",selectedEntry.support+"/5"],["Time",selectedEntry.time+"/5"],["Money",selectedEntry.money+"/5"],["Story",selectedEntry.story+"/5"]].filter(([,v])=>v&&!v.startsWith("undefined")).map(([label,val])=>(
                <div key={label} style={{padding:"8px 12px",background:"var(--ash)",borderRadius:8}}>
                  <div style={{fontSize:"0.62rem",color:"var(--smoke)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{label}</div>
                  <div style={{fontSize:"0.95rem",color:"var(--pale)",fontWeight:600}}>{val}</div>
                </div>
              ))}
            </div>
            {selectedEntry.wins && <div style={{marginBottom:"1rem"}}><div style={{fontSize:"0.65rem",color:"var(--ember)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Wins</div><div style={{fontSize:"0.875rem",color:"var(--pale)",lineHeight:1.6}}>{selectedEntry.wins}</div></div>}
            {selectedEntry.challenges && <div style={{marginBottom:"1rem"}}><div style={{fontSize:"0.65rem",color:"#C9922F",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Challenges</div><div style={{fontSize:"0.875rem",color:"var(--pale)",lineHeight:1.6}}>{selectedEntry.challenges}</div></div>}
            {selectedEntry.lessons && <div><div style={{fontSize:"0.65rem",color:"#2A9D8F",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Lessons</div><div style={{fontSize:"0.875rem",color:"var(--pale)",lineHeight:1.6}}>{selectedEntry.lessons}</div></div>}
          </div>
        </div>
      )}
    </div>
  );
}