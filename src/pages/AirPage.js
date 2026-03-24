import React from "react";
import { AUDIT_QUESTIONS } from "../utils/data";

const AIR_LABELS = {1:"Never",2:"Rarely",3:"Rarely",4:"Sometimes",5:"Sometimes",6:"Often",7:"Often",8:"Consistently",9:"Consistently",10:"Always"};

const AIR_Qs = [
  {id:"ai1",q:"I regularly audit the health of my fire — not just activity, but actual impact.",p:"Audit"},
  {id:"ai2",q:"I intentionally invest in what the season is asking of me.",p:"Invest"},
  {id:"ai3",q:"I build in structured time to reflect on what the fire has taught me.",p:"Reflect"},
  {id:"ai4",q:"I catch drift early — before small misalignments become large problems.",p:"Audit"},
  {id:"ai5",q:"My rhythms of tending the fire are consistent, not just reactive.",p:"Reflect"},
];

const AIR_RHYTHMS = [
  {key:"daily",label:"Daily",icon:"🌅",questions:["What matters most today?","Where is my energy right now?","Who needs my leadership today?"]},
  {key:"weekly",label:"Weekly",icon:"📅",questions:["What structure worked or broke down this week?","What results did this week actually produce?","Is my calendar reflecting my true priorities?"]},
  {key:"monthly",label:"Monthly",icon:"🗓️",questions:["Is momentum building or quietly stalling?","Where is capacity stretched too thin?","Is the vision still clear to everyone carrying it?"]},
  {key:"quarterly",label:"Quarterly",icon:"📆",questions:["Are long-term goals advancing or trapped in short-term execution?","Are the people carrying the mission healthy enough to sustain it?","Do the systems still support the mission, or do they need rebuilding?"]},
];

export default function AirPage({ data, setPage }) {
  const scores = data.auditScores || {};
  const air = data.airRhythm || {};
  const airAvg = AIR_Qs.reduce((s,q)=>s+(scores[q.id]||0),0)/AIR_Qs.length;

  return (
    <div>
      <div className="page-header">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div className="page-title">AIR</div>
            <div className="page-desc">Audit. Invest. Reflect. The rhythm that keeps the fire breathing.</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={()=>setPage&&setPage("tend")}
            style={{fontSize:"0.78rem",color:"var(--ember)",borderColor:"rgba(232,89,60,0.4)"}}>
            ✏️ Edit in Tend
          </button>
        </div>
      </div>

      <div className="card" style={{marginBottom:"1rem"}}>
        <div className="card-title" style={{marginBottom:12}}>The AIR Cycle</div>
        <div className="three-col">
          {[
            {letter:"A",label:"Audit",desc:"What is actually happening? Not what you hope — what is true.",color:"#E8593C"},
            {letter:"I",label:"Invest",desc:"Strengthen what matters. Reposition the logs. Clear the ash. Add fuel where needed.",color:"#C9922F"},
            {letter:"R",label:"Reflect",desc:"Turn experience into wisdom. What worked? What drained? What patterns are emerging?",color:"#2A9D8F"},
          ].map(a=>(
            <div key={a.letter} style={{background:"var(--ash)",borderRadius:10,padding:"1rem",borderTop:"3px solid "+a.color}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:a.color,marginBottom:6}}>{a.letter}</div>
              <div style={{fontWeight:600,marginBottom:4,fontSize:"0.9rem"}}>{a.label}</div>
              <div style={{fontSize:"0.8rem",color:"var(--fog)",lineHeight:1.5}}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {airAvg > 0 && (
        <div className="card" style={{marginBottom:"1rem"}}>
          <div className="card-header">
            <div className="card-title">AIR Score</div>
            <div style={{fontSize:"1.4rem",fontWeight:700,color:"#2A9D8F"}}>{airAvg.toFixed(1)}<span style={{fontSize:"0.8rem",color:"var(--smoke)"}}>/10</span></div>
          </div>
          {AIR_Qs.map(q=>{
            const val = scores[q.id]||0;
            return (
              <div key={q.id} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:"0.82rem",color:"var(--pale)",flex:1}}>{q.q}</span>
                  <span style={{fontSize:"1rem",fontWeight:700,color:"#2A9D8F",minWidth:40,textAlign:"right"}}>{val||"—"}{val?<span style={{fontSize:"0.65rem",color:"var(--smoke)"}}> {AIR_LABELS[val]}</span>:""}</span>
                </div>
                <div style={{height:6,background:"var(--ash)",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:Math.min(val/10*100,100)+"%",background:"#2A9D8F",borderRadius:3,transition:"width 0.3s"}} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {AIR_RHYTHMS.map(r=>(
        <div key={r.key} className="card" style={{marginBottom:"1rem"}}>
          <div className="card-header">
            <div className="card-title">{r.icon} {r.label} Reflections</div>
            <div style={{fontSize:"0.72rem",color:"var(--smoke)"}}>{(air[r.key]||{}).lastUpdated?"Last: "+new Date(air[r.key].lastUpdated).toLocaleDateString():"Not started"}</div>
          </div>
          {r.questions.map((q,i)=>{
            const ans = (air[r.key]||{})["q"+(i+1)]||"";
            // For daily reflections, fall back to tendJournal data
            const j = data.tendJournal || {};
            const fallbacks = r.key === "daily" ? [
              j.notes_am || j.what_matters || "",
              j.energy || "",
              j.who_needs || "",
            ] : [];
            const display = ans || fallbacks[i] || "";
            return (
              <div key={i} style={{marginBottom:10}}>
                <div style={{fontSize:"0.75rem",color:"var(--smoke)",marginBottom:4}}>{q}</div>
                {display ? (
                  <div style={{fontSize:"0.875rem",color:"var(--pale)",lineHeight:1.6,padding:"8px 12px",background:"var(--ash)",borderRadius:6}}>
                    {display}
                    {!ans && fallbacks[i] && <span style={{fontSize:"0.65rem",color:"var(--smoke)",marginLeft:6,opacity:0.7}}>(from TEND)</span>}
                  </div>
                ) : (
                  <div style={{fontSize:"0.78rem",color:"var(--smoke)",fontStyle:"italic"}}>No entry yet</div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}