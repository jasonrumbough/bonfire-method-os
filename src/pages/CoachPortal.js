import React, { useState, useEffect, useRef } from "react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../utils/supabase";
import { exportClientPDF, exportAggregatePDF, exportExcel } from "../utils/generatePDF";

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
const COACH_EMAILS = ["jasonrumbough@gmail.com","jason@thebonfiremethod.com","jason@thebonfirecompany.com"];

const DEMO_CLIENTS = [{"id":"demo-1","name":"Marcus Webb","email":"marcus.webb@example.com","status":"pending","submitted_at":"2026-03-18T14:22:00Z","overall_score":"2.8","spark_statement":"I help sales teams achieve consistent revenue while avoiding burnout through structured coaching systems.","scores":{"sp1":4,"sp2":2,"sp3":4,"sp4":3,"sp5":2,"sp6":3,"sy1":2,"sy2":2,"sy3":3,"sy4":2,"sy5":2,"sy6":2,"sy7":3,"ai1":2,"ai2":2,"ai3":3,"ai4":2,"ai5":2},"profile":{"age":"38","gender":"Male","occupation":"Regional Sales Manager","location":"Dallas, TX"},"personality":{"tests":["StrengthsFinder / CliftonStrengths","DISC"],"results":"Achiever, Activator, Competition, Significance, Command — High D/I","background":"Leading a team of 12 reps across the Southwest. Recently promoted and feeling stretched thin. Looking for a sustainable leadership framework."},"coaching_summary":"What's Burning Well:\nMarcus shows strong Passion Clarity and Pattern Recognition (both 4/5), signaling he knows what matters and can spot trends others miss. His Story score (3/5) suggests he can communicate vision when pressed.\n\nWhat Needs Tending:\nStructure, Yield, Time, Energy, and Money all sit at 2/5 — a dangerous cluster. The systems that should carry his output are almost entirely absent, which means he is personally absorbing every inefficiency.\n\nYour Single Most Important Next Step:\nBuild one repeatable weekly rhythm — a 30-minute team structure review — before adding any new responsibilities.\n\nReady to Turn Up the Heat?:\nBook a free discovery session at thebonfirecompany.com/coaching to go deeper on your SYSTEMS gaps.","talking_points":"1. Your scores show a significant gap between your natural strengths (Passion, Pattern) and your operational systems. What does a typical Tuesday look like for you from 8am to noon?\n\n2. With Structure, Time, and Energy all at 2/5, it's likely you're the bottleneck for your team. What happens when you're out of office for more than a day?\n\n3. Your StrengthsFinder profile (Achiever, Activator) means you bias toward doing over designing. That's valuable early — but at 12 reps, it's starting to cost you. What would it look like if your team could self-correct without you?\n\n4. Money sitting at 2/5 in a sales leadership role is a signal worth exploring. Is that about personal financial systems, compensation clarity, or something else?\n\n5. You defined a clear Spark Statement, which is rare. The question is whether your calendar reflects it. When did you last do the work that statement describes?"},{"id":"demo-2","name":"Sandra Okafor","email":"sandra.okafor@example.com","status":"approved","submitted_at":"2026-03-19T09:15:00Z","overall_score":"3.4","spark_statement":"I help nonprofit leaders build resilient organizations while avoiding founder dependency through the Bonfire Method.","scores":{"sp1":5,"sp2":3,"sp3":4,"sp4":4,"sp5":2,"sp6":4,"sy1":3,"sy2":3,"sy3":4,"sy4":3,"sy5":3,"sy6":2,"sy7":4,"ai1":3,"ai2":3,"ai3":4,"ai4":3,"ai5":3},"profile":{"age":"44","gender":"Female","occupation":"Executive Director, Nonprofit","location":"Atlanta, GA"},"personality":{"tests":["Enneagram","Myers-Briggs (MBTI)"],"results":"Enneagram 2w3, INFJ","background":"Running a $3M nonprofit serving at-risk youth for 11 years. Board is asking for a succession plan. Struggling to build leadership depth without feeling like she's giving away the mission."},"coaching_summary":"What's Burning Well:\nSandra's Passion Clarity (5/5) and Story (4/5) are exceptional — she knows exactly why she does this work and communicates it powerfully. Skill Development (4/5) and Support (4/5) show she's investing in people.\n\nWhat Needs Tending:\nFinancial Provision and Money (both 2/5) are the most urgent signals. After 11 years, financial sustainability of both the org and her personal situation deserves a serious look.\n\nYour Single Most Important Next Step:\nSchedule a financial review this month — both org budget and personal compensation — with a clear question: is this sustainable for another 5 years?\n\nReady to Turn Up the Heat?:\nBook a free discovery session at thebonfirecompany.com/coaching to build a sustainability roadmap.","talking_points":"1. Your Enneagram 2w3 combined with 11 years in a mission-driven role is a classic setup for giving more than you receive. What does your personal margin look like right now — not the org's, yours?\n\n2. Financial Provision at 2/5 is notable for someone at your level. Is that about what the org pays you, your personal financial picture, or both?\n\n3. Your board wants a succession plan but you're worried about mission drift. Those two things aren't actually in conflict — they're both System questions. What would need to be true for you to trust someone else with this?\n\n4. You scored Support at 4/5, which is strong. But INFJ leaders often have wide circles and thin depth. Who holds you accountable in your role — not the board, but someone who actually knows your interior life?\n\n5. Your Spark Statement is one of the best I've seen — precise and honest. The gap is that your calendar probably doesn't reflect it. What percentage of your week are you doing what the statement describes vs. administrative survival?"},{"id":"demo-3","name":"Priya Nair","email":"priya.nair@example.com","status":"pending","submitted_at":"2026-03-20T11:45:00Z","overall_score":"1.9","spark_statement":"","scores":{"sp1":2,"sp2":1,"sp3":2,"sp4":3,"sp5":1,"sp6":2,"sy1":2,"sy2":2,"sy3":2,"sy4":1,"sy5":2,"sy6":1,"sy7":2,"ai1":2,"ai2":2,"ai3":2,"ai4":1,"ai5":2},"profile":{"age":"31","gender":"Female","occupation":"Church Staff — Worship Director","location":"Nashville, TN"},"personality":{"tests":["16Personalities","Enneagram"],"results":"ENFP, Enneagram 4w3","background":"Three years on staff. Loves the work but feels invisible to leadership. No clear growth path. Considering leaving ministry for a creative career. Hasn't told anyone."},"coaching_summary":"What's Burning Well:\nSkill Development (3/5) is Priya's only consistently above-floor score — she's still investing in her craft even when the fire is low. That discipline matters.\n\nWhat Needs Tending:\nTime (1/5), Money (1/5), Financial Provision (1/5), and Drift Prevention (1/5) are all at the floor. This is not a motivation problem — this is a person who has been running without fuel for a long time.\n\nYour Single Most Important Next Step:\nBefore any systems work, Priya needs a safe conversation about whether this role still aligns with her Spark — because right now it doesn't appear to.\n\nReady to Turn Up the Heat?:\nBook a free discovery session at thebonfirecompany.com/coaching — this is exactly what the Bonfire Method was built for.","talking_points":"1. With 11 of 18 scores at 1-2/5 and no Spark Statement defined, this isn't a performance issue — it's an alignment crisis. Before any tactical coaching, what does Priya say she actually wants her life to look like in 3 years?\n\n2. Her ENFP + Enneagram 4w3 profile means she experiences purpose through identity, not just task. The fact that she feels invisible to leadership isn't just a management failure — it's existential for her wiring. How long has she been feeling this way?\n\n3. She mentioned considering leaving ministry but hasn't told anyone. That's significant. What would need to change for her to feel like staying was a real choice rather than a default?\n\n4. Time at 1/5 in a creative role is brutal. Is she being given space to do the actual creative work, or is she buried in administrative tasks that drain her?\n\n5. This client is a real retention risk — not just for the church, but for ministry broadly. A coaching engagement here is high-leverage. What does she need to believe about her own future before she can build systems around it?"}];

