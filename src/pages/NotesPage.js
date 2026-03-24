import { useState, useRef } from "react";
import Modal from "../components/Modal";

const TAGS = ["general", "spark", "systems", "air", "coaching", "idea", "inspiration", "question", "win", "challenge"];
const TAG_PILL = { general: "pill-smoke", spark: "pill-ember", systems: "pill-gold", air: "pill-teal", coaching: "pill-blue", idea: "pill-gold", scripture: "pill-gold", question: "pill-blue", win: "pill-teal", challenge: "pill-ember" };

export default function NotesPage({ data, update }) {
  const notes = Array.isArray(data.notes) ? data.notes : [];
  const [filters, setFilters] = useState(['all']);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', tag: 'general', image: null });
  const imgRef = useRef(null);
  const noteFileRef = useRef(null);

  const toggleFilter = (tag) => {
    if (tag === 'all') { setFilters(['all']); return; }
    setFilters(prev => {
      const arr = Array.isArray(prev) ? prev : ['all'];
      const without = arr.filter(t => t !== 'all');
      const has = without.includes(tag);
      const next = has ? without.filter(t => t !== tag) : [...without, tag];
      return next.length === 0 ? ['all'] : next;
    });
  };

  const openNew = () => { setEditing(null); setForm({ title: '', content: '', tag: 'general', image: null }); setModal(true); };
  const openEdit = (note) => { setEditing(note.id); setForm({ title: note.title||'', content: note.content||'', tag: note.tag||'general', image: note.image||null }); setModal(true); };

  const save = () => {
    if (!form.content.trim() && !form.image) return;
    const now = new Date().toISOString();
    let next;
    if (editing) {
      next = notes.map(n => n.id === editing ? { ...n, ...form, updatedAt: now } : n);
    } else {
      next = [{ id: Date.now(), ...form, createdAt: now, updatedAt: now }, ...notes];
    }
    update({ ...data, notes: next });
    setModal(false);
  };

  const del = (e, id) => { e.stopPropagation(); update({ ...data, notes: notes.filter(n => n.id !== id) }); };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const filtered = (Array.isArray(notes) ? notes : [])
    .filter(n => filters.includes('all') || filters.includes(n.tag))
    .filter(n => !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase()) || n.tag?.includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-title">NOTES</div>
          <div className="page-desc">Capture insights, reflections, and ideas as they surface.</div>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ New Note</button>
      </div>

      {/* Search */}
      <div className="form-group" style={{ marginBottom: "1rem" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." />
      </div>

      {/* Tag filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {["all", ...TAGS].map(t => (
          <button key={t} onClick={() => toggleFilter(t)}
            style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid " + (filters.includes(t) ? "var(--ember)" : "var(--ash)"), background: filters.includes(t) ? "rgba(232,89,60,0.15)" : "transparent", color: filters.includes(t) ? "var(--ember-light)" : "var(--smoke)", cursor: "pointer", fontSize: "0.75rem", fontFamily: "var(--font-body)", textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--smoke)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>📓</div>
            {search ? "No notes matching your search." : filters.includes('all') ? "No notes yet. Capture your first insight." : "No " + filters.join(', ') + " notes yet."}
        </div>
      )}

      {filtered.map(note => (
        <div key={note.id} className="note-card" onClick={() => openEdit(note)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              {note.title && <div style={{ fontWeight: 500, color: "var(--cream)", fontSize: "0.9rem", marginBottom: 2 }}>{note.title}</div>}
              <div className="note-date">{new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className={"pill " + (TAG_PILL[note.tag] || "pill-smoke")}>{note.tag}</span>
              <button className="btn btn-ghost btn-sm" style={{ padding: "2px 8px" }} onClick={e => del(e, note.id)}>×</button>
            </div>
          </div>
          {note.image && (
            <div style={{ marginBottom: 8 }}>
              <img src={note.image} alt="note attachment" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 6, objectFit: "cover" }} />
            </div>
          )}
          {note.content && (
            <div style={{ fontSize: "0.875rem", color: "var(--pale)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", lineHeight: 1.5 }}>
              {note.content}
            </div>
          )}
        </div>
      ))}

      {modal && (
        <Modal title={editing ? "Edit Note" : "New Note"} onClose={() => setModal(false)}>
          <div className="form-group"><label>Title (optional)</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Note title..." /></div>
          <div className="form-group">
            <label>Tag</label>
            <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}>
              {TAGS.map(t => <option key={t} value={t} style={{ textTransform: "capitalize" }}>{t}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Note</label><textarea rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Your thoughts..." /></div>
          
          {/* Image upload */}
          <div className="form-group">
            <label>Image (optional)</label>
            {form.image ? (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img src={form.image} alt="preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 6, display: "block" }} />
                <button onClick={() => setForm(f => ({ ...f, image: null }))}
                  style={{ position: "absolute", top: 4, right: 4, background: "rgba(26,20,16,0.8)", border: "none", color: "var(--pale)", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: "0.8rem" }}>×</button>
              </div>
            ) : (
              <div className="upload-zone" onClick={() => noteFileRef.current?.click()} style={{ padding: "1rem" }}>
                <div style={{ fontSize: "0.875rem" }}>Click to upload an image</div>
                <div style={{ fontSize: "0.72rem", marginTop: 2, color: "var(--smoke)" }}>JPG, PNG, GIF supported</div>
              </div>
            )}
            <input type="file" ref={noteFileRef} style={{ display: "none" }} accept="image/*" onChange={handleImageUpload} />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>{editing ? "Update" : "Save"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}