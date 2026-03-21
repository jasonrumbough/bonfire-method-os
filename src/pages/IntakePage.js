import { useState } from "react";
import { AUDIT_QUESTIONS } from "../utils/data";
import FireRating from "../components/StarRating";

const STEPS = [
  { key:"welcome",          title:"Welcome to the Bonfire Method" },
  { key:"profile",          title:"Tell us about yourself" },
  { key:"spark",            title:"Your Spark — Six P's",         subtitle:"Rate how true each statement is right now. This is your baseline — be honest." },
  { key:"systems",          title:"Your S.Y.S.T.E.M.S.",          subtitle:"How healthy are the seven pillars that sustain your fire?" },
  { key:"air",              title:"Your AIR Rhythm",               subtitle:"How consistently are you auditing, investing, and reflecting?" },
  { key:"personality",      title:"Leadership Background" },
  { key:"spark_statement",  title:"Your Spark Statement" },
  { key:"done",             title:"You're ready to tend the fire." },
];

const GENDERS = ["Prefer not to say","Male","Female","Non-binary","Other"];
const PERSONALITY_TESTS = ["StrengthsFinder / CliftonStrengths","Myers-Briggs (MBTI)","Enneagram","DISC","16Personalities","Working Genius","Kolbe Index","Hogan Assessments","EQ-i (Emotional Intelligence)","Other","None"];