function pillarAvg(keys, scores) {
  const vals = keys.map(k => Number(scores?.[k])||0).filter(v=>v>0);
  return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : "0.0";
}
function buildApproveSQL(email) {
  return ["UPDATE user_data SET payload = payload || ","'{","\"approved\":true","}'  WHERE payload->>'email' = '",email,"';"].join("");
}
function stripBold(text) {
  return (text||"")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/\*(.*?)\*/gs, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}
// Only blur the "Ready to Turn Up the Heat" CTA — everything else is fully visible
function splitSummary(text) {
  const blurKey = "Ready to Turn Up the Heat";
  const idx = text.indexOf(blurKey);
  if (idx === -1) return { visible: text, blurred: "" };
  return { visible: text.slice(0, idx), blurred: text.slice(idx) };
}
// Render text with real line breaks
function TextBlock({ text, style }) {
  if (!text) return null;
  return (
    <div style={style}>
      {text.split("\n").map((line, i) => (
        <span key={i}>{line}{i < text.split("\n").length - 1 && <br/>}</span>
      ))}
    </div>
  );
}

function FireIcons({ value }) {
  const v = Number(value)||0;
  const on  = { fontSize:"0.9rem", color:"#E8593C" };
  const off = { fontSize:"0.9rem", color:"#3D3228", opacity:0.25 };
  return (
    <span style={{ display:"inline-flex", gap:1 }}>
      <span style={v>=1?on:off}>🔥</span>
      <span style={v>=2?on:off}>🔥</span>
      <span style={v>=3?on:off}>🔥</span>
      <span style={v>=4?on:off}>🔥</span>
      <span style={v>=5?on:off}>🔥</span>
    </span>
  );
}


function WelcomeEmailButton({ email, name }) {
  const [status, setStatus] = React.useState(null);
  const send = async () => {
    setStatus("sending");
    const ANON = SUPABASE_ANON_KEY;
    try {
      const res = await fetch(SUPABASE_URL + "/functions/v1/welcome", {
        method:"POST",
        headers:{"Content-Type":"application/json","apikey":ANON,"Authorization":"Bearer "+ANON},
        body:JSON.stringify({ email, name })
      });
      const d = await res.json();
      setStatus(d.ok||d.dry_run ? "sent" : "error");
    } catch(e){ console.error(e); setStatus("error"); }
  };
  if(status==="sent") return <div style={{fontSize:"0.78rem",color:"#5DCAA5"}}>✓ Welcome email sent to {email}</div>;
  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={send} disabled={status==="sending"} style={{fontSize:"0.78rem"}}>
        {status==="sending"?<><span className="spinner" style={{width:10,height:10}}/> Sending...</>:"📧 Send Welcome Email"+(name?" to "+name:"")}
      </button>
      {status==="error"&&<div style={{fontSize:"0.72rem",color:"var(--ember)",marginTop:4}}>Failed — check console.</div>}
    </>
  );
}

