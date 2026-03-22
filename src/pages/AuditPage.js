import React from "react";
import { useState, useEffect } from "react";
import { AUDIT_QUESTIONS, ASHES, SYSTEMS } from "../utils/data";
import FireRating from "../components/StarRating";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../utils/supabase";

const todayKey = () => new Date().toISOString().split("T")[0];

const DAILY_FIRE_TAGS = ["reflection","scripture","question","learning","gratitude","challenge","win","idea"];
const TAG_COLOR = { reflection:"ember", scripture:"gold", question:"blue", learning:"teal",
  gratitude:"gold", challenge:"ember", win:"teal", idea:"blue" };

const AIR_RHYTHMS = [
  { key:"daily",     label:"Daily",     questions:["What matters most today?","Where is my energy right now?","Who needs my leadership today?"] },
  { key:"weekly",    label:"Weekly",    questions:["What structure worked or broke down this week?","What results did this week actually produce?","Is my calendar reflecting my true priorities?"] },
  { key:"monthly",   label:"Monthly",   questions:["Is momentum building or quietly stalling?","Where is capacity stretched too thin?","Is the vision still clear to everyone carrying it?"] },
  { key:"quarterly", label:"Quarterly", questions:["Are long-term goals advancing or trapped in short-term execution?","Are the people carrying the mission healthy enough to sustain it?","Do the systems still support the mission, or do they need rebuilding?"] },
];

const RHYTHM_OPTIONS = ["Daily","Every few days","Weekly","Bi-weekly","Monthly","As needed"];

const TABS = [
  { key:"overview",  label:"Overview" },
  { key:"notes",     label:"Notes" },
  { key:"spark",     label:"Spark",   ac:"active-spark" },
  { key:"systems",   label:"SYSTEMS", ac:"active-systems" },
  { key:"rhythm",    label:"Rhythm",  ac:"active-systems" },
];

const SYS_AUDIT_MAP = { structure:"sy1", yield:"sy2", support:"sy3", time:"sy4", energy:"sy5", money:"sy6", story:"sy7" };
const SCORE_LABELS = {
  sp1:"Passion Clarity", sp2:"Work Alignment", sp3:"Pattern Recognition",
  sp4:"Skill Development", sp5:"Financial Provision", sp6:"Personality Alignment",
  sy1:"Structure", sy2:"Yield", sy3:"Support", sy4:"Time", sy5:"Energy", sy6:"Money", sy7:"Story",
  ai1:"Audit Rhythm", ai2:"Intentional Investment", ai3:"Reflection Practice",
  ai4:"Drift Prevention", ai5:"Sustainable Growth",
};

function FireBar({ value, max = 5 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:3 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize:"0.9rem", color: (value/(max||5)*5) >= n ? "#E8593C" : "#3D3228" }}>🔥</span>
      ))}
      <span style={{ fontSize:"0.72rem", color:"var(--smoke)", marginLeft:4 }}>{value || 0}/{max||5}</span>
    </div>
  );
}

