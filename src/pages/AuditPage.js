import React from "react";
import { useState, useEffect, useCallback } from "react";
import { AUDIT_QUESTIONS, ASHES, SYSTEMS } from "../utils/data";
import FireRating from "../components/StarRating";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../utils/supabase";

// ── Timeframe options ──────────────────────────────────────────────────────
const TIMEFRAMES = [
  { key:"daily_am",   label:"Daily · Morning",   icon:"🌅" },
  { key:"daily_pm",   label:"Daily · Evening",   icon:"🌙" },
  { key:"weekly",     label:"Weekly",             icon:"📅" },
  { key:"monthly",    label:"Monthly",            icon:"🗓" },
  { key:"quarterly",  label:"Quarterly",          icon:"📊" },
  { key:"semiannual", label:"Semi-Annual",        icon:"🔥" },
  { key:"annual",     label:"Annual Review",     icon:"🏆" },
];

// ── FireRating display bar ─────────────────────────────────────────────────
function FireBar({ value, max=5 }) {
  const v = parseFloat(value) || 0;
  const lit = max === 5 ? v : (v / max * 5);
  return (
    <div style={{display:"flex",alignItems:"center",gap:3}}>
      {[1,2,3,4,5].map(n=>(
        <span key={n} style={{fontSize:"0.9rem",color:lit>=n?"#E8593C":"#3D3228"}}>🔥</span>
      ))}
      <span style={{fontSize:"0.72rem",color:"var(--smoke)",marginLeft:4}}>{v}/{max}</span>
    </div>
  );
}


// Convert present-tense question to past tense for review sections
function pastTense(q) {
  return q.q.replace(/^I can /, "I was able to ").replace(/^I have /, "I had ").replace(/^I am /, "I was ").replace(/^I consistently /, "I consistently ").replace(/^I regularly /, "I regularly ").replace(/^My /, "My ");
}
// ── Section card wrapper ───────────────────────────────────────────────────
function Section({ title, sub, children }) {
  return (
    <div className="card" style={{marginBottom:"1rem"}}>
      <div className="card-title" style={{marginBottom:sub?4:12}}>{title}</div>
      {sub && <div className="card-sub" style={{marginBottom:12}}>{sub}</div>}
      {children}
    </div>
  );
}

export default function AuditPage({ data, update, setPage }) {
  const today = new Date().toISOString().split("T")[0];
  const todayLabel = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
  const [tf, setTf] = useState("daily_am");
  const [scores, setScores] = useState(() => {
    // Reset scores daily — don't carry over previous day's ratings
    const today = new Date().toISOString().split("T")[0];
    const lastSaved = data.lastAuditDate || "";
    return lastSaved === today ? (data.auditScores||{}) : {};
  });
  const [journal, setJournal] = useState(() => ({ ...(data.tendJournal||{}) }));
  const [priorities, setPriorities] = useState(["","",""]);
  const [saved, setSaved] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  // Sync scores from data if changed externally
  useEffect(() => { setScores(s => ({...(data.auditScores||{}), ...s})); }, []);

  const setScore = (id, val) => setScores(s => ({...s, [id]:val}));
  const setJ = (key, val) => setJournal(j => ({...j, [key]:val}));

  const save = () => {
    const allAudits = data.allAudits || {};
    const spAvg = AUDIT_QUESTIONS.spark.reduce((a,q)=>a+(scores[q.id]||0),0)/AUDIT_QUESTIONS.spark.length;
    const syAvg = AUDIT_QUESTIONS.systems.reduce((a,q)=>a+(scores[q.id]||0),0)/AUDIT_QUESTIONS.systems.length;
    const airAvg = AUDIT_QUESTIONS.air.reduce((a,q)=>a+(scores[q.id]||0),0)/AUDIT_QUESTIONS.air.length;
    const overall = ((spAvg+syAvg+airAvg)/3).toFixed(1);
    update({
      ...data,
      auditScores: scores,
      lastAuditDate: today,
      tendJournal: journal,
      allAudits: {
        ...allAudits,
        [today]: { ...allAudits[today], overall, spark:spAvg.toFixed(1), systems:syAvg.toFixed(1), air:airAvg.toFixed(1),
          wins: journal.wins||"", challenges: journal.challenges||"", lessons: journal.lessons||"", timeframe: tf }
      }
    });
    setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  };

  const genSummary = async () => {
    setSummaryLoading(true);
    const stmt = data.sparkStatement || "";
    const syScores = AUDIT_QUESTIONS.systems.map(q=>q.p+":"+( scores[q.id]||0)).join(", ");
    const prompt = `Leader spark: "${stmt}". Today (${todayLabel}). SYSTEMS scores: ${syScores}. Priorities: ${priorities.filter(Boolean).join(", ")||"not set"}. Journal notes: ${journal.notes_am||"none"}.\n\nWrite a focused 2-paragraph coaching insight for today. Paragraph 1: what's aligned. Paragraph 2: what needs the most attention. Be direct and specific.`;
    try {
      const r = await fetch(SUPABASE_URL+"/functions/v1/coach",{method:"POST",headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+SUPABASE_ANON_KEY},body:JSON.stringify({messages:[{role:"user",content:prompt}],system:"You are a direct Bonfire Method coach. Be specific, not generic."})});
      const d = await r.json();
      setSummary(d.content?.[0]?.text||"");
    } catch(e){ setSummary("Could not generate summary."); }
    setSummaryLoading(false);
  };

  // ── Spark statement display ──────────────────────────────────────────────
  const sparkStmt = data.sparkStatement;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div className="page-title">TEND</div>
          <div className="page-desc">{todayLabel}</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {saved && <span style={{fontSize:"0.78rem",color:"#5DCAA5"}}>✓ Saved</span>}
          <button className="btn btn-primary" onClick={save}>💾 Save</button>
        </div>
      </div>

      {/* Timeframe selector */}
      <div className="card" style={{marginBottom:"1.5rem",padding:"1rem"}}>
        <label style={{fontSize:"0.65rem",color:"var(--smoke)",textTransform:"uppercase",letterSpacing:"0.1em",display:"block",marginBottom:8}}>Select Check-In Type</label>
        <select value={tf} onChange={e=>setTf(e.target.value)}
          style={{width:"100%",background:"var(--ash)",color:"var(--cream)",border:"1px solid var(--coal-light)",borderRadius:8,padding:"10px 14px",fontSize:"0.9rem",fontFamily:"var(--font-body)",cursor:"pointer",appearance:"auto"}}>
          {TIMEFRAMES.map(t=>(
            <option key={t.key} value={t.key}>{t.icon} {t.label}</option>
          ))}
        </select>
      </div>

      {/* ── DAILY MORNING ─────────────────────────────────────────────── */}
      {tf === "daily_am" && (
        <div>
          {sparkStmt && (
            <div className="card ember-glow" style={{marginBottom:"1rem"}}>
              <div style={{fontSize:"0.62rem",color:"var(--ember)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Your Spark</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:"0.95rem",color:"var(--cream)",lineHeight:1.6,fontStyle:"italic"}}>"{sparkStmt}"</div>
            </div>
          )}
          <Section title="🌅 Morning Intentions" sub="Set your direction before the day sets it for you.">
            <div className="form-group">
              <label>How does your Spark align with today's work?</label>
              <textarea className="textarea" rows={2} value={journal.spark_am||""} onChange={e=>setJ("spark_am",e.target.value)} placeholder="Where do you see your purpose showing up today?"/>
            </div>
          </Section>
          <Section title="⚙️ Structure" sub="What boundaries and rhythms will hold today together?">
            <div className="form-group">
              <label>What structure or routine will keep you on track today?</label>
              <textarea className="textarea" rows={2} value={journal.structure_am||""} onChange={e=>setJ("structure_am",e.target.value)} placeholder="Blocks, boundaries, or rhythms you're committing to..."/>
            </div>
          </Section>
          <Section title="🎯 Yield — Top 3 Priorities">
            {[0,1,2].map(i=>(
              <div key={i} className="form-group" style={{marginBottom:i<2?8:0}}>
                <label>Priority {i+1}</label>
                <input className="input" value={priorities[i]} onChange={e=>{const p=[...priorities];p[i]=e.target.value;setPriorities(p);}} placeholder={"Priority "+(i+1)+"..."}/>
              </div>
            ))}
          </Section>
          <Section title="🤝 Support" sub="Who or what do you need today?">
            <div className="form-group">
              <label>What person, place, product, or process do you need today?</label>
              <textarea className="textarea" rows={2} value={journal.support_am||""} onChange={e=>setJ("support_am",e.target.value)} placeholder="Be specific — name the resource you need..."/>
            </div>
          </Section>
          <Section title="🕐 Time" sub="Does your calendar align with your Spark?">
            <div className="form-group">
              <label>Looking at your schedule today — where is your time going, and does it match what matters most?</label>
              <textarea className="textarea" rows={2} value={journal.time_am||""} onChange={e=>setJ("time_am",e.target.value)} placeholder="Calendar alignment check..."/>
            </div>
          </Section>
          <Section title="⚡ Energy" sub="How are you managing your fuel today?">
            <div className="form-group">
              <label>What are you doing today for rest, nutrition, or movement?</label>
              <textarea className="textarea" rows={2} value={journal.energy_am||""} onChange={e=>setJ("energy_am",e.target.value)} placeholder="Sleep, food, exercise plan..."/>
            </div>
          </Section>
          <Section title="💰 Money" sub="Financial clarity for today.">
            <div className="form-group">
              <label>Any financial decisions or actions needed today? Any money stress that needs addressing?</label>
              <textarea className="textarea" rows={2} value={journal.money_am||""} onChange={e=>setJ("money_am",e.target.value)} placeholder="Financial focus for today..."/>
            </div>
          </Section>
          <Section title="📖 Story" sub="What message is your life communicating today?">
            <div className="form-group">
              <label>Based on your Spark, what story do you want to tell with today?</label>
              <textarea className="textarea" rows={2} value={journal.story_am||""} onChange={e=>setJ("story_am",e.target.value)} placeholder="The narrative you're building today..."/>
            </div>
          </Section>
          <Section title="🧠 Morning Coaching Summary">
            <button className="btn btn-ghost btn-sm" onClick={genSummary} disabled={summaryLoading}
              style={{fontSize:"0.75rem",color:"var(--ember)",borderColor:"rgba(232,89,60,0.4)",marginBottom:summary?12:0}}>
              {summaryLoading?<><span className="spinner" style={{width:10,height:10}}/> Generating...</>:"✦ Generate Coaching Insight"}
            </button>
            {summary && <div style={{fontSize:"0.875rem",color:"var(--pale)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{summary}</div>}
          </Section>
        </div>
      )}

      {/* ── DAILY EVENING ─────────────────────────────────────────────── */}
      {tf === "daily_pm" && (
        <div>
          <Section title="🌙 Evening Check-In" sub="How well did today align with how it started?">
            <div style={{fontSize:"0.78rem",color:"var(--fog)",marginBottom:16,lineHeight:1.6}}>Rate each area 1–5 based on how well it showed up today.</div>
            {[
              {key:"sy1",label:"Structure — Did your boundaries and rhythms hold?"},
              {key:"sy2",label:"Yield — Did you hit your top priorities?"},
              {key:"sy3",label:"Support — Did you lean on the right people/tools?"},
              {key:"sy4",label:"Time — Did your time match what mattered most?"},
              {key:"sy5",label:"Energy — Did you manage your fuel well?"},
              {key:"sy6",label:"Money — Were your financial decisions aligned?"},
              {key:"sy7",label:"Story — Did your actions reflect your Spark?"},
            ].map(q=>(
              <div key={q.key} className="audit-question">
                <div className="audit-q">{q.label}</div>
                <FireRating value={scores[q.key]||0} onChange={v=>setScore(q.key,v)}/>
              </div>
            ))}
          </Section>
          <Section title="📝 Evening Reflection">
            <div className="form-group">
              <label>What worked today?</label>
              <textarea className="textarea" rows={2} value={journal.wins||""} onChange={e=>setJ("wins",e.target.value)} placeholder="Wins, momentum, what you'd repeat..."/>
            </div>
            <div className="form-group">
              <label>What didn't work / what needs adjusting?</label>
              <textarea className="textarea" rows={2} value={journal.challenges||""} onChange={e=>setJ("challenges",e.target.value)} placeholder="Friction, misalignment, what to fix..."/>
            </div>
            <div className="form-group">
              <label>Concerns or observations for tomorrow?</label>
              <textarea className="textarea" rows={2} value={journal.lessons||""} onChange={e=>setJ("lessons",e.target.value)} placeholder="What to carry into tomorrow..."/>
            </div>
          </Section>
        </div>
      )}

      {/* ── WEEKLY ────────────────────────────────────────────────────── */}
      {tf === "weekly" && (
        <div>
          <Section title="📅 This Past Week" sub="Rate how each area showed up — 1 (low) to 5 (strong).">
            {[...AUDIT_QUESTIONS.spark, ...AUDIT_QUESTIONS.systems].map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q"><span>{q.p} — </span>{q.q}</div>
                <FireRating value={scores[q.id]||0} onChange={v=>setScore(q.id,v)}/>
              </div>
            ))}
          </Section>
          <Section title="🔥 This Past Week — Reflection">
            <div className="form-group"><label>What burned well this week?</label>
              <textarea className="textarea" rows={2} value={journal.weekly_wins||""} onChange={e=>setJ("weekly_wins",e.target.value)} placeholder="Wins, momentum, bright spots..."/></div>
            <div className="form-group"><label>What struggled or faded?</label>
              <textarea className="textarea" rows={2} value={journal.weekly_challenges||""} onChange={e=>setJ("weekly_challenges",e.target.value)} placeholder="What drained, stalled, or misaligned..."/></div>
            <div className="form-group"><label>What did this week teach you?</label>
              <textarea className="textarea" rows={2} value={journal.weekly_lessons||""} onChange={e=>setJ("weekly_lessons",e.target.value)} placeholder="Key lessons or patterns noticed..."/></div>
          </Section>
          <Section title="📅 The Coming Week" sub="Forward planning based on last week.">
            <div className="form-group"><label>Based on last week, what needs to change for greater Spark alignment?</label>
              <textarea className="textarea" rows={2} value={journal.weekly_change||""} onChange={e=>setJ("weekly_change",e.target.value)} placeholder="Specific adjustments you're committing to..."/></div>
            <div className="form-group"><label>What's your single most important focus this week?</label>
              <textarea className="textarea" rows={2} value={journal.weekly_focus||""} onChange={e=>setJ("weekly_focus",e.target.value)} placeholder="The one thing that moves the fire forward..."/></div>
            <div className="form-group"><label>What support, person, or resource do you need most this week?</label>
              <textarea className="textarea" rows={2} value={journal.weekly_support||""} onChange={e=>setJ("weekly_support",e.target.value)} placeholder="Name what you need..."/></div>
          </Section>
        </div>
      )}

      {/* ── MONTHLY ───────────────────────────────────────────────────── */}
      {tf === "monthly" && (
        <div>
          <Section title="🗓 This Past Month" sub="Rate each system for the month overall.">
            {[...AUDIT_QUESTIONS.spark, ...AUDIT_QUESTIONS.systems].map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q"><span>{q.p} — </span>{q.q}</div>
                <FireRating value={scores[q.id]||0} onChange={v=>setScore(q.id,v)}/>
              </div>
            ))}
          </Section>
          <Section title="🗓 Monthly Reflection">
            <div className="form-group"><label>What was your biggest win this month?</label>
              <textarea className="textarea" rows={2} value={journal.monthly_wins||""} onChange={e=>setJ("monthly_wins",e.target.value)} placeholder="Celebrate real progress..."/></div>
            <div className="form-group"><label>Where did momentum stall or energy drain?</label>
              <textarea className="textarea" rows={2} value={journal.monthly_challenges||""} onChange={e=>setJ("monthly_challenges",e.target.value)} placeholder="Honest assessment of what didn't work..."/></div>
            <div className="form-group"><label>What pattern did this month reveal about how you operate?</label>
              <textarea className="textarea" rows={2} value={journal.monthly_pattern||""} onChange={e=>setJ("monthly_pattern",e.target.value)} placeholder="Patterns, themes, recurring dynamics..."/></div>
          </Section>
          <Section title="🗓 The Coming Month">
            <div className="form-group"><label>Based on this month, what needs to change for greater Spark alignment?</label>
              <textarea className="textarea" rows={2} value={journal.monthly_change||""} onChange={e=>setJ("monthly_change",e.target.value)} placeholder="Specific structural adjustments..."/></div>
            <div className="form-group"><label>Where is capacity stretched too thin? What needs to be redistributed?</label>
              <textarea className="textarea" rows={2} value={journal.monthly_capacity||""} onChange={e=>setJ("monthly_capacity",e.target.value)} placeholder="Load, team, responsibilities..."/></div>
            <div className="form-group"><label>What single clarification would unlock the most momentum next month?</label>
              <textarea className="textarea" rows={2} value={journal.monthly_unlock||""} onChange={e=>setJ("monthly_unlock",e.target.value)} placeholder="The one thing to get clear on..."/></div>
          </Section>
        </div>
      )}

      {/* ── QUARTERLY ─────────────────────────────────────────────────── */}
      {tf === "quarterly" && (
        <div>
          <Section title="📊 This Past Quarter" sub="Rate each system for the quarter overall.">
            {[...AUDIT_QUESTIONS.spark, ...AUDIT_QUESTIONS.systems].map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q"><span>{q.p} — </span>{q.q}</div>
                <FireRating value={scores[q.id]||0} onChange={v=>setScore(q.id,v)}/>
              </div>
            ))}
          </Section>
          <Section title="📊 Quarterly Reflection">
            <div className="form-group"><label>Are long-term goals advancing, or is the mission trapped in short-term execution?</label>
              <textarea className="textarea" rows={2} value={journal.q_strategy||""} onChange={e=>setJ("q_strategy",e.target.value)} placeholder="Strategic progress assessment..."/></div>
            <div className="form-group"><label>What should start, stop, or continue this quarter?</label>
              <textarea className="textarea" rows={3} value={journal.q_ssc||""} onChange={e=>setJ("q_ssc",e.target.value)} placeholder="Start: ...
Stop: ...
Continue: ..."/></div>
            <div className="form-group"><label>Are the people carrying the mission healthy enough to sustain it?</label>
              <textarea className="textarea" rows={2} value={journal.q_health||""} onChange={e=>setJ("q_health",e.target.value)} placeholder="Leadership health, team burnout signals..."/></div>
          </Section>
          <Section title="📊 The Coming Quarter">
            <div className="form-group"><label>Based on this quarter, what needs to change for greater Spark alignment?</label>
              <textarea className="textarea" rows={2} value={journal.q_change||""} onChange={e=>setJ("q_change",e.target.value)} placeholder="Structural or strategic adjustments..."/></div>
            <div className="form-group"><label>Are the seven SYSTEMS still working? Which one needs the most attention?</label>
              <textarea className="textarea" rows={2} value={journal.q_systems||""} onChange={e=>setJ("q_systems",e.target.value)} placeholder="System-by-system honest evaluation..."/></div>
            <div className="form-group"><label>What one structural adjustment would most strengthen the fire next quarter?</label>
              <textarea className="textarea" rows={2} value={journal.q_one||""} onChange={e=>setJ("q_one",e.target.value)} placeholder="The single most important change..."/></div>
          </Section>
        </div>
      )}

      {/* ── SEMI-ANNUAL ───────────────────────────────────────────────── */}
      {tf === "semiannual" && (
        <div>
          <Section title="🔥 Semi-Annual Review" sub="Rate each system for the past six months.">
            {[...AUDIT_QUESTIONS.spark, ...AUDIT_QUESTIONS.systems].map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q"><span>{q.p} — </span>{q.q}</div>
                <FireRating value={scores[q.id]||0} onChange={v=>setScore(q.id,v)}/>
              </div>
            ))}
          </Section>
          <Section title="🔥 Six-Month Reflection">
            <div className="form-group"><label>Is the fire still aligned with the Spark that started it?</label>
              <textarea className="textarea" rows={2} value={journal.sa_alignment||""} onChange={e=>setJ("sa_alignment",e.target.value)} placeholder="Purpose check — are you still building the right fire?"/></div>
            <div className="form-group"><label>What has the past six months revealed about your leadership?</label>
              <textarea className="textarea" rows={2} value={journal.sa_leadership||""} onChange={e=>setJ("sa_leadership",e.target.value)} placeholder="Honest self-assessment..."/></div>
            <div className="form-group"><label>Where did the fire burn brightest? Where did it nearly go out?</label>
              <textarea className="textarea" rows={2} value={journal.sa_highs||""} onChange={e=>setJ("sa_highs",e.target.value)} placeholder="Peak moments and near-burnout moments..."/></div>
            <div className="form-group"><label>What story has your life been telling for the past six months?</label>
              <textarea className="textarea" rows={2} value={journal.sa_story||""} onChange={e=>setJ("sa_story",e.target.value)} placeholder="The narrative others have witnessed..."/></div>
          </Section>
          <Section title="🔥 The Next Six Months">
            <div className="form-group"><label>Based on the past six months, what needs to fundamentally change?</label>
              <textarea className="textarea" rows={2} value={journal.sa_change||""} onChange={e=>setJ("sa_change",e.target.value)} placeholder="Deep structural or directional shifts..."/></div>
            <div className="form-group"><label>What does second-generation sustainability look like for your mission?</label>
              <textarea className="textarea" rows={2} value={journal.sa_sustainability||""} onChange={e=>setJ("sa_sustainability",e.target.value)} placeholder="Building fires that outlast you..."/></div>
            <div className="form-group"><label>What would make the next six months the most meaningful of your leadership?</label>
              <textarea className="textarea" rows={2} value={journal.sa_vision||""} onChange={e=>setJ("sa_vision",e.target.value)} placeholder="Bold vision for the season ahead..."/></div>
          </Section>
          <Section title="🔥 AIR Rhythm Check" sub="How consistently are you Auditing, Investing, and Reflecting?">
            {AUDIT_QUESTIONS.air.map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q">{q.q}</div>
                <FireRating value={scores[q.id]||0} onChange={v=>setScore(q.id,v)}/>
              </div>
            ))}
          </Section>
        </div>
      )}


      {/* ── ANNUAL ────────────────────────────────────────────────────── */}
      {tf === "annual" && (
        <div>
          <Section title="🏆 Annual Review" sub="Rate each system for the full year.">
            {[...AUDIT_QUESTIONS.spark, ...AUDIT_QUESTIONS.systems].map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q"><span>{q.p} — </span>{pastTense(q)}</div>
                <FireRating value={scores[q.id]||0} onChange={v=>setScore(q.id,v)}/>
              </div>
            ))}
          </Section>
          <Section title="🏆 Year in Review">
            <div className="form-group"><label>What was the defining moment of this year?</label>
              <textarea className="textarea" rows={2} value={journal.ann_moment||""} onChange={e=>setJ("ann_moment",e.target.value)} placeholder="The moment that changed everything..."/></div>
            <div className="form-group"><label>Where did the fire burn brightest? Where did it nearly go out?</label>
              <textarea className="textarea" rows={2} value={journal.ann_highs||""} onChange={e=>setJ("ann_highs",e.target.value)} placeholder="Peak moments and near-burnout points..."/></div>
            <div className="form-group"><label>What did this year teach you about your leadership?</label>
              <textarea className="textarea" rows={2} value={journal.ann_leadership||""} onChange={e=>setJ("ann_leadership",e.target.value)} placeholder="What you now know that you didn't a year ago..."/></div>
            <div className="form-group"><label>What story did your life tell this year? Is it the story you wanted to tell?</label>
              <textarea className="textarea" rows={2} value={journal.ann_story||""} onChange={e=>setJ("ann_story",e.target.value)} placeholder="The narrative your life communicated..."/></div>
          </Section>
          <Section title="🏆 The Year Ahead">
            <div className="form-group"><label>What is the one word that should define next year?</label>
              <textarea className="textarea" rows={1} value={journal.ann_word||""} onChange={e=>setJ("ann_word",e.target.value)} placeholder="Your word for the year..."/></div>
            <div className="form-group"><label>What needs to fundamentally change for next year to be different?</label>
              <textarea className="textarea" rows={2} value={journal.ann_change||""} onChange={e=>setJ("ann_change",e.target.value)} placeholder="Deep structural or directional shifts..."/></div>
            <div className="form-group"><label>What fires are you lighting for the next generation?</label>
              <textarea className="textarea" rows={2} value={journal.ann_legacy||""} onChange={e=>setJ("ann_legacy",e.target.value)} placeholder="Legacy you're building..."/></div>
            <div className="form-group"><label>What would make next year the most meaningful year of your leadership?</label>
              <textarea className="textarea" rows={2} value={journal.ann_vision||""} onChange={e=>setJ("ann_vision",e.target.value)} placeholder="Your bold vision for the year ahead..."/></div>
          </Section>
          <Section title="🏆 AIR Rhythm — Annual Check">
            {AUDIT_QUESTIONS.air.map(q=>(
              <div key={q.id} className="audit-question">
                <div className="audit-q">{q.q}</div>
                <FireRating value={scores[q.id]||0} onChange={v=>setScore(q.id,v)}/>
              </div>
            ))}
          </Section>
        </div>
      )}
      {/* Save button at bottom */}
      <div className="card" style={{marginTop:"0.5rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"0.78rem",color:"var(--smoke)"}}>Saves to your profile and history</span>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {saved && <span style={{fontSize:"0.78rem",color:"#5DCAA5"}}>✓ Saved</span>}
            <button className="btn btn-primary" onClick={save}>💾 Save Check-In</button>
          </div>
        </div>
      </div>
    </div>
  );
}