export default function CoachPortal() {
  const [session, setSession] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(null);
  const [generatingTP, setGeneratingTP] = useState(null);
  const [generatingNotes, setGeneratingNotes] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [talkingPts, setTalkingPts] = useState({});
  const [coachNotes, setCoachNotes] = useState({});
  const [notesEditing, setNotesEditing] = useState({});
  const [copied, setCopied] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingXLSX, setExportingXLSX] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const toggleSelect = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const selectAll = () => setSelectedIds(new Set(clients.map(c=>c.id)));
  const clearSelection = () => setSelectedIds(new Set());
  const selectedClients = clients.filter(c => selectedIds.has(c.id));
  const [isDemoMode, setIsDemoMode] = useState(false);
  const saveTimers = useRef({});

  useEffect(() => {
    if (!supabase) { setAuthChecked(true); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!session || !COACH_EMAILS.includes(session.user?.email)) return;
    if (!isDemoMode) loadClients();
  }, [session]);

  useEffect(() => {
    if (!selected || isDemoMode) return;
    const hasSummary = summaries[selected.id] || selected.coaching_summary;
    if (!hasSummary && !generatingSummary) generateSummary(selected);
    const hasTP = talkingPts[selected.id] || selected.talking_points;
    if (!hasTP && !generatingTP) generateTalkingPoints(selected);
    if (selected.coach_notes && !coachNotes[selected.id]) {
      setCoachNotes(prev => ({ ...prev, [selected.id]: selected.coach_notes }));
      setNotesEditing(prev => ({ ...prev, [selected.id]: selected.coach_notes }));
    }
  }, [selected]);

  const loadClients = async () => {
    setFetching(true);
    const token = JSON.parse(localStorage.getItem("sb-rqbsyadjyvzbbirsdfan-auth-token")||"{}")?.access_token || SUPABASE_ANON_KEY;
    try {
      const res = await fetch(SUPABASE_URL+"/rest/v1/intake_leads?select=*&order=submitted_at.desc&limit=100",
        { headers: { apikey: SUPABASE_ANON_KEY, Authorization:"Bearer "+token } });
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
        const s={}, tp={}, cn={};
        data.forEach(c => {
          if (c.coaching_summary) s[c.id] = c.coaching_summary;
          if (c.talking_points)   tp[c.id] = c.talking_points;
          if (c.coach_notes)      cn[c.id] = c.coach_notes;
        });
        setSummaries(s); setTalkingPts(tp); setCoachNotes(cn);
        setNotesEditing(cn);
        // Auto-open client from URL param ?client=email
        const params = new URLSearchParams(window.location.search);
        const targetEmail = params.get('client');
        if (targetEmail) {
          const match = data.find(c => c.email === decodeURIComponent(targetEmail));
          if (match) setSelected(match);
        }
      }
    } catch(e) { console.error(e); }
    setFetching(false);
  };

  const loadDemoMode = () => {
    setIsDemoMode(true);
    setClients(DEMO_CLIENTS);
    const s={}, tp={}, cn={};
    DEMO_CLIENTS.forEach(c => {
      if (c.coaching_summary) s[c.id] = c.coaching_summary;
      if (c.talking_points)   tp[c.id] = c.talking_points;
    });
    setSummaries(s); setTalkingPts(tp); setCoachNotes(cn); setNotesEditing({});
    setSelected(null);
  };

  const clearDemoMode = () => {
    setIsDemoMode(false);
    setClients([]); setSummaries({}); setTalkingPts({}); setCoachNotes({}); setNotesEditing({});
    setSelected(null);
    loadClients();
  };

  const buildContext = (client) => {
    const scores = client.scores||{};
    const profile = client.profile||{};
    const personality = client.personality||{};
    const detailedScores = PILLAR_GROUPS.map(g => {
      const lines = g.keys.filter(k=>Number(scores[k])>0)
        .map(k=>"  "+(SCORE_LABELS[k]||k)+": "+scores[k]+"/5").join("\n");
      return g.label+" (avg "+pillarAvg(g.keys,scores)+"/5):\n"+(lines||"  No data");
    }).join("\n\n");
    const ctx = [
      profile.age && "Age: "+profile.age,
      profile.gender && "Gender: "+profile.gender,
      profile.occupation && "Occupation: "+profile.occupation,
      profile.location && "Location: "+profile.location,
      personality.tests?.length && "Assessments: "+personality.tests.join(", "),
      personality.results && "Results: "+personality.results,
      personality.background && "Background: "+personality.background,
    ].filter(Boolean).join("\n");
    return { detailedScores, ctx };
  };

  const callCoach = async (prompt, system, max_tokens=400) => {
    const res = await fetch(SUPABASE_URL+"/functions/v1/coach", {
      method:"POST",
      headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+SUPABASE_ANON_KEY},
      body:JSON.stringify({ messages:[{role:"user",content:prompt}], system, max_tokens })
    });
    const d = await res.json();
    return stripBold(d.content?.[0]?.text||"");
  };

  const saveField = async (clientId, field, value) => {
    if (isDemoMode) return;
    const token = JSON.parse(localStorage.getItem("sb-rqbsyadjyvzbbirsdfan-auth-token")||"{}")?.access_token || SUPABASE_ANON_KEY;
    await fetch(SUPABASE_URL+"/rest/v1/intake_leads?id=eq."+clientId, {
      method:"PATCH",
      headers:{"Content-Type":"application/json","apikey":SUPABASE_ANON_KEY,"Authorization":"Bearer "+token,"Prefer":"return=minimal"},
      body:JSON.stringify({ [field]: value })
    });
  };

  const generateSummary = async (client) => {
    if (summaries[client.id]||generatingSummary||isDemoMode) return;
    setGeneratingSummary(client.id);
    const { detailedScores, ctx } = buildContext(client);
    const prompt = "Write a coaching summary for "+(client.name||"this leader")+" with exactly these 4 labeled sections. Plain text, no asterisks, no markdown:\n\n"+
      "What's Burning Well:\n[1-2 sentences citing specific high scores by name]\n\n"+
      "What Needs Tending:\n[1-2 sentences citing specific low scores by name]\n\n"+
      "Your Single Most Important Next Step:\n[1 concrete actionable sentence]\n\n"+
      "Ready to Turn Up the Heat?:\n[1 sentence CTA to book at thebonfirecompany.com/coaching]\n\n"+
      "Context:\n"+ctx+"\nSpark: "+(client.spark_statement||"Not defined")+"\nOverall: "+client.overall_score+"/5\n\n"+detailedScores;
    try {
      const text = await callCoach(prompt, "You are a Bonfire Method coach. CRITICAL: Output plain text only. No ##, no **, no asterisks, no bullet points, no backticks. Section headers use plain text followed by a colon only.", 400);
      if (text) { setSummaries(prev=>({...prev,[client.id]:text})); await saveField(client.id,"coaching_summary",text); }
    } catch(e){console.error(e);}
    setGeneratingSummary(null);
  };

  const generateTalkingPoints = async (client) => {
    if (talkingPts[client.id]||generatingTP||isDemoMode) return;
    setGeneratingTP(client.id);
    const { detailedScores, ctx } = buildContext(client);
    const prompt = "Prepare exactly 5 numbered discovery call talking points for "+(client.name||"this leader")+".\n\n"+
      "Context:\n"+ctx+"\nSpark: "+(client.spark_statement||"Not defined")+"\nOverall: "+client.overall_score+"/5\n\n"+detailedScores+
      "\n\nEach of the 5 points should: open a specific tension from their actual scores, include a probing question, and hint at a future coaching opportunity."+
      " Format: each point starts with its number (1. 2. 3. etc) on its own paragraph, 2-3 sentences. Plain text only, no asterisks or markdown.";
    try {
      const text = await callCoach(prompt, "You are a Bonfire Method coach. Be incisive and specific. Return exactly 5 numbered points. No markdown.", 500);
      if (text) { setTalkingPts(prev=>({...prev,[client.id]:text})); await saveField(client.id,"talking_points",text); }
    } catch(e){console.error(e);}
    setGeneratingTP(null);
  };

  const generateCoachNotes = async (client) => {
    if (generatingNotes||isDemoMode) return;
    setGeneratingNotes(client.id);
    const { detailedScores, ctx } = buildContext(client);
    const existingNotes = coachNotes[client.id]||"";
    const prompt = "Draft coach session preparation notes for "+(client.name||"this leader")+".\n\n"+
      "Context:\n"+ctx+"\nSpark: "+(client.spark_statement||"Not defined")+"\nOverall: "+client.overall_score+"/5\n\n"+detailedScores+
      (existingNotes ? "\n\nExisting notes to build on:\n"+existingNotes : "")+
      "\n\nInclude these 4 sections with plain text headers followed by a colon:\n"+
      "Client Snapshot:\n[2-3 sentences on their situation]\n\n"+
      "Top 3 Coaching Priorities:\n[numbered list based on scores]\n\n"+
      "Session Goal:\n[what success looks like for the first session]\n\n"+
      "Watch-Fors:\n[2-3 things to listen for in the conversation]\n\nPlain text only. No asterisks or markdown.";
    try {
      const text = await callCoach(prompt, "You are a Bonfire Method coach writing internal session prep notes. Plain text only — no ##, no **, no asterisks, no markdown formatting whatsoever.", 450);
      if (text) {
        setCoachNotes(prev=>({...prev,[client.id]:text}));
        setNotesEditing(prev=>({...prev,[client.id]:text}));
        await saveField(client.id,"coach_notes",text);
      }
    } catch(e){console.error(e);}
    setGeneratingNotes(null);
  };

  const handleNotesChange = (clientId, val) => {
    setNotesEditing(prev=>({...prev,[clientId]:val}));
    clearTimeout(saveTimers.current[clientId]);
    saveTimers.current[clientId] = setTimeout(async () => {
      setCoachNotes(prev=>({...prev,[clientId]:val}));
      await saveField(clientId,"coach_notes",val);
    }, 1200);
  };

  const handleLogin = async () => {
    if (!supabase) return;
    setLoginLoading(true); setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email:emailInput, password });
    if (error) { setLoginError(error.message); setLoginLoading(false); return; }
    if (!COACH_EMAILS.includes(data.user?.email)) {
      await supabase.auth.signOut();
      setLoginError("Access restricted to authorized coaches only.");
      setLoginLoading(false); return;
    }
    setSession(data.session); setLoginLoading(false);
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null); setClients([]); setSelected(null); setIsDemoMode(false);
  };


  const handleExportClient = async (client) => {
    setExportingPDF(true);
    try {
      await exportClientPDF(
        client,
        summaries[client.id] || client.coaching_summary || '',
        talkingPts[client.id] || client.talking_points || '',
        notesEditing[client.id] !== undefined ? notesEditing[client.id] : (coachNotes[client.id] || client.coach_notes || '')
      );
    } catch(e) { console.error('PDF export error:', e); }
    setExportingPDF(false);
  };

  const handleExportAggregate = async () => {
    const targets = selectedIds.size > 0 ? selectedClients : clients;
    setExportingPDF(true);
    try { await exportAggregatePDF(targets); } catch(e) { console.error(e); }
    setExportingPDF(false);
  };

  const handleExportExcel = async () => {
    const targets = selectedIds.size > 0 ? selectedClients : clients;
    setExportingXLSX(true);
    try { await exportExcel(targets); } catch(e) { console.error(e); }
    setExportingXLSX(false);
  };

  const copySQL = (email) => {
    navigator.clipboard?.writeText(buildApproveSQL(email)).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };

  if (!authChecked) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--coal)"}}>
      <span className="spinner"/>
    </div>
  );

  if (!session||!COACH_EMAILS.includes(session.user?.email)) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--coal)",padding:"1rem"}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:"2rem"}}>
          <div style={{fontSize:"2.5rem",marginBottom:8}}>🔥</div>
          <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--ember)",marginBottom:4}}>Coach Portal</div>
          <div style={{fontSize:"0.82rem",color:"var(--smoke)"}}>Bonfire Method · Restricted Access</div>
        </div>
        <div className="card" style={{padding:"1.75rem"}}>
          <div className="form-group">
            <label>Coach Email</label>
            <input type="email" value={emailInput} onChange={e=>setEmailInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="coach@email.com"/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} placeholder="••••••••"/>
          </div>
          {loginError&&<div style={{fontSize:"0.78rem",color:"var(--ember)",marginBottom:12}}>{loginError}</div>}
          <button className="btn btn-primary" onClick={handleLogin} disabled={loginLoading||!emailInput||!password}
            style={{width:"100%",justifyContent:"center",marginBottom:8}}>
            {loginLoading?<><span className="spinner" style={{width:12,height:12}}/> Signing in...</>:"Sign In"}
          </button>
          <button className="btn btn-ghost" onClick={()=>{ setSession({user:{email:"jasonrumbough@gmail.com"}}); loadDemoMode(); }}
            style={{width:"100%",justifyContent:"center",opacity:0.7}}>👁 View Demo</button>
        </div>
      </div>
    </div>
  );

  if (selected) {
    const s = selected.scores||{};
    const profile = selected.profile||{};
    const personality = selected.personality||{};
    const existingSummary = stripBold(summaries[selected.id]||selected.coaching_summary||"");
    const existingTP = stripBold(talkingPts[selected.id]||selected.talking_points||"");
    const currentNotes = notesEditing[selected.id] !== undefined ? notesEditing[selected.id] : (coachNotes[selected.id]||selected.coach_notes||"");

    const handleApproveClient = async () => {
      if (!selected || selected.status === 'approved') return;
      try {
        const updatedPayload = { ...(selected.payload || {}), approved: true };
        await supabase.from('user_data').update({ payload: updatedPayload }).eq('user_id', selected.id);
        setClients(prev => prev.map(c => c.id === selected.id ? { ...c, status: 'approved' } : c));
        setSelected(prev => ({ ...prev, status: 'approved' }));
      } catch(e) { console.error('Approve failed:', e); }
    };

    const handleDeleteClient = async () => {
      if (!selected) return;
      if (!window.confirm('Delete ' + selected.name + '? This cannot be undone.')) return;
      try {
        await supabase.from('user_data').delete().eq('user_id', selected.id);
        setClients(prev => prev.filter(c => c.id !== selected.id));
        setSelected(null);
      } catch(e) { console.error('Delete failed:', e); }
    };


    const sqlCmd = buildApproveSQL(selected.email||"");

    return (
      <div style={{minHeight:"100vh",background:"var(--coal)",padding:"1.5rem 1rem"}}>
        <div style={{maxWidth:740,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
            <button className="btn btn-ghost" onClick={()=>{setSelected(null);setNotesEditing({});}}>← All Clients</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>handleExportClient(selected)} disabled={exportingPDF}
              style={{color:"var(--ember)",borderColor:"rgba(232,89,60,0.4)",fontSize:"0.78rem"}}>
              {exportingPDF ? <><span className="spinner" style={{width:10,height:10}}/> Generating...</> : "⬇ Export PDF"}
            </button>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {isDemoMode&&<span style={{fontSize:"0.68rem",color:"#C9922F",background:"rgba(201,146,47,0.15)",padding:"2px 8px",borderRadius:20}}>Demo Mode</span>}
              <div style={{fontSize:"0.72rem",color:"var(--smoke)"}}>Coach Portal</div>
            </div>
          </div>

          <div className="card" style={{marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontFamily:"var(--font-display)",fontSize:"1.4rem",color:"var(--cream)",marginBottom:4}}>{selected.name||"Anonymous"}</div>
                <div style={{fontSize:"0.75rem",color:"var(--smoke)"}}>Submitted {new Date(selected.submitted_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</div>
              </div>
              <span style={{fontSize:"0.72rem",padding:"3px 10px",borderRadius:20,
                background:selected.status==="approved"?"rgba(42,157,143,0.15)":"rgba(232,89,60,0.15)",
                color:selected.status==="approved"?"#5DCAA5":"var(--ember-light)"}}>
                {selected.status==="approved"?"✓ Approved":"Pending"}
              </span>
              {selected.status !== 'approved' && (
                <button onClick={handleApproveClient}
                  style={{marginLeft:8,padding:"3px 12px",fontSize:"0.72rem",background:"rgba(42,157,143,0.2)",color:"#5DCAA5",border:"1px solid rgba(42,157,143,0.4)",borderRadius:6,cursor:"pointer"}}>
                  ✓ Approve
                </button>
              )}
              <button onClick={handleDeleteClient}
                style={{marginLeft:6,padding:"3px 12px",fontSize:"0.72rem",background:"rgba(232,89,60,0.1)",color:"var(--ember-light)",border:"1px solid rgba(232,89,60,0.3)",borderRadius:6,cursor:"pointer"}}>
                🗑 Delete
              </button>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16}}>
              {[["Email",selected.email],["Age",profile.age],["Gender",profile.gender],["Occupation",profile.occupation],["Location",profile.location]]
                .filter(([,v])=>v).map(([label,val])=>(
                <div key={label} style={{padding:"6px 10px",background:"var(--ash)",borderRadius:6}}>
                  <div style={{fontSize:"0.6rem",color:"var(--smoke)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{label}</div>
                  <div style={{fontSize:"0.82rem",color:"var(--pale)"}}>{val}</div>
                </div>
              ))}
            </div>

            {(personality.tests?.length||personality.results||personality.background) ? (
              <div style={{padding:"10px 12px",background:"rgba(232,89,60,0.06)",border:"1px solid rgba(232,89,60,0.15)",borderRadius:8,marginBottom:16}}>
                <div style={{fontSize:"0.62rem",color:"var(--ember)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8,fontWeight:600}}>Personality & Leadership Style</div>
                {personality.tests?.length>0&&<div style={{marginBottom:6}}><div style={{fontSize:"0.62rem",color:"var(--smoke)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>Assessments</div><div style={{fontSize:"0.82rem",color:"var(--pale)"}}>{personality.tests.join(", ")}</div></div>}
                {personality.results&&<div style={{marginBottom:6}}><div style={{fontSize:"0.62rem",color:"var(--smoke)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>Results</div><div style={{fontSize:"0.82rem",color:"var(--pale)"}}>{personality.results}</div></div>}
                {personality.background&&<div><div style={{fontSize:"0.62rem",color:"var(--smoke)",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>Notes</div><div style={{fontSize:"0.82rem",color:"var(--fog)",lineHeight:1.55}}>{personality.background}</div></div>}
              </div>
            ) : (
              <div style={{padding:"8px 12px",background:"var(--ash)",borderRadius:8,marginBottom:16,fontSize:"0.75rem",color:"var(--smoke)",fontStyle:"italic"}}>No personality or leadership style data provided.</div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
              {[{label:"Overall",val:selected.overall_score||"—",color:"#E8593C"},{label:"SPARK",val:pillarAvg(PILLAR_GROUPS[0].keys,s),color:"#E8593C"},{label:"SYSTEMS",val:pillarAvg(PILLAR_GROUPS[1].keys,s),color:"#C9922F"},{label:"AIR",val:pillarAvg(PILLAR_GROUPS[2].keys,s),color:"#2A9D8F"}]
                .map(sc=>(
                <div key={sc.label} style={{textAlign:"center",padding:"0.75rem",background:"var(--ash)",borderRadius:8,borderTop:"2px solid "+sc.color}}>
                  <div style={{fontFamily:"var(--font-display)",fontSize:"1.6rem",color:sc.color,lineHeight:1}}>{sc.val}</div>
                  <div style={{fontSize:"0.6rem",color:"var(--smoke)",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:3}}>{sc.label}</div>
                </div>
              ))}
            </div>

            {selected.spark_statement&&(
              <div style={{background:"rgba(232,89,60,0.08)",border:"1px solid rgba(232,89,60,0.2)",borderRadius:8,padding:"0.75rem 1rem",marginBottom:16}}>
                <div style={{fontSize:"0.62rem",color:"var(--ember)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Spark Statement</div>
                <div style={{fontStyle:"italic",fontSize:"0.9rem",color:"var(--pale)",lineHeight:1.6}}>"{selected.spark_statement}"</div>
              </div>
            )}

            {PILLAR_GROUPS.map(g=>{
              const rated=g.keys.filter(k=>Number(s[k])>0);
              if(!rated.length) return null;
              return (
                <div key={g.label} style={{marginBottom:12}}>
                  <div style={{fontSize:"0.68rem",color:g.color,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600,marginBottom:6}}>{g.label} — avg {pillarAvg(g.keys,s)}/5</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                    {rated.map(k=>(
                      <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 10px",background:"var(--ash)",borderRadius:6}}>
                        <span style={{fontSize:"0.75rem",color:"var(--pale)"}}>{SCORE_LABELS[k]}</span>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <FireIcons value={s[k]}/>
                          <span style={{fontSize:"0.7rem",color:Number(s[k])>=4?"#5DCAA5":Number(s[k])>=3?"#C9922F":"#E8593C",minWidth:22,textAlign:"right"}}>{s[k]}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coaching Summary — only "Ready to Turn Up the Heat" section blurred */}
          <div className="card" style={{marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div className="card-title">Coaching Summary</div>
                <div style={{fontSize:"0.72rem",color:"var(--smoke)",marginTop:2}}>Shared with client · CTA section blurred to prompt coaching</div>
              </div>
              {generatingSummary===selected.id&&<span style={{fontSize:"0.72rem",color:"var(--smoke)",display:"flex",alignItems:"center",gap:6}}><span className="spinner" style={{width:10,height:10}}/> Generating...</span>}
            </div>
            {generatingSummary===selected.id&&!existingSummary&&(
              <div style={{padding:"1rem",background:"var(--ash)",borderRadius:8,color:"var(--smoke)",fontSize:"0.82rem",display:"flex",gap:8,alignItems:"center"}}><span className="spinner"/> Analyzing scores...</div>
            )}
            {existingSummary&&(
              <TextBlock text={existingSummary} style={{fontSize:"0.875rem",color:"var(--pale)",lineHeight:1.85}}/>
            )}
            {!existingSummary&&generatingSummary!==selected.id&&(
              <div style={{fontSize:"0.82rem",color:"var(--smoke)",fontStyle:"italic",padding:"1rem",background:"var(--ash)",borderRadius:8}}>
                {isDemoMode?"Summary loaded from demo data.":"Generating automatically..."}
              </div>
            )}
          </div>

          {/* Talking Points */}
          <div className="card" style={{marginBottom:"1rem",border:"1px solid rgba(42,157,143,0.3)",background:"rgba(42,157,143,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontFamily:"var(--font-display)",fontSize:"0.95rem",color:"#5DCAA5",marginBottom:2}}>🎯 Discovery Call Talking Points</div>
                <div style={{fontSize:"0.72rem",color:"var(--smoke)"}}>Coach eyes only · Not visible to client</div>
              </div>
              {generatingTP===selected.id&&<span style={{fontSize:"0.72rem",color:"var(--smoke)",display:"flex",alignItems:"center",gap:6}}><span className="spinner" style={{width:10,height:10}}/> Generating...</span>}
            </div>
            {existingTP
              ? <TextBlock text={existingTP} style={{fontSize:"0.875rem",color:"var(--pale)",lineHeight:1.85}}/>
              : <div style={{fontSize:"0.82rem",color:"var(--smoke)",fontStyle:"italic",padding:"1rem",background:"var(--ash)",borderRadius:8}}>{isDemoMode?"Talking points loaded.":"Generating automatically..."}</div>
            }
          </div>

          {/* Coach's Notes */}
          <div className="card" style={{marginBottom:"1rem",border:"1px solid rgba(201,146,47,0.3)",background:"rgba(201,146,47,0.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontFamily:"var(--font-display)",fontSize:"0.95rem",color:"#C9922F",marginBottom:2}}>📋 Coach's Notes</div>
                <div style={{fontSize:"0.72rem",color:"var(--smoke)"}}>Private · Not visible to client · Auto-saves</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={()=>generateCoachNotes(selected)}
                disabled={generatingNotes===selected.id||isDemoMode}
                style={{fontSize:"0.7rem",borderColor:"rgba(201,146,47,0.4)",color:"#C9922F"}}>
                {generatingNotes===selected.id?<><span className="spinner" style={{width:10,height:10}}/> Generating...</>:currentNotes?"↻ Regenerate":"✦ Generate Notes"}
              </button>
            </div>
            <textarea value={currentNotes} onChange={e=>handleNotesChange(selected.id,e.target.value)}
              placeholder={isDemoMode?"Demo mode — notes won't save. Sign in to use real mode.":"Add session notes here, or click Generate Notes for an AI draft."}
              rows={6}
              style={{width:"100%",boxSizing:"border-box",background:"var(--ash)",border:"1px solid var(--charcoal)",borderRadius:8,padding:"0.75rem",color:"var(--pale)",fontSize:"0.82rem",lineHeight:1.65,resize:"vertical",fontFamily:"var(--font-body)"}}/>
            {generatingNotes===selected.id&&<div style={{fontSize:"0.75rem",color:"#C9922F",marginTop:6,display:"flex",gap:6,alignItems:"center"}}><span className="spinner" style={{width:10,height:10}}/> Drafting session prep notes...</div>}
          </div>

          {!isDemoMode&&(
            <div style={{padding:"0.75rem 1rem",background:"rgba(42,157,143,0.06)",border:"1px solid rgba(42,157,143,0.2)",borderRadius:10}}>
              <div style={{fontSize:"0.72rem",color:"#5DCAA5",fontWeight:600,marginBottom:6}}>To grant full app access, run in Supabase SQL Editor:</div>
              <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                <div style={{flex:1,fontSize:"0.68rem",color:"var(--smoke)",wordBreak:"break-all",background:"var(--ash)",padding:"8px 10px",borderRadius:6,fontFamily:"monospace",lineHeight:1.5}}>{sqlCmd}</div>
                <button className="btn btn-ghost btn-sm" onClick={()=>copySQL(selected.email||"")} style={{flexShrink:0,fontSize:"0.7rem"}}>{copied?"✓ Copied":"Copy"}</button>
              </div>
              <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid rgba(42,157,143,0.2)"}}>
                <div style={{fontSize:"0.72rem",color:"var(--smoke)",marginBottom:8}}>After running the SQL above, send the user their welcome email with login info:</div>
                <WelcomeEmailButton email={selected.email||""} name={selected.name||""}/>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"var(--coal)",padding:"1.5rem 1rem"}}>
      <div style={{maxWidth:760,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--ember)"}}>🔥 Coach Portal</div>
              {isDemoMode&&<span style={{fontSize:"0.68rem",color:"#C9922F",background:"rgba(201,146,47,0.15)",padding:"2px 8px",borderRadius:20}}>Demo Mode</span>}
            </div>
            <div style={{fontSize:"0.72rem",color:"var(--smoke)",marginTop:2}}>{clients.length} client{clients.length!==1?"s":""} · {session.user?.email}</div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            {!isDemoMode
              ?<button className="btn btn-ghost btn-sm" onClick={loadDemoMode} style={{color:"#C9922F",borderColor:"rgba(201,146,47,0.4)"}}>👁 Demo</button>
              :<button className="btn btn-ghost btn-sm" onClick={clearDemoMode} style={{color:"var(--ember)"}}>✕ Demo</button>
            }
            {!isDemoMode&&<button className="btn btn-ghost btn-sm" onClick={loadClients} disabled={fetching}>{fetching?"...":"Refresh"}</button>}
            {clients.length>0&&(
              <button className="btn btn-ghost btn-sm" onClick={()=>{setSelectMode(s=>!s);clearSelection();}}
                style={{color:selectMode?"var(--ember-light)":"var(--smoke)",borderColor:selectMode?"rgba(232,89,60,0.5)":""}}>
                {selectMode?"✕ Cancel Select":"☑ Select"}
              </button>
            )}
            {clients.length>0&&<button className="btn btn-ghost btn-sm" onClick={handleExportAggregate} disabled={exportingPDF}
              style={{color:"var(--ember)",borderColor:"rgba(232,89,60,0.4)",fontSize:"0.72rem"}}>
              {exportingPDF?"Generating...":"⬇ PDF"+(selectedIds.size>0?" ("+selectedIds.size+")":" (All)")}
            </button>}
            {clients.length>0&&<button className="btn btn-ghost btn-sm" onClick={handleExportExcel} disabled={exportingXLSX}
              style={{color:"#2A9D8F",borderColor:"rgba(42,157,143,0.4)",fontSize:"0.72rem"}}>
              {exportingXLSX?"Exporting...":"⬇ Excel"+(selectedIds.size>0?" ("+selectedIds.size+")":" (All)")}
            </button>}
            <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>

        {selectMode&&clients.length>0&&(
          <div style={{display:"flex",gap:8,alignItems:"center",padding:"6px 12px",background:"var(--ash)",borderRadius:8,marginBottom:8}}>
            <span style={{fontSize:"0.75rem",color:"var(--smoke)"}}>
              {selectedIds.size>0?selectedIds.size+" selected":"Select clients to export"}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={selectAll} style={{fontSize:"0.7rem"}}>Select All</button>
            {selectedIds.size>0&&<button className="btn btn-ghost btn-sm" onClick={clearSelection} style={{fontSize:"0.7rem"}}>Clear</button>}
          </div>
        )}
        {fetching&&<div style={{textAlign:"center",padding:"3rem"}}><span className="spinner"/></div>}
        {!fetching&&clients.length===0&&(
          <div className="card" style={{textAlign:"center",padding:"3rem"}}>
            <div style={{color:"var(--smoke)",marginBottom:12}}>No intake submissions yet.</div>
            <button className="btn btn-ghost" onClick={loadDemoMode} style={{color:"#C9922F"}}>👁 Load Demo Data</button>
          </div>
        )}

        {clients.map(client=>{
          const s=client.scores||{};
          const profile=client.profile||{};
          const hasSummary=!!(summaries[client.id]||client.coaching_summary);
          const hasTP=!!(talkingPts[client.id]||client.talking_points);
          const hasNotes=!!(coachNotes[client.id]||client.coach_notes);
          return (
            <div key={client.id} className="card"
              style={{cursor:"pointer",marginBottom:"0.75rem",borderLeft:"3px solid "+(client.status==="approved"?"#2A9D8F":"var(--ember)"),position:"relative",
                background:selectedIds.has(client.id)?"rgba(232,89,60,0.06)":""}}
              onClick={()=>selectMode?toggleSelect(client.id):setSelected(client)}>
              {selectMode&&(
                <div style={{position:"absolute",top:10,right:10,width:18,height:18,borderRadius:4,
                  border:"2px solid "+(selectedIds.has(client.id)?"var(--ember)":"var(--ash)"),
                  background:selectedIds.has(client.id)?"var(--ember)":"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {selectedIds.has(client.id)&&<span style={{color:"#fff",fontSize:"11px",lineHeight:1}}>✓</span>}
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div style={{fontWeight:600,color:"var(--cream)",fontSize:"0.95rem"}}>{client.name||"Anonymous"}</div>
                  <div style={{fontSize:"0.72rem",color:"var(--smoke)",marginTop:2,display:"flex",gap:8,flexWrap:"wrap"}}>
                    {client.email&&<span>{client.email}</span>}
                    {profile.occupation&&<span>· {profile.occupation}</span>}
                    {profile.location&&<span>· {profile.location}</span>}
                    {profile.age&&<span>· Age {profile.age}</span>}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {hasSummary&&<span style={{fontSize:"0.62rem",color:"#5DCAA5"}}>✓ Summary</span>}
                  {hasTP&&<span style={{fontSize:"0.62rem",color:"#2A9D8F"}}>✓ TP</span>}
                  {hasNotes&&<span style={{fontSize:"0.62rem",color:"#C9922F"}}>✓ Notes</span>}
                  <div style={{textAlign:"right",marginLeft:4}}>
                    <div style={{fontFamily:"var(--font-display)",fontSize:"1.5rem",color:"var(--ember)",lineHeight:1}}>{client.overall_score||"—"}</div>
                    <div style={{fontSize:"0.58rem",color:"var(--smoke)"}}>overall</div>
                  </div>
                  <span style={{fontSize:"0.68rem",padding:"2px 8px",borderRadius:20,
                    background:client.status==="approved"?"rgba(42,157,143,0.15)":"rgba(232,89,60,0.15)",
                    color:client.status==="approved"?"#5DCAA5":"var(--ember-light)"}}>
                    {client.status==="approved"?"Approved":"Pending"}
                  </span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                {PILLAR_GROUPS.map(g=>(
                  <div key={g.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 8px",background:"var(--ash)",borderRadius:6}}>
                    <span style={{fontSize:"0.68rem",color:g.color}}>{g.label.split("—")[0].trim()}</span>
                    <span style={{fontSize:"0.78rem",fontWeight:600,color:"var(--pale)"}}>{pillarAvg(g.keys,s)}/5</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}