export default function AuditPage({ data, update, initialTab = "overview", setPage }) {
  const [pillar, setPillar] = useState(initialTab);
  const [saved, setSaved] = useState(false);
  const [started, setStarted] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryDone, setSummaryDone] = useState(false);

  const today = todayKey();
  const allAudits = data.allAudits || {};
  const hasTodayAudit = !!allAudits[today];
  const baseScores = (started || !hasTodayAudit) ? (data.auditScores || {}) : (allAudits[today]?.scores || data.auditScores || {});
  const [localScores, setLocalScores] = useState(baseScores);

  // Seed baseline: when AuditPage mounts with empty scores but intake data exists, populate from intake
  useEffect(() => {
    const incoming = data.auditScores || {};
    if (Object.keys(incoming).length > 0 && Object.keys(localScores).length === 0) {
      setLocalScores(incoming);
    }
  }, [data.auditScores]);

  const allDailyFire = data.dailyFire || {};
  const todayFire = allDailyFire[today] || { entries: [] };
  const [newEntry, setNewEntry] = useState({ text:"", tag:"reflection" });

  const air = data.airRhythm || {};
  const rhythmSettings = data.rhythmSettings || {};

  const handleScore = (id, val) => { setLocalScores(s => ({ ...s, [id]: val })); setDirty(true); setSaved(false); };
  const startNew = () => { setLocalScores({}); setStarted(true); setSaved(false); setDirty(false); };

  const saveAudit = () => {
    const avg = (qs) => qs.length ? qs.reduce((a,q) => a+(localScores[q.id]||0),0)/qs.length : 0;
    const sp = avg(AUDIT_QUESTIONS.spark);
    const sy = avg(AUDIT_QUESTIONS.systems);
    const ai = avg(AUDIT_QUESTIONS.air);
    const overall = parseFloat(((sp+sy+ai)/3).toFixed(2));
    const entry = { date:new Date().toISOString(), scores:{...localScores}, overall };
    const history = [...(data.history||[]), entry].slice(-24);
    const newAllAudits = { ...allAudits, [today]:{ scores:{...localScores}, overall, savedAt:new Date().toISOString() } };
    update({ ...data, auditScores:localScores, history, allAudits:newAllAudits });
    setStarted(false); setDirty(false); setSaved(true); setTimeout(()=>setSaved(false),2500);
  };

  const addFireEntry = () => {
    if (!newEntry.text.trim()) return;
    const entry = { id:Date.now(), text:newEntry.text.trim(), tag:newEntry.tag,
      time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) };
    update({ ...data, dailyFire:{ ...allDailyFire, [today]:{ ...todayFire, entries:[...(todayFire.entries||[]),entry], date:today } } });
    setNewEntry({ text:"", tag:"reflection" });
  };

  const deleteFireEntry = (id) => {
    update({ ...data, dailyFire:{ ...allDailyFire, [today]:{ ...todayFire, entries:todayFire.entries.filter(e=>e.id!==id) } } });
  };

  const saveAirRhythm = (rhythmKey, i, val) => {
    update({ ...data, airRhythm:{ ...air, [rhythmKey]:{ ...(air[rhythmKey]||{}), ["q"+(i+1)]:val, lastUpdated:new Date().toISOString() } } });
  };

  const saveRhythm = (key, val) => {
    update({ ...data, rhythmSettings:{ ...rhythmSettings, [key]:val } });
  };

  const generateSummary = async () => {
    if (summaryDone || summaryLoading) return;
    setSummaryLoading(true);
    const spAvg = AUDIT_QUESTIONS.spark.reduce((a,q)=>a+(localScores[q.id]||0),0)/AUDIT_QUESTIONS.spark.length;
    const syAvg = AUDIT_QUESTIONS.systems.reduce((a,q)=>a+(localScores[q.id]||0),0)/AUDIT_QUESTIONS.systems.length;
    const aiAvg = AUDIT_QUESTIONS.air.reduce((a,q)=>a+(localScores[q.id]||0),0)/AUDIT_QUESTIONS.air.length;
    const overall = ((spAvg+syAvg+aiAvg)/3).toFixed(2);
    const scoreStr = Object.entries(localScores).filter(([,v])=>v>0)
      .map(([k,v])=>(SCORE_LABELS[k]||k)+": "+v+"/5").join(", ");
    const fireEntries = (todayFire.entries||[]).map(e=>"["+e.tag+"] "+e.text).join("\n")||"None today";
    const prompt = "Based on this leader's audit scores and daily fire journal, give a direct coaching summary for today.\n\n"+
      "Overall: "+overall+"/5\nSpark: "+spAvg.toFixed(1)+" | SYSTEMS: "+syAvg.toFixed(1)+" | AIR: "+aiAvg.toFixed(1)+"\n"+
      "Scores: "+scoreStr+"\nDaily Fire entries:\n"+fireEntries+"\n\n"+
      "Write 3 short paragraphs: (1) what's burning well today, (2) what needs tending most urgently, (3) one concrete action for tomorrow.\nBe specific to the data.";
    try {
      const res = await fetch(SUPABASE_URL+"/functions/v1/coach", {
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+SUPABASE_ANON_KEY},
        body:JSON.stringify({ messages:[{role:"user",content:prompt}], system:"You are a Bonfire Method coach. Be direct, specific, grounded in the data provided.", max_tokens:600 })
      });
      const d = await res.json();
      setSummary(d.content?.[0]?.text || "Could not generate summary.");
      setSummaryDone(true);
    } catch { setSummary("Error generating summary."); }
    setSummaryLoading(false);
  };

  const isAuditPillar = ["spark","systems"].includes(pillar);
  const questions = AUDIT_QUESTIONS[pillar] || [];
  const canSave = isAuditPillar && (started || !hasTodayAudit || dirty);

  // Overview calculations
  const spScore = AUDIT_QUESTIONS.spark.reduce((a,q)=>a+(localScores[q.id]||0),0)/AUDIT_QUESTIONS.spark.length||0;
  const syScore = AUDIT_QUESTIONS.systems.reduce((a,q)=>a+(localScores[q.id]||0),0)/AUDIT_QUESTIONS.systems.length||0;
  const aiScore = AUDIT_QUESTIONS.air.reduce((a,q)=>a+(localScores[q.id]||0),0)/AUDIT_QUESTIONS.air.length||0;
  const todayOverall = ((spScore+syScore+aiScore)/3).toFixed(2);

  return (
    <div>
      <div className="page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div className="page-title">Audit</div>
          <div className="page-desc">Self-assessment, rhythm, and reflection — your single place for honest review.</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {dirty && isAuditPillar && <button className="btn btn-primary" onClick={saveAudit}>Save Changes</button>}
          {isAuditPillar && !started && <button className="btn btn-ghost" onClick={startNew}>+ New Audit</button>}
        </div>
      </div>

      {hasTodayAudit && !started && isAuditPillar && (
        <div style={{ background:"rgba(42,157,143,0.1)", border:"1px solid rgba(42,157,143,0.25)", borderRadius:10, padding:"0.75rem 1rem", marginBottom:"1rem", fontSize:"0.82rem", color:"#5DCAA5", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>Saved today · overall: <strong>{allAudits[today].overall}</strong>{dirty && <span style={{color:"var(--gold-light)",marginLeft:8}}>· Unsaved changes</span>}</span>
          <button className="btn btn-ghost btn-sm" onClick={startNew} style={{color:"#5DCAA5",borderColor:"#2A9D8F"}}>New Check-in</button>
        </div>
      )}

      <div className="pillar-tabs">
        {TABS.map(t => (
          <button key={t.key}
            className={"pillar-tab "+(pillar===t.key?(t.ac||"active-systems"):"")}
            onClick={()=>{ if(t.key==="notes" && setPage){ setPage("notes"); } else { setPillar(t.key); } }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {pillar==="overview" && (
        <div>
          {/* Score summary */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:"1.5rem" }}>
            {[
              { label:"Today",   val:hasTodayAudit ? todayOverall : "—", color:"#E8593C" },
              { label:"Spark",   val:spScore.toFixed(1), color:"#E8593C" },
              { label:"SYSTEMS", val:syScore.toFixed(1), color:"#C9922F" },
              { label:"AIR",     val:aiScore.toFixed(1), color:"#2A9D8F" },
            ].map(s => (
              <div key={s.label} style={{ background:"var(--ash)", borderRadius:8, padding:"0.875rem", textAlign:"center", borderTop:"2px solid "+s.color }}>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"1.6rem", color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:"0.65rem", color:"var(--smoke)", textTransform:"uppercase", letterSpacing:"0.08em", marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick score overview */}
          <div className="card">
            <div className="card-title" style={{marginBottom:12}}>Current Scores at a Glance</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[...AUDIT_QUESTIONS.spark,...AUDIT_QUESTIONS.systems,...AUDIT_QUESTIONS.air]
                .filter(q=>localScores[q.id]>0)
                .map(q=>(
                <div key={q.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"var(--ash)",borderRadius:6}}>
                  <span style={{fontSize:"0.75rem",color:"var(--pale)"}}>{SCORE_LABELS[q.id]||q.id}</span>
                  <FireBar value={localScores[q.id]||0} max={q.id&&q.id.startsWith("ai")?10:5} />
                </div>
              ))}
            </div>
            {Object.keys(localScores).filter(k=>localScores[k]>0).length===0 && (
              <div style={{textAlign:"center",padding:"1rem",color:"var(--smoke)",fontSize:"0.82rem"}}>
                No scores yet — complete the Spark and SYSTEMS tabs to populate.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NOTES (Daily Fire) ── */}
      {pillar === "notes" && (
        <div>
        </div>
      )}

      {/* ── SPARK / SYSTEMS audit questions ── */}
      {isAuditPillar && (
        <div className="card">
          <div style={{marginBottom:"1rem"}}>
            <div className="card-title">{pillar==="spark"?"Spark — Six P's":"SYSTEMS Audit"}</div>
            <div className="card-sub" style={{marginTop:4}}>
              Rate each 1–5. More fire = stronger.
              {dirty&&<span style={{color:"var(--gold-light)",marginLeft:8,fontSize:"0.75rem"}}>· Unsaved changes</span>}
            </div>
          </div>
          {questions.map(q=>(
            <div key={q.id} className="audit-question">
              <div className="audit-q"><span>{q.p} — </span>{q.q}</div>
              <FireRating value={localScores[q.id]||0} onChange={v=>handleScore(q.id,v)} />
            </div>
          ))}
          <hr className="divider"/>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center"}}>
            {saved&&<span className="save-confirm">✓ Saved to history</span>}
            {canSave&&<button className="btn btn-primary" onClick={saveAudit}>{dirty?"Save Changes":"Save Audit Results"}</button>}
          </div>
        </div>
      )}

      {/* ── SPARK / SYSTEMS audit questions ── */}
      {isAuditPillar && (
        <div className="card">
          <div style={{marginBottom:"1rem"}}>
            <div className="card-title">{pillar==="spark"?"Spark — Six P's":"SYSTEMS Audit"}</div>
            <div className="card-sub" style={{marginTop:4}}>
              Rate each 1–5. More fire = stronger.
              {dirty&&<span style={{color:"var(--gold-light)",marginLeft:8,fontSize:"0.75rem"}}>· Unsaved changes</span>}
            </div>
          </div>
          {questions.map(q=>(
            <div key={q.id} className="audit-question">
              <div className="audit-q"><span>{q.p} — </span>{q.q}</div>
              <FireRating value={localScores[q.id]||0} onChange={v=>handleScore(q.id,v)} />
            </div>
          ))}
          <hr className="divider"/>
          <div style={{display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center"}}>
            {saved&&<span className="save-confirm">✓ Saved to history</span>}
            {canSave&&<button className="btn btn-primary" onClick={saveAudit}>{dirty?"Save Changes":"Save Audit Results"}</button>}
          </div>
        </div>
      )}

      {/* ── Daily Fire (SYSTEMS tab) ── */}
      {pillar === "systems" && (
        <div>
          {/* Daily Fire entries today */}
          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div className="card-title">Daily Fire — {today}</div>
              <div style={{ fontSize:"0.72rem", color:"var(--smoke)" }}>{(todayFire.entries||[]).length} entries</div>
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:"1rem" }}>
              <select value={newEntry.tag} onChange={e=>setNewEntry(n=>({...n,tag:e.target.value}))} style={{width:"auto",minWidth:120}}>
                {DAILY_FIRE_TAGS.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <input style={{flex:1}} value={newEntry.text}
                onChange={e=>setNewEntry(n=>({...n,text:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&addFireEntry()}
                placeholder="Scripture, question, insight, win..." />
              <button className="btn btn-primary" onClick={addFireEntry} disabled={!newEntry.text.trim()}>Add</button>
            </div>
            {(todayFire.entries||[]).length===0 ? (
              <div style={{textAlign:"center",padding:"1.5rem",color:"var(--smoke)",fontSize:"0.875rem"}}>No entries yet today.</div>
            ) : (
              [...(todayFire.entries||[])].reverse().map(entry=>(
                <div key={entry.id} style={{display:"flex",gap:10,padding:"0.6rem 0.75rem",background:"var(--ash)",borderRadius:8,marginBottom:6}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <span className={"pill pill-"+(TAG_COLOR[entry.tag]||"smoke")}>{entry.tag}</span>
                      <span style={{fontSize:"0.68rem",color:"var(--smoke)"}}>{entry.time}</span>
                    </div>
                    <div style={{fontSize:"0.875rem",color:"var(--pale)",lineHeight:1.5}}>{entry.text}</div>
                  </div>
                  <button onClick={()=>deleteFireEntry(entry.id)} style={{background:"none",border:"none",color:"var(--smoke)",cursor:"pointer",fontSize:"1rem",padding:"0 4px",alignSelf:"flex-start"}}>×</button>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ── AIR ── */}
      {pillar==="air" && (
        <div>
          {/* Rhythm setting */}
          <div className="card" style={{marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div className="card-title">AIR Rhythm</div>
                <div className="card-sub" style={{marginTop:2}}>How often do you want to complete this check-in?</div>
              </div>
              <select value={rhythmSettings.air||"Daily"} onChange={e=>saveRhythm("air",e.target.value)}
                style={{width:"auto",minWidth:140}}>
                {RHYTHM_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="three-col" style={{marginBottom:"1.5rem"}}>
            {[
              {letter:"A",label:"Audit",  desc:"What is actually happening? Not what you hope — what is true.",color:"#E8593C"},
              {letter:"I",label:"Invest", desc:"Strengthen what matters. Clear the ash. Add fuel where needed.",color:"#C9922F"},
              {letter:"R",label:"Reflect",desc:"Turn experience into wisdom. What worked? What patterns emerge?",color:"#2A9D8F"},
            ].map(a=>(
              <div key={a.letter} style={{background:"var(--ash)",borderRadius:10,padding:"1rem",borderTop:"3px solid "+a.color}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:"1.6rem",color:a.color,marginBottom:4}}>{a.letter}</div>
                <div style={{fontWeight:600,marginBottom:4,fontSize:"0.9rem",color:"var(--cream)"}}>{a.label}</div>
                <div style={{fontSize:"0.78rem",color:"var(--fog)",lineHeight:1.5}}>{a.desc}</div>
              </div>
            ))}
          </div>
                    {/* AIR Self-Assessment Sliders */}
          <div className="card" style={{marginBottom:"1rem"}}>
            <div className="card-header">
              <div className="card-title">📊 AIR Self-Assessment</div>
              {(()=>{const avg=[{id:"ai1"},{id:"ai2"},{id:"ai3"},{id:"ai4"},{id:"ai5"}].reduce((s,q)=>s+(localScores[q.id]||0),0)/5;return avg>0?<div style={{fontSize:"1.1rem",fontWeight:700,color:"#E8593C"}}>{avg.toFixed(1)} / 10</div>:null;})()}
            </div>
            <div style={{fontSize:"0.85rem",color:"var(--fog)",marginBottom:16}}>Rate each statement honestly. This score feeds your dashboard.</div>
            {[
              {id:"ai1",q:"I regularly audit the health of my fire — not just activity, but actual impact."},
              {id:"ai2",q:"I intentionally invest in what the season is asking of me."},
              {id:"ai3",q:"I build in structured time to reflect on what the fire has taught me."},
              {id:"ai4",q:"I catch drift early — before small misalignments become large problems."},
              {id:"ai5",q:"My rhythms of tending the fire are consistent, not just reactive."},
            ].map(q=>{
              const val=localScores[q.id]||0;
              const labels={1:"Never",2:"Rarely",3:"Rarely",4:"Sometimes",5:"Sometimes",6:"Often",7:"Often",8:"Consistently",9:"Consistently",10:"Always"};
              return (
                <div key={q.id} className="form-group" style={{marginBottom:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <label style={{margin:0,flex:1,paddingRight:12}}>{q.q}</label>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:60}}>
                      <div style={{fontSize:"1.4rem",fontWeight:700,color:"#E8593C"}}>{val||"—"}</div>
                      <div style={{fontSize:"0.65rem",color:"var(--smoke)"}}>{val?labels[val]:""}</div>
                    </div>
                  </div>
                  <input type="range" min={1} max={10} value={val||5}
                    onChange={e=>handleScore(q.id,parseInt(e.target.value))}
                    onMouseDown={()=>{if(!val)handleScore(q.id,5);}}
                    style={{width:"100%",accentColor:"#E8593C"}} />
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",color:"var(--smoke)",marginTop:2}}>
                    <span>1 — Never</span><span>10 — Always</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{marginBottom:"1rem"}}>
            <hr className="divider"/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"0.78rem",color:"var(--smoke)"}}>Saves AIR scores to profile + history</span>
              <button className="btn btn-primary" onClick={saveAudit}>💾 Save AIR Scores</button>
            </div>
          </div>

{AIR_RHYTHMS.map(r=>(
            <div key={r.key} className="card">
              <div className="card-header">
                <div><div className="card-title">{r.label} Check-in</div></div>
                <div style={{fontSize:"0.72rem",color:"var(--smoke)"}}>
                  {(air[r.key]||{}).lastUpdated?"Last: "+new Date(air[r.key].lastUpdated).toLocaleDateString():"Not started"}
                </div>
              </div>
              {r.questions.map((q,i)=>(
                <div key={i} className="form-group">
                  <label>{q}</label>
                  <textarea rows={2} value={((air[r.key]||{})["q"+(i+1)])||""}
                    onChange={e=>saveAirRhythm(r.key,i,e.target.value)} placeholder="Reflect honestly..." />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── ASHES ── */}
      {pillar==="ashes" && (
        <div>
          {/* Rhythm setting */}
          <div className="card" style={{marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div className="card-title">ASHES Check Frequency</div>
                <div className="card-sub" style={{marginTop:2}}>How often do you want to run this burnout diagnostic?</div>
              </div>
              <select value={rhythmSettings.ashes||"Weekly"} onChange={e=>saveRhythm("ashes",e.target.value)}
                style={{width:"auto",minWidth:140}}>
                {RHYTHM_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="card">
            <div style={{marginBottom:"1rem"}}>
              <div className="card-title">ASHES Diagnostic</div>
              <div style={{marginTop:8,padding:"0.6rem 0.9rem",background:"rgba(232,89,60,0.08)",borderRadius:8,fontSize:"0.78rem",color:"var(--fog)",lineHeight:1.5}}>
                Rate how strongly each symptom is present.{" "}
                <strong style={{color:"var(--ember-light)"}}>More fire = more severe. Lower is healthier.</strong>
              </div>
            </div>
            {ASHES.map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q">
                  <span style={{background:"rgba(232,89,60,0.15)",padding:"1px 7px",borderRadius:4,marginRight:8}}>{q.letter} — {q.label}</span>{q.q}
                </div>
                <FireRating value={localScores[q.id]||0} onChange={v=>handleScore(q.id,v)} inverted={true} />
              </div>
            ))}
            <hr className="divider"/>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center"}}>
              {saved&&<span className="save-confirm">✓ Saved</span>}
              {(dirty||!hasTodayAudit)&&<button className="btn btn-primary" onClick={saveAudit}>Save</button>}
            </div>
          </div>
        </div>
      )}

      {/* ── RHYTHM ── */}
      {pillar === "rhythm" && (
        <div>
          <div className="card" style={{marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div className="card-title">🔄 Routine Check-in</div>
                <div className="card-sub" style={{marginTop:2}}>A full review across all four pillars — Spark, SYSTEMS, AIR, and ASHES.</div>
              </div>
              <select value={rhythmSettings.rhythm||"Weekly"} onChange={e=>saveRhythm("rhythm",e.target.value)}
                style={{width:"auto",minWidth:140}}>
                {["Weekly","Monthly","Quarterly","Annually"].map(o=><option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Spark questions */}
          <div className="card" style={{marginBottom:"1rem"}}>
            <div className="card-title" style={{marginBottom:4}}>🔥 Spark</div>
            <div className="card-sub" style={{marginBottom:12}}>Rate each 1–5. More fire = stronger alignment.</div>
            {AUDIT_QUESTIONS.spark.map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q"><span>{q.p} — </span>{q.q}</div>
                <FireRating value={localScores[q.id]||0} onChange={v=>handleScore(q.id,v)} />
              </div>
            ))}
          </div>

          {/* SYSTEMS questions */}
          <div className="card" style={{marginBottom:"1rem"}}>
            <div className="card-title" style={{marginBottom:4}}>⚙️ SYSTEMS</div>
            <div className="card-sub" style={{marginBottom:12}}>Rate each 1–5. More fire = stronger systems.</div>
            {AUDIT_QUESTIONS.systems.map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q"><span>{q.p} — </span>{q.q}</div>
                <FireRating value={localScores[q.id]||0} onChange={v=>handleScore(q.id,v)} />
              </div>
            ))}
          </div>

          {/* AIR questions */}
          <div className="card" style={{marginBottom:"1rem"}}>
            <div className="card-title" style={{marginBottom:4}}>💨 AIR</div>
            <div className="card-sub" style={{marginBottom:12}}>Rate each 1–10. How consistently are you tending the fire?</div>
            {[
              {id:"ai1",q:"I regularly audit the health of my fire — not just activity, but actual impact."},
              {id:"ai2",q:"I intentionally invest in what the season is asking of me."},
              {id:"ai3",q:"I build in structured time to reflect on what the fire has taught me."},
              {id:"ai4",q:"I catch drift early — before small misalignments become large problems."},
              {id:"ai5",q:"My rhythms of tending the fire are consistent, not just reactive."},
            ].map(q=>{
              const val=localScores[q.id]||0;
              const labels={1:"Never",2:"Rarely",3:"Rarely",4:"Sometimes",5:"Sometimes",6:"Often",7:"Often",8:"Consistently",9:"Consistently",10:"Always"};
              return (
                <div key={q.id} className="audit-question" style={{marginBottom:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div className="audit-q" style={{margin:0,flex:1,paddingRight:12}}>{q.q}</div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:60}}>
                      <div style={{fontSize:"1.2rem",fontWeight:700,color:"#2A9D8F"}}>{val||"—"}</div>
                      <div style={{fontSize:"0.65rem",color:"var(--smoke)"}}>{val?labels[val]:""}</div>
                    </div>
                  </div>
                  <input type="range" min={1} max={10} value={val||5}
                    onChange={e=>handleScore(q.id,parseInt(e.target.value))}
                    onMouseDown={()=>{if(!val)handleScore(q.id,5);}}
                    style={{width:"100%",accentColor:"#2A9D8F"}} />
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",color:"var(--smoke)",marginTop:2}}>
                    <span>1 — Never</span><span>10 — Always</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ASHES questions */}
          <div className="card" style={{marginBottom:"1rem"}}>
            <div className="card-title" style={{marginBottom:4}}>💀 ASHES</div>
            <div style={{marginTop:8,marginBottom:12,padding:"0.6rem 0.9rem",background:"rgba(232,89,60,0.08)",borderRadius:8,fontSize:"0.82rem",color:"var(--fog)",lineHeight:1.5}}>
              Rate how strongly each burnout symptom is present. <strong style={{color:"var(--ember-light)"}}>More fire = more severe. Lower is healthier.</strong>
            </div>
            {ASHES.map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q">
                  <span style={{background:"rgba(232,89,60,0.15)",padding:"1px 7px",borderRadius:4,marginRight:6,fontSize:"0.72rem",color:"var(--ember-light)"}}>{q.p}</span>
                  {q.q}
                </div>
                <FireRating value={localScores[q.id]||0} onChange={v=>handleScore(q.id,v)} inverted={true} />
              </div>
            ))}
          </div>

          {/* Save */}
          <div className="card">
            <hr className="divider"/>
            <div style={{display:"flex",justifyContent:"flex-end",gap:10,alignItems:"center"}}>
              <span style={{fontSize:"0.78rem",color:"var(--smoke)"}}>Saves to profile + history</span>
              <button className="btn btn-primary" onClick={saveAudit}>💾 Save Rhythm Check-in</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SUMMARY ── */}
      {pillar==="summary" && (
        <div>
          {/* Score cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:"1.5rem"}}>
            {[
              {label:"Today's Score", val:hasTodayAudit?allAudits[today].overall:"—", color:"#E8593C"},
              {label:"Spark",         val:spScore.toFixed(1), color:"#E8593C"},
              {label:"SYSTEMS",       val:syScore.toFixed(1), color:"#C9922F"},
              {label:"AIR",           val:aiScore.toFixed(1), color:"#2A9D8F"},
            ].map(s=>(
              <div key={s.label} style={{background:"var(--ash)",borderRadius:8,padding:"1rem",textAlign:"center",borderTop:"2px solid "+s.color}}>
                <div style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:s.color,lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:"0.62rem",color:"var(--smoke)",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:4,lineHeight:1.3}}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div className="card-title">Coaching Summary</div>
                <div className="card-sub" style={{marginTop:2}}>AI coaching insights based on today's audit and Daily Fire entries</div>
              </div>
              {!summaryDone && (
                <button className="btn btn-primary btn-sm" onClick={generateSummary} disabled={summaryLoading}>
                  {summaryLoading?<><span className="spinner" style={{width:12,height:12}}/> Generating...</>:"Generate Summary"}
                </button>
              )}
              {summaryDone && <span style={{fontSize:"0.75rem",color:"#5DCAA5"}}>✓ Ready</span>}
            </div>
            {summaryLoading && (
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"1rem",background:"var(--ash)",borderRadius:8,color:"var(--smoke)",fontSize:"0.82rem"}}>
                <span className="spinner"/> Generating your summary...
              </div>
            )}
            {!summaryLoading && summary && (
              <div style={{fontSize:"0.875rem",color:"var(--pale)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{summary}</div>
            )}
            {!summaryLoading && !summary && (
              <div style={{fontSize:"0.82rem",color:"var(--smoke)",fontStyle:"italic",padding:"1rem",background:"var(--ash)",borderRadius:8}}>
                Complete your Spark and SYSTEMS audits, then click Generate Summary for personalized coaching insights.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}