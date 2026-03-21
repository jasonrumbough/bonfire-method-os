import React, { useState, useEffect } from "react";
import { FireDots } from "../components/StarRating";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../utils/supabase";

const SCORE_LABELS = {
  sp1:"Passion Clarity",sp2:"Work Alignment",sp3:"Pattern Recognition",
  sp4:"Skill Development",sp5:"Financial Provision",sp6:"Personality Alignment",
  sy1:"Structure",sy2:"Yield",sy3:"Support",sy4:"Time",
  sy5:"Energy",sy6:"Money",sy7:"Story",
  ai1:"Audit Rhythm",ai2:"Intentional Investment",ai3:"Reflection Practice",
  ai4:"Drift Prevention",ai5:"Sustainable Growth",
};

const PILLAR_GROUPS = [
  { label:"SPARK — Six P's", keys:["sp1","sp2","sp3","sp4","sp5","sp6"], color:"#E8593C" },
  { label:"S.Y.S.T.E.M.S.",  keys:["sy1","sy2","sy3","sy4","sy5","sy6","sy7"], color:"#C9922F" },
  { label:"AIR Rhythm",       keys:["ai1","ai2","ai3","ai4","ai5"], color:"#2A9D8F" },
];

function scoreColor(v) {
  const n=Number(v)||0;
  if(n>=4) return "#5DCAA5"; if(n>=3) return "#C9922F"; if(n>0) return "#E8593C";
  return "#6B5E52";
}

function pillarAvg(keys, scores) {
  const vals = keys.map(k=>Number(scores[k])||0).filter(v=>v>0);
  return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : "—";
}

function computeOverall(scores) {
  const all = [...PILLAR_GROUPS[0].keys,...PILLAR_GROUPS[1].keys,...PILLAR_GROUPS[2].keys];
  const vals = all.map(k=>Number(scores[k])||0).filter(v=>v>0);
  return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2) : "0";
}

