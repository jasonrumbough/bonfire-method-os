import { useState } from "react";
import Modal from "../components/Modal";
import ScoreSlider from "../components/ScoreSlider";

export default function HistoryPage({ data, update }) {
  const history = data.history || [];
  const [modal, setModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ date: "", note: "", overall: 3 });

  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

  const openAdd = () => {
    setEditIdx(null);
    setForm({ date: new Date().toISOString().split("T")[0], note: "", overall: 3 });
    setModal(true);
  };
  const openEdit = (entry) => {
    setEditIdx(history.indexOf(entry));
    setForm({ date: entry.date ? entry.date.split("T")[0] : "", note: entry.note || "", overall: entry.overall || 3 });
    setModal(true);
  };

  const save = () => {
    let next;
    if (editIdx !== null) {
      next = history.map((h, i) => i === editIdx ? { ...h, date: form.date, note: form.note, overall: form.overall } : h);
    } else {
      next = [...history, { date: form.date, note: form.note, overall: form.overall, scores: {} }];
    }
    next.sort((a, b) => new Date(b.date) - new Date(a.date));
    update({ ...data, history: next });
    setModal(false);
  };

  const del = (entry) => {
    update({ ...data, history: history.filter(h => h !== entry) });
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-title">History</div>
          <div className="page-desc">Your fire's journey — audit results, reflections, and milestones.</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Entry</button>
      </div>

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
                <span style={{ fontSize: "0.875rem", color: "var(--pale)" }}>Fire Score: </span>
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
          <div className="form-group"><label>Reflection / Note</label><textarea rows={4} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="What was happening in this season?" /></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
}