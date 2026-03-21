import React from "react";
import { AUDIT_QUESTIONS } from "../utils/data";

const SIX_P = [
  { p:"Passion",     prompt:"What topics energize you? What work makes you lose track of time?" },
  { p:"Pain",        prompt:"What personal struggles shaped your most meaningful work?" },
  { p:"Pattern",     prompt:"What problems do you keep seeing that others overlook?" },
  { p:"Practice",    prompt:"What skills have you built through years of deliberate work?" },
  { p:"Provision",   prompt:"How does your spark create sustainable financial provision?" },
  { p:"Personality", prompt:"How are you naturally wired to lead? (Visionary, Builder, Shepherd...)" },
];

const P_COLOR = { Passion:"#E8593C", Pain:"#C9922F", Pattern:"#2A9D8F", Practice:"#3478C0", Provision:"#8B5CF6", Personality:"#E8593C" };

function FireBar({ value }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:3}}>
      {[1,2,3,4,5].map(n=>(
        <span key={n} style={{fontSize:"0.9rem",color:value>=n?"#E8593C":"#3D3228"}}>🔥</span>
      ))}
      <span style={{fontSize:"0.72rem",color:"var(--smoke)",marginLeft:4}}>{value||0}/5</span>
    </div>
  );
}

export default function SparkPage({ data, setPage }) {
  const spark = data.spark || {};
  const scores = data.auditScores || {};
  const statement = data.sparkStatement || "";
  const sparkAvg = AUDIT_QUESTIONS.spark.reduce((a,q)=>a+(scores[q.id]||0),0)/AUDIT_QUESTIONS.spark.length;

  return (
    <div>
      <div className="page-header">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div className="page-title">Spark</div>
            <div className="page-desc">Your purpose, your why — the fire that starts everything.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>setPage&&setPage("audit")}
            style={{fontSize:"0.78rem",color:"var(--ember)",borderColor:"rgba(232,89,60,0.4)"}}>
            ✏️ Edit in Audit
          </button>
        </div>
      </div>

      <div className="card ember-glow" style={{marginBottom:"1.5rem"}}>
        <div style={{fontSize:"0.68rem",color:"var(--ember)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>My Spark Statement</div>
        {statement ? (
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.1rem",color:"var(--cream)",lineHeight:1.7,fontStyle:"italic"}}>
            "{statement}"
          </div>
        ) : (
          <div style={{color:"var(--smoke)",fontSize:"0.875rem"}}>
            No Spark Statement yet — <span style={{color:"var(--ember-light)",cursor:"pointer"}} onClick={()=>setPage&&setPage("audit")}>build yours in Audit →</span>
          </div>
        )}
      </div>

      {sparkAvg > 0 && (
        <div className="card" style={{marginBottom:"1rem"}}>
          <div className="card-header">
            <div className="card-title">Spark Score</div>
            <div style={{fontSize:"1.4rem",fontWeight:700,color:"#E8593C"}}>{sparkAvg.toFixed(1)}<span style={{fontSize:"0.8rem",color:"var(--smoke)"}}>/5</span></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {AUDIT_QUESTIONS.spark.map(q=>(
              <div key={q.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"var(--ash)",borderRadius:6}}>
                <span style={{fontSize:"0.78rem",color:"var(--pale)"}}>{q.p}</span>
                <FireBar value={scores[q.id]||0} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title" style={{marginBottom:4}}>The Six Ps</div>
        <div className="card-sub" style={{marginBottom:"1rem"}}>Your spark emerges from the intersection of these six forces.</div>
        {SIX_P.map(item=>{
          const answer = spark[item.p.toLowerCase()] || "";
          return (
            <div key={item.p} style={{marginBottom:16,paddingBottom:16,borderBottom:"1px solid var(--ash)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontSize:"0.62rem",padding:"2px 8px",borderRadius:20,background:"rgba(232,89,60,0.12)",color:P_COLOR[item.p]||"var(--ember)",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600}}>{item.p}</span>
              </div>
              <div style={{fontSize:"0.78rem",color:"var(--smoke)",marginBottom:6}}>{item.prompt}</div>
              {answer ? (
                <div style={{fontSize:"0.875rem",color:"var(--pale)",lineHeight:1.6,padding:"8px 12px",background:"var(--ash)",borderRadius:6}}>{answer}</div>
              ) : (
                <div style={{fontSize:"0.78rem",color:"var(--smoke)",fontStyle:"italic"}}>Not yet answered — add in Audit</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}