function stripMarkdown(text) {
  return (text||"")
    .replace(/^#{1,6}\s+/gm,"")
    .replace(/\*\*(.*?)\*\*/gs,"$1")
    .replace(/\*(.*?)\*/gs,"$1")
    .replace(/^\s*[-*+]\s+/gm,"")
    .replace(/`([^`]+)`/g,"$1")
    .trim();
}

// Blur everything after "Ready to Turn Up the Heat"
function SummaryWithBlur({ text }) {
  // Blur everything after "Your Single Most Important Next Step:" header
  // The header label itself stays visible, but its content + CTA section are blurred
  const blurKey = "Your Single Most Important Next Step:";
  const headerIdx = text.indexOf(blurKey);
  // visible = everything through and including the header label
  const visible = headerIdx > -1 ? text.slice(0, headerIdx + blurKey.length) : text;
  const blurred = headerIdx > -1 ? text.slice(headerIdx + blurKey.length) : "";

  return (
    <div style={{ fontSize:"0.875rem", color:"#E8DDD5", lineHeight:1.85 }}>
      {visible.split("\n").map((line, i) => {
        const isHeader = line.trim().endsWith(":") && line.trim().length < 70;
        return (
          <span key={i}>
            {isHeader
              ? <strong style={{ color:"var(--ember-light)", display:"block", marginTop:12, marginBottom:2 }}>{line}</strong>
              : line.trim() ? <span style={{ display:"block" }}>{line}</span> : <span style={{ display:"block", height:8 }}/>
            }
          </span>
        );
      })}
      {blurred && (
        <div style={{ position:"relative", marginTop:8 }}>
          <div style={{ filter:"blur(5px)", userSelect:"none", opacity:0.5, pointerEvents:"none", fontSize:"0.875rem", color:"#E8DDD5", lineHeight:1.85 }}>
            {blurred}
          </div>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
            <div style={{ fontSize:"0.85rem", color:"var(--ember-light)", fontWeight:600, textShadow:"0 0 10px #000", textAlign:"center" }}>
              🔥 Unlock the full picture
            </div>
            <div style={{ fontSize:"0.78rem", color:"var(--fog)", textAlign:"center", textShadow:"0 0 8px #000", maxWidth:280 }}>
              A certified Bonfire Method coach will help you apply this to your real life.
            </div>
            <a href="mailto:jason@thebonfirecompany.com?subject=Coaching Request&body=I just completed the Bonfire Method intake and would love to book a coaching session." target="_blank" rel="noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", background:"var(--ember)", color:"#fff", borderRadius:8, textDecoration:"none", fontFamily:"var(--font-display)", fontSize:"0.85rem", fontWeight:600 }}>
              Book a Free Coaching Session →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IntakeResultsPage({ intakeData, onEnterApp }) {
  const scores = intakeData.scores || intakeData.auditScores || {};
  const name = intakeData.name || intakeData.profile?.name || "";
  const sparkStatement = intakeData.sparkStatement || "";
  const overallScore = intakeData.overallScore || computeOverall(scores);
  const userEmail = intakeData.email || intakeData.profile?.email || "";

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [notifyStatus, setNotifyStatus] = useState("");

  // Auto-generate summary + send email on mount — single unified flow
  useEffect(() => {
    generateAndNotify();
  }, []);

  const generateAndNotify = async () => {
    setSummaryLoading(true);

    // Build score context
    const detailedScores = PILLAR_GROUPS.map(g => {
      const lines = g.keys.filter(k=>Number(scores[k])>0)
        .map(k=>"  "+SCORE_LABELS[k]+": "+scores[k]+"/5").join("\n");
      return g.label+" (avg "+pillarAvg(g.keys,scores)+"/5):\n"+(lines||"  No scores");
    }).join("\n\n");

    const prompt = "Write a plain text coaching summary for "+(name||"this leader")+". NO markdown — no ##, no **, no asterisks. Use these 4 plain text section headers exactly (label then colon, content on next line):\n\n"+
      "What's Burning Well:\n[1-2 sentences citing specific high scores by name]\n\n"+
      "What Needs Tending:\n[1-2 sentences citing specific low scores by name]\n\n"+
      "Your Single Most Important Next Step:\n[1 concrete actionable sentence]\n\n"+
      "Ready to Turn Up the Heat?:\n[1 sentence CTA to book a coaching session at thebonfirecompany.com/coaching]\n\n"+
      "Context:\nSpark: "+(sparkStatement||"Not defined")+"\nOverall: "+overallScore+"/5\n\n"+detailedScores;

    let generatedSummary = "";
    try {
      const res = await fetch(SUPABASE_URL+"/functions/v1/coach", {
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+SUPABASE_ANON_KEY},
        body:JSON.stringify({
          messages:[{role:"user",content:prompt}],
          system:"You are a Bonfire Method coach. Reference exact score names. Plain text only — no ##, no **, no asterisks, no markdown.",
          max_tokens:450
        })
      });
      const d = await res.json();
      generatedSummary = stripMarkdown(d.content?.[0]?.text||"");
      setSummary(generatedSummary);
    } catch(e) { console.error("Summary generation error:", e); }

    setSummaryLoading(false);

    // Fire notify email with the summary (whether generated or empty)
    try {
      await fetch(SUPABASE_URL+"/functions/v1/notify", {
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+SUPABASE_ANON_KEY},
        body:JSON.stringify({
          name, email:userEmail, sparkStatement, overallScore,
          coachingSummary: generatedSummary || "(Summary generation pending)",
          scores, profile:intakeData.profile||{}, personality:intakeData.personality||{},
        }),
      });
      setNotifyStatus("done");
    } catch(e) { console.error("Notify error:", e); setNotifyStatus("error"); }
  };

  return (
    <>
      <style>{`@media print{.no-print{display:none!important}body{background:white!important}.report-wrap{background:white!important;padding:0!important;min-height:auto!important}.report-inner{background:white!important;border:1px solid #ddd!important;color:#111!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}`}</style>
      <div className="report-wrap" style={{minHeight:"100vh",background:"var(--coal)",padding:"1.5rem 1rem"}}>
        <div style={{maxWidth:700,margin:"0 auto"}}>

          {/* Top bar */}
          <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.25rem",gap:8,flexWrap:"wrap"}}>
            <div style={{fontFamily:"var(--font-display)",fontSize:"1rem",color:"var(--ember)"}}>🔥 Your Bonfire Assessment</div>
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <button className="btn btn-ghost" onClick={()=>window.print()}>Download PDF</button>
              <button className="btn btn-ghost" onClick={onEnterApp} style={{opacity:0.6}}>Enter App →</button>
            </div>
          </div>

          {notifyStatus==="done" && (
            <div className="no-print" style={{fontSize:"0.72rem",color:"#5DCAA5",textAlign:"right",marginBottom:8,marginTop:-8}}>
              ✓ Results sent to your Bonfire Method coach
            </div>
          )}

          <div className="report-inner" style={{background:"var(--charcoal)",borderRadius:12,overflow:"hidden",border:"1px solid var(--ash)"}}>

            {/* Header banner */}
            <div style={{background:"linear-gradient(135deg,#2C2318,#1A1410)",padding:"2rem",borderBottom:"3px solid #E8593C"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"#E8593C",marginBottom:2}}>🔥 Bonfire Method</div>
                  <div style={{fontSize:"0.7rem",color:"#B09E92",letterSpacing:"0.12em",textTransform:"uppercase"}}>Initial Fire Assessment</div>
                </div>
                <div style={{textAlign:"right"}}>
                  {name&&<div style={{fontFamily:"var(--font-display)",fontSize:"1rem",color:"#F5EFE8"}}>{name}</div>}
                  {userEmail&&<div style={{fontSize:"0.72rem",color:"#B09E92",marginTop:2}}>{userEmail}</div>}
                  <div style={{fontSize:"0.68rem",color:"#6B5E52",marginTop:4}}>
                    {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}
                  </div>
                </div>
              </div>
            </div>

            <div style={{padding:"1.75rem"}}>

              {/* Score cards */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:"1.5rem"}}>
                {[
                  {label:"Overall",  val:overallScore,                           color:"#E8593C"},
                  {label:"SPARK",    val:pillarAvg(PILLAR_GROUPS[0].keys,scores),color:"#E8593C"},
                  {label:"SYSTEMS",  val:pillarAvg(PILLAR_GROUPS[1].keys,scores),color:"#C9922F"},
                  {label:"AIR",      val:pillarAvg(PILLAR_GROUPS[2].keys,scores),color:"#2A9D8F"},
                ].map(s=>(
                  <div key={s.label} style={{background:"var(--ash)",borderRadius:8,padding:"1rem",textAlign:"center",borderTop:"2px solid "+s.color}}>
                    <div style={{fontFamily:"var(--font-display)",fontSize:"1.8rem",color:s.color,lineHeight:1}}>{s.val}</div>
                    <div style={{fontSize:"0.65rem",color:"#B09E92",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:4}}>{s.label}</div>
                    <div style={{fontSize:"0.6rem",color:"#6B5E52",marginTop:2}}>out of 5</div>
                  </div>
                ))}
              </div>

              {/* Spark statement */}
              {sparkStatement&&(
                <div style={{background:"rgba(232,89,60,0.07)",border:"1px solid rgba(232,89,60,0.2)",borderRadius:10,padding:"1rem 1.25rem",marginBottom:"1.5rem"}}>
                  <div style={{fontSize:"0.62rem",color:"#E8593C",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>My Spark Statement</div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:"0.95rem",color:"#F5EFE8",lineHeight:1.65,fontStyle:"italic"}}>"{sparkStatement}"</div>
                </div>
              )}

              {/* Score breakdown */}
              {PILLAR_GROUPS.map(g=>{
                const rated=g.keys.filter(k=>Number(scores[k])>0);
                if(!rated.length) return null;
                return (
                  <div key={g.label} style={{marginBottom:"1.25rem"}}>
                    <div style={{fontSize:"0.68rem",color:g.color,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600,marginBottom:8}}>
                      {g.label} — avg {pillarAvg(g.keys,scores)}/5
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {rated.map(k=>(
                        <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"var(--charcoal)",borderRadius:6,border:"1px solid var(--ash)"}}>
                          <span style={{fontSize:"0.78rem",color:"#E8DDD5"}}>{SCORE_LABELS[k]}</span>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <FireDots value={scores[k]}/>
                            <span style={{fontSize:"0.7rem",color:scoreColor(scores[k]),minWidth:22,textAlign:"right"}}>{scores[k]}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <hr style={{border:"none",borderTop:"1px solid #3D3228",margin:"1.25rem 0"}}/>

              {/* Coaching Summary — auto-generated, blurred after "Ready to Turn Up the Heat" */}
              <div style={{marginBottom:"1.5rem"}}>
                <div style={{fontSize:"0.68rem",color:"#E8593C",textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600,marginBottom:12}}>
                  Coaching Summary
                </div>
                {summaryLoading && (
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"1rem",background:"var(--ash)",borderRadius:8,color:"var(--smoke)",fontSize:"0.82rem"}}>
                    <span className="spinner"/> Analyzing your results and generating your coaching summary...
                  </div>
                )}
                {!summaryLoading && summary && <SummaryWithBlur text={summary}/>}
                {!summaryLoading && !summary && (
                  <div style={{fontSize:"0.82rem",color:"#6B5E52",fontStyle:"italic",padding:"1rem",background:"var(--ash)",borderRadius:8}}>
                    Summary unavailable. Please enter the app to continue.
                  </div>
                )}
              </div>



              <div style={{textAlign:"center",marginTop:"1.25rem",fontSize:"0.62rem",color:"#6B5E52"}}>
                © 2026 Jason Rumbough · The Bonfire Method · thebonfirecompany.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}