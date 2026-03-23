import React, { useState, useEffect } from "react";
import { AUDIT_QUESTIONS } from "../utils/data";

const SIX_P = [
  { p:"Passion",     key:"passion",     prompt:"What topics energize you? What work makes you lose track of time?" },
  { p:"Pain",        key:"pain",        prompt:"What personal struggles shaped your most meaningful work?" },
  { p:"Pattern",     key:"pattern",     prompt:"What problems do you keep seeing that others overlook?" },
  { p:"Practice",    key:"practice",    prompt:"What skills have you built through years of deliberate work?" },
  { p:"Provision",   key:"provision",   prompt:"How does your spark create sustainable financial provision?" },
  { p:"Personality", key:"personality", prompt:"How are you naturally wired to lead? (Visionary, Builder, Shepherd...)" },
];

const P_COLOR = { Passion:"#E8593C", Pain:"#C9922F", Pattern:"#2A9D8F", Practice:"#3478C0", Provision:"#8B5CF6", Personality:"#E8593C" };

function FireBar({ value, max=5 }) {
  const v = parseFloat(value) || 0;
  const lit = max === 5 ? v : (v / max * 5);
  return (
    <div style={{display:"flex",alignItems:"center",gap:3}}>
      {[1,2,3,4,5].map(n=>(
        <span key={n} style={{fontSize:"0.9rem",color:lit>=n?"#E8593C":"#3D3228"}}>🔥</span>
      ))}
      <span style={{fontSize:"0.72rem",color:"var(--smoke)",marginLeft:4}}>{v||0}/{max}</span>
    </div>
  );
}

export default function SparkPage({ data, update, setPage }) {
  const spark = data.spark || {};
  const scores = data.auditScores || {};
  const [form, setForm] = useState({
    target:  data.spark?.target  || "",
    outcome: data.spark?.outcome || "",
    avoid:   data.spark?.avoid   || "",
    method:  data.spark?.method  || "",
  });
  const [sixP, setSixP] = useState({
    passion: spark.passion || "", pain: spark.pain || "",
    pattern: spark.pattern || "", practice: spark.practice || "",
    provision: spark.provision || "", personality: spark.personality || "",
  });
  const [saved, setSaved] = useState(false);

  const isComplete = form.target && form.outcome && form.avoid && form.method;
  const statement = isComplete
    ? `I help ${form.target} achieve ${form.outcome} while avoiding ${form.avoid} through ${form.method}.`
    : "Complete the four fields below to build your Spark Statement.";

  const sparkAvg = AUDIT_QUESTIONS.spark.reduce((a,q)=>a+(scores[q.id]||0),0)/AUDIT_QUESTIONS.spark.length;

  const save = () => {
    update({ ...data, spark: { ...form, ...sixP }, sparkStatement: isComplete ? statement : data.sparkStatement });
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  useEffect(()=>{
    if (!isComplete) return;
    const t = setTimeout(()=>{ update({ ...data, spark: { ...form, ...sixP }, sparkStatement: statement }); }, 800);
    return ()=>clearTimeout(t);
  }, [form.target, form.outcome, form.avoid, form.method]);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">SPARK</div>
        <div className="page-desc">Your purpose, your why — the fire that starts everything.</div>
      </div>

      <div className="card ember-glow" style={{marginBottom:"1.5rem"}}>
        <div style={{fontSize:"0.68rem",color:"var(--ember)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>My Spark Statement</div>
        <div style={{fontFamily:"var(--font-display)",fontSize:"1.1rem",color:isComplete?"var(--cream)":"var(--smoke)",lineHeight:1.7,fontStyle:"italic",minHeight:"2.5rem"}}>
          {statement}
        </div>
      </div>

      {sparkAvg > 0 && (
        <div className="card" style={{marginBottom:"1rem"}}>
          <div className="card-header">
            <div className="card-title">SPARK Score</div>
            <div style={{fontSize:"1.4rem",fontWeight:700,color:"#E8593C"}}>{sparkAvg.toFixed(1)}<span style={{fontSize:"0.8rem",color:"var(--smoke)"}}>/5</span></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {AUDIT_QUESTIONS.spark.map(q=>(
              <div key={q.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"var(--ash)",borderRadius:6}}>
                <span style={{fontSize:"0.78rem",color:"var(--pale)"}}>{q.p}</span>
                <FireBar value={scores[q.id]||0} max={5} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{marginBottom:"1rem"}}>
        <div className="card-title" style={{marginBottom:4}}>Statement Builder</div>
        <div className="card-sub" style={{marginBottom:"1.25rem"}}>I help [Target] achieve [Outcome] while avoiding [Negative] through [Method].</div>
        <div className="two-col">
          <div className="form-group">
            <label>Who do you serve? <span style={{color:"var(--ember)"}}>Target Audience</span></label>
            <input value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} placeholder="burned-out leaders..." />
          </div>
          <div className="form-group">
            <label>What do they achieve? <span style={{color:"var(--ember)"}}>Positive Outcome</span></label>
            <input value={form.outcome} onChange={e=>setForm(f=>({...f,outcome:e.target.value}))} placeholder="clarity and sustainable impact..." />
          </div>
          <div className="form-group">
            <label>What do they avoid? <span style={{color:"var(--ember)"}}>Negative Outcome</span></label>
            <input value={form.avoid} onChange={e=>setForm(f=>({...f,avoid:e.target.value}))} placeholder="burnout and exhaustion..." />
          </div>
          <div className="form-group">
            <label>How? <span style={{color:"var(--ember)"}}>Method or Framework</span></label>
            <input value={form.method} onChange={e=>setForm(f=>({...f,method:e.target.value}))} placeholder="the Bonfire Method..." />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{marginBottom:4}}>The Six Ps</div>
        <div className="card-sub" style={{marginBottom:"1rem"}}>Reflect on each source of your spark. Your answers are saved automatically.</div>
        {SIX_P.map(item=>(
          <div key={item.p} style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{fontSize:"0.62rem",padding:"2px 8px",borderRadius:20,background:"rgba(232,89,60,0.12)",color:P_COLOR[item.p]||"var(--ember)",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600}}>{item.p}</span>
            </div>
            <label style={{fontSize:"0.78rem",color:"var(--smoke)",display:"block",marginBottom:4}}>{item.prompt}</label>
            <textarea rows={2} value={sixP[item.key]||""} placeholder="Your reflection..."
              onChange={e=>{const v=e.target.value;setSixP(p=>({...p,[item.key]:v}));update({...data,spark:{...form,...sixP,[item.key]:v}});}}
            />
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
          <button className="btn btn-primary" onClick={save}>{saved?"✓ Saved":"💾 Save"}</button>
        </div>
      </div>
    </div>
  );
}