export default function IntakePage({ onComplete }) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({});
  const [profile, setProfile] = useState({ name:"", age:"", gender:"", occupation:"", location:"", sector:"", roleLevel:"" });
  const [personalityInfo, setPersonalityInfo] = useState({ tests:[], results:"", background:"" });
  const [spark, setSpark] = useState({ target:"", outcome:"", avoid:"", method:"" });

  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast  = step === STEPS.length - 1;
  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  const handleScore = (id, val) => setScores(s => ({ ...s, [id]: val }));

  const toggleTest = (test) => {
    setPersonalityInfo(p => ({
      ...p,
      tests: p.tests.includes(test) ? p.tests.filter(t => t !== test) : [...p.tests, test]
    }));
  };

  const buildStatement = () => {
    const t = spark.target   || "[target audience]";
    const o = spark.outcome  || "[positive outcome]";
    const a = spark.avoid    || "[what to avoid]";
    const m = spark.method   || "[method/process]";
    return "I help " + t + " achieve " + o + " while avoiding " + a + " through " + m + ".";
  };

  const isStatementComplete = spark.target && spark.outcome && spark.avoid && spark.method;

  const next = () => { if (step < STEPS.length - 1) setStep(s => s + 1); };
  const back = () => { if (step > 0) setStep(s => s - 1); };

  const finish = () => {
    const avg = (qs) => qs.length ? qs.reduce((a,q) => a+(scores[q.id]||0),0)/qs.length : 0;
    const sp = avg(AUDIT_QUESTIONS.spark);
    const sy = avg(AUDIT_QUESTIONS.systems);
    const ai = avg(AUDIT_QUESTIONS.air);
    const overall = parseFloat(((sp+sy+ai)/3).toFixed(2));
    const statement = isStatementComplete ? buildStatement() : "";
    const today = new Date().toISOString();
    onComplete({
      auditScores: scores,
      sparkStatement: statement,
      spark: { ...spark },
      profile: { ...profile },
      personality: { tests: personalityInfo.tests, results: personalityInfo.results, background: personalityInfo.background },
      healthData: { age: profile.age, gender: profile.gender },
      history: [{ date: today, scores: { ...scores }, overall }],
      allAudits: { [today.split("T")[0]]: { scores: { ...scores }, overall, savedAt: today } },
      intakeComplete: true,
    });
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--coal)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div style={{ width:"100%", maxWidth:580 }}>

        {!isFirst && !isLast && (
          <div style={{ marginBottom:"1.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.7rem", color:"var(--smoke)", marginBottom:6 }}>
              <span>{current.title}</span>
              <span>{step}/{STEPS.length - 2}</span>
            </div>
            <div style={{ height:3, background:"var(--ash)", borderRadius:2 }}>
              <div style={{ height:"100%", background:"var(--ember)", borderRadius:2, width:progress+"%", transition:"width 0.4s" }} />
            </div>
          </div>
        )}

        <div className="card" style={{ padding:"2rem" }}>

          {/* WELCOME */}
          {current.key === "welcome" && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔥</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"1.8rem", color:"var(--ember)", marginBottom:8 }}>Bonfire Method</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"1.2rem", color:"var(--cream)", marginBottom:"1.5rem" }}>Personal OS</div>
              <div style={{ fontSize:"0.875rem", color:"var(--fog)", lineHeight:1.8, marginBottom:"2rem" }}>
                Before you dive in, let's establish your baseline.<br/>
                This intake takes about 5 minutes and sets up your<br/>
                personalized dashboard, coaching, and insights.
              </div>
              <button className="btn btn-primary" onClick={next} style={{ width:"100%", justifyContent:"center", padding:"0.875rem", fontSize:"1rem" }}>
                Start the Intake →
              </button>
            </div>
          )}

          {/* PROFILE */}
          {current.key === "profile" && (
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"1.3rem", color:"var(--cream)", marginBottom:"1.5rem" }}>Tell us about yourself</div>
              <div className="form-group">
                <label>Your name (optional)</label>
                <input value={profile.name} onChange={e => setProfile(p => ({...p,name:e.target.value}))} placeholder="First name..." />
              </div>
              <div className="two-col">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" value={profile.age} onChange={e => setProfile(p => ({...p,age:e.target.value}))} placeholder="42" />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select value={profile.gender} onChange={e => setProfile(p => ({...p,gender:e.target.value}))}>
                    <option value="">Select...</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* AUDIT QUESTIONS */}
          {(current.key === "spark" || current.key === "systems" || current.key === "air") && (
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"1.3rem", color:"var(--cream)", marginBottom:4 }}>{current.title}</div>
              <div style={{ fontSize:"0.8rem", color:"var(--smoke)", marginBottom:"1.5rem" }}>{current.subtitle}</div>
              {AUDIT_QUESTIONS[current.key].map(q => (
                <div key={q.id} className="audit-question">
                  <div className="audit-q"><span>{q.p} — </span>{q.q}</div>
                  <FireRating value={scores[q.id]||0} onChange={v => handleScore(q.id,v)} />
                </div>
              ))}
            </div>
          )}

          {/* PERSONALITY / BACKGROUND */}
          {current.key === "personality" && (
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"1.3rem", color:"var(--cream)", marginBottom:4 }}>Leadership Background</div>
              <div style={{ fontSize:"0.8rem", color:"var(--smoke)", marginBottom:"1.5rem" }}>
                Help us understand how you're wired. This context makes your coaching more personal.
              </div>

              <div className="form-group">
                <label>Personality or leadership assessments you've taken</label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:6 }}>
                  {PERSONALITY_TESTS.map(t => (
                    <button key={t} onClick={() => toggleTest(t)}
                      style={{
                        padding:"4px 12px", borderRadius:20, border:"1px solid",
                        borderColor: personalityInfo.tests.includes(t) ? "var(--ember)" : "var(--ash)",
                        background: personalityInfo.tests.includes(t) ? "rgba(232,89,60,0.15)" : "transparent",
                        color: personalityInfo.tests.includes(t) ? "var(--ember-light)" : "var(--smoke)",
                        cursor:"pointer", fontSize:"0.78rem", fontFamily:"var(--font-body)",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>What were your results? (type, number, description)</label>
                <textarea rows={3} value={personalityInfo.results}
                  onChange={e => setPersonalityInfo(p => ({...p,results:e.target.value}))}
                  placeholder="e.g. ENTJ, Enneagram 3w2, StrengthsFinder top 5: Achiever, Learner, Strategic, Futuristic, Activator..." />
              </div>

              <div className="form-group">
                <label>Anything else you'd like your coach to know about you?</label>
                <textarea rows={3} value={personalityInfo.background}
                  onChange={e => setPersonalityInfo(p => ({...p,background:e.target.value}))}
                  placeholder="Your role, industry, current challenges, what you're hoping to get from the Bonfire Method..." />
              </div>
            </div>
          )}

          {/* SPARK STATEMENT */}
          {current.key === "spark_statement" && (
            <div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"1.3rem", color:"var(--cream)", marginBottom:4 }}>Your Spark Statement</div>
              <div style={{ fontSize:"0.8rem", color:"var(--smoke)", marginBottom:"1.25rem" }}>
                Your Spark Statement is your "why" — the core purpose behind your leadership. It answers: who do you serve, what do you help them achieve, what do you help them avoid, and how do you do it?
              </div>

              {/* Why it matters */}
              <div style={{ background:"rgba(232,89,60,0.08)", borderLeft:"3px solid var(--ember)", padding:"0.75rem 1rem", borderRadius:"0 8px 8px 0", marginBottom:"1.25rem", fontSize:"0.82rem", color:"var(--fog)", lineHeight:1.65 }}>
                <strong style={{ color:"var(--ember-light)" }}>Why this matters:</strong> Viktor Frankl wrote, "Those who have a why to live can bear almost any how." Your Spark Statement is your fire — the reason your work exists beyond a paycheck or title. Leaders who can clearly define their why burn longer, lead better, and recover faster from burnout.
              </div>

              {/* Live preview */}
              <div style={{ background:"rgba(232,89,60,0.07)", border:"1px solid rgba(232,89,60,0.2)", borderRadius:10, padding:"1rem 1.25rem", marginBottom:"1.25rem" }}>
                <div style={{ fontSize:"0.62rem", color:"var(--ember)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>Your Statement</div>
                <div style={{ fontFamily:"var(--font-display)", fontSize:"0.95rem", color: isStatementComplete ? "var(--cream)" : "var(--smoke)", fontStyle:"italic", lineHeight:1.6 }}>
                  {buildStatement()}
                </div>
              </div>

              <div className="two-col">
                <div className="form-group">
                  <label>Who do you serve? <span style={{color:"var(--ember)"}}>Target Audience</span></label>
                  <input value={spark.target} onChange={e => setSpark(s=>({...s,target:e.target.value}))} placeholder="burned-out leaders..." />
                </div>
                <div className="form-group">
                  <label>What do they achieve? <span style={{color:"var(--ember)"}}>Positive Outcome</span></label>
                  <input value={spark.outcome} onChange={e => setSpark(s=>({...s,outcome:e.target.value}))} placeholder="clarity and sustainable impact..." />
                </div>
                <div className="form-group">
                  <label>What do they avoid? <span style={{color:"var(--ember)"}}>Negative Consequence</span></label>
                  <input value={spark.avoid} onChange={e => setSpark(s=>({...s,avoid:e.target.value}))} placeholder="burnout and collapse..." />
                </div>
                <div className="form-group">
                  <label>How do you do it? <span style={{color:"var(--ember)"}}>Method / Process</span></label>
                  <input value={spark.method} onChange={e => setSpark(s=>({...s,method:e.target.value}))} placeholder="the Bonfire Method..." />
                </div>
              </div>
              <div style={{ fontSize:"0.75rem", color:"var(--smoke)", marginTop:4 }}>
                Not sure yet? Leave it blank and refine it inside the app — your statement will grow clearer over time.
              </div>
            </div>
          )}

          {/* DONE */}
          {current.key === "done" && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔥</div>
              <div style={{ fontFamily:"var(--font-display)", fontSize:"1.5rem", color:"var(--cream)", marginBottom:8 }}>{current.title}</div>
              <div style={{ fontSize:"0.875rem", color:"var(--fog)", lineHeight:1.8, marginBottom:"2rem" }}>
                Your baseline is set. Your dashboard, coaching, and<br/>insights are now personalized to your fire.
              </div>
              <button className="btn btn-primary" onClick={finish} style={{ width:"100%", justifyContent:"center", padding:"0.875rem", fontSize:"1rem" }}>
                See My Results →
              </button>
            </div>
          )}

          {/* Nav buttons */}
          {!isFirst && !isLast && (
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:"1.5rem" }}>
              <button className="btn btn-ghost" onClick={back}>← Back</button>
              <button className="btn btn-primary" onClick={next}>
                {step === STEPS.length - 2 ? "Finish →" : "Next →"}
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign:"center", marginTop:"1rem", fontSize:"0.68rem", color:"var(--smoke)" }}>
          thebonfirecompany.com · © 2026 Jason Rumbough
        </div>
      </div>
    </div>
  );
}