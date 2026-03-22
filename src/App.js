// cache-bust: 1774059311394
import { useState, useEffect, useCallback } from "react";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./utils/supabase";
import Sidebar from "./components/Sidebar";
import AuthPage from "./pages/AuthPage";
import IntakePage from "./pages/IntakePage";
import IntakeResultsPage from "./pages/IntakeResultsPage";
import Dashboard from "./pages/Dashboard";
import SparkPage from "./pages/SparkPage";
import AirPage from "./pages/AirPage";
import SystemsPage from "./pages/SystemsPage";
import AuditPage from "./pages/AuditPage";
import CoachPage from "./pages/CoachPage";
import NotesPage from "./pages/NotesPage";
import HistoryPage from "./pages/HistoryPage";
import PersonalityPage from "./pages/PersonalityPage";
import HealthPage from "./pages/HealthPage";
import CoachPortal from "./pages/CoachPortal";
import ResourcesPage from "./pages/ResourcesPage";
import { supabase, supabaseConfigured, loadUserData, saveUserData } from "./utils/supabase";
import "./styles.css";

const LS_KEY = "bonfire_v1";
const fromLS = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; } };
const toLS = (d) => { try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch {} };
const clearLS = () => { try { localStorage.removeItem(LS_KEY); } catch {} };

// Emails that are always approved (admin bypass)
const ADMIN_EMAILS = ["jasonrumbough@gmail.com"];

function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function PendingScreen({ onSignOut, onViewResults }) {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--coal)", padding:"2rem" }}>
      <div style={{ maxWidth:480, textAlign:"center" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔥</div>
        <div style={{ fontFamily:"var(--font-display)", fontSize:"1.5rem", color:"var(--cream)", marginBottom:8 }}>Your fire is queued.</div>
        <div style={{ fontSize:"0.875rem", color:"var(--fog)", lineHeight:1.8, marginBottom:"2rem" }}>
          Your intake has been received and is under review. A Bonfire Method coach will approve your access shortly.
          <br/><br/>
          You'll receive an email once you're approved. In the meantime, check your coaching summary PDF.
        </div>
        <div style={{ background:"rgba(232,89,60,0.08)", border:"1px solid rgba(232,89,60,0.2)", borderRadius:12, padding:"1.25rem", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:"0.75rem", color:"var(--ember)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Questions?</div>
          <div style={{ fontSize:"0.875rem", color:"var(--pale)" }}>thebonfirecompany.com</div>
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <button className="btn btn-primary" onClick={onViewResults}>View My Results</button>
          <button className="btn btn-ghost" onClick={onSignOut} style={{ fontSize:"0.8rem" }}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--coal)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"2.5rem", marginBottom:12 }}>🔥</div>
        <span className="spinner" />
      </div>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [showEraseConfirm, setShowEraseConfirm] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState("");
  const [welcomeLoading, setWelcomeLoading] = useState(false);
  const [intakeData, setIntakeData] = useState(null);

  // Auth init
  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      // No Supabase — load from localStorage and skip auth
      setData(fromLS());
      setAuthLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load user data when session changes
  useEffect(() => {
    if (!session?.user?.id) return;
    setDataLoading(true);
    (async () => {
      // Always clear localStorage when a new user signs in
      // to prevent stale data from a previous user session
      const currentUserId = localStorage.getItem("bonfire_user_id");
      if (currentUserId && currentUserId !== session.user.id) {
        clearLS();
      }
      localStorage.setItem("bonfire_user_id", session.user.id);

      const remote = await loadUserData(session.user.id);
      if (remote && Object.keys(remote).length > 0) {
        // Remote has data — use it (it's the source of truth)
        setData(remote);
        toLS(remote);
      } else {
        // Remote is empty — check if localStorage has data to restore
        const local = fromLS();
        if (local && Object.keys(local).length > 2) {
          // Push local data up to Supabase
          console.log("Restoring local data to Supabase...", Object.keys(local).length, "keys");
          setData(local);
          const saved = await saveUserData(session.user.id, local);
          console.log("Supabase restore result:", saved);
        } else {
          // Genuinely new user
          setData({});
          toLS({});
        }
      }
      setDataLoading(false);
      // Welcome modal — once per day
      try {
        const _today = new Date().toISOString().split("T")[0];
        const _stored = localStorage.getItem("bonfire_welcome_" + _today);
        if (!_stored) {
          setShowWelcome(true);
          localStorage.setItem("bonfire_welcome_" + _today, "1");
          // Generate AI message
          setWelcomeLoading(true);
          const _loadedData = remote && Object.keys(remote).length > 0 ? remote : (local || {});
          const _scores = _loadedData.auditScores || {};
          const _avg = Object.values(_scores).filter(v=>v>0).reduce((a,b)=>a+b,0) / (Object.values(_scores).filter(v=>v>0).length||1);
          const _stmt = _loadedData.sparkStatement || "";
          const _todayDone = !!(_loadedData.allAudits||{})[_today];
          const _prompt = "You are a warm, direct leadership coach. In 1-2 sentences, greet this leader and give them a specific prompt. " +
            (_todayDone ? "They completed today's check-in. Acknowledge and offer a focus thought." : "They have NOT done today's check-in. Encourage them to do it now.") +
            (_stmt ? " Their spark: \"" + _stmt + "\"." : "") + " Score: " + (_avg||0).toFixed(1) + "/5. Be direct, not generic.";
          fetch(SUPABASE_URL + '/functions/v1/coach', {
            method:'POST',
            headers:{'Content-Type':'application/json','apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY},
            body:JSON.stringify({messages:[{role:'user',content:_prompt}],system:'Respond in 1-2 sentences only. No formatting.'})
          }).then(r=>r.json()).then(rd=>{
            const msg = rd.content?.[0]?.text || "";
            if (msg) setWelcomeMsg(msg);
            setWelcomeLoading(false);
          }).catch(()=>setWelcomeLoading(false));
        }
      } catch(e) { console.error(e); }
    })();
  }, [session?.user?.id]);

  const debouncedSave = useCallback(
    debounce(async (userId, payload) => {
      setSyncing(true);
      await saveUserData(userId, payload);
      setSyncing(false);
    }, 800),
    []
  );

  const update = useCallback((next) => {
    setData(next);
    toLS(next);
    if (session?.user?.id) debouncedSave(session.user.id, next);
  }, [session?.user?.id, debouncedSave]);

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    clearLS();
    localStorage.removeItem("bonfire_user_id");
    setData({});
    setSession(null);
    setPage("dashboard");
    setIntakeData(null);
  };

  const handleIntakeComplete = (payload) => {
    const enriched = { ...payload, email: session?.user?.email || "" };
    update(enriched);
    setIntakeData(enriched); // triggers results page with full data
  };

  // Allow returning to results page from pending screen
  const handleViewResults = () => {
    // Reconstruct intakeData from stored data
    const avg = (keys) => {
      const vals = keys.map(k => (data.auditScores||{})[k]||0).filter(v=>v>0);
      return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
    };
    const spKeys = ["sp1","sp2","sp3","sp4","sp5","sp6"];
    const syKeys = ["sy1","sy2","sy3","sy4","sy5","sy6","sy7"];
    const aiKeys = ["ai1","ai2","ai3","ai4","ai5"];
    const overall = ((avg(spKeys)+avg(syKeys)+avg(aiKeys))/3).toFixed(2);
    setIntakeData({
      ...data,
      email: session?.user?.email || data.email || "",
      overallScore: overall,
    });
  };

  const handleEnterApp = () => {
    setIntakeData(null);
  };

  const handleEraseData = async () => {
    clearLS();
    const empty = {};
    setData(empty);
    if (session?.user?.id && supabase) await saveUserData(session.user.id, empty);
    setShowEraseConfirm(false);
    setIntakeData(null);
    setPage("dashboard");
  };

  // ── Render logic ──────────────────────────────────────

  // 0. Coach portal route
  if (typeof window !== "undefined" && (window.location.pathname === "/coach" || window.location.search.includes("coach=1"))) {
    return <CoachPortal />;
  }

  // 1. Auth loading
  if (authLoading) return <LoadingScreen />;

  // 2. Not signed in
  if (supabaseConfigured && !session) return <AuthPage onAuth={(s) => setSession(s)} />;

  // 3. Loading user data from Supabase
  if (dataLoading) return <LoadingScreen />;

  // 4. Showing results page right after intake
  if (intakeData) {
    return <IntakeResultsPage intakeData={intakeData} onEnterApp={handleEnterApp} />;
  }

  // 5. New user — hasn't done intake yet
  if (!data.intakeComplete) {
    return <IntakePage onComplete={handleIntakeComplete} />;
  }

  // 6. Intake done — check approval
  const userEmail = session?.user?.email || "";
  const isAdmin = ADMIN_EMAILS.includes(userEmail);
  const isApproved = data.approved === true || isAdmin;

  if (!isApproved) {
    return <PendingScreen onSignOut={handleSignOut} onViewResults={handleViewResults} />;
  }

  // 7. Fully approved — show the app
  const renderPage = () => {
    switch (page) {
      case "dashboard":   return <Dashboard    data={data} update={update} setPage={setPage} />;
      case "spark":       return <SparkPage    data={data} update={update} />;
      case "air":       return <AirPage data={userData} setPage={setPage} />;
      case "systems":     return <SystemsPage  data={data} update={update} setPage={setPage} />;
      case "tend":       return <AuditPage    data={data} update={update} initialTab="overview" setPage={setPage} />;
      case "audit_air":   return <AuditPage    data={data} update={update} initialTab="air" />;
      case "coach":       return <CoachPage    data={data} />;
      case "notes":       return <NotesPage    data={data} update={update} />;
      case "history":     return <HistoryPage  data={data} update={update} />;
      case "personality": return <PersonalityPage data={data} update={update} />;
     case "resources": return <ResourcesPage data={data} />;
     case "health":      return <HealthPage   data={data} update={update} />;
      default:            return <Dashboard    data={data} update={update} setPage={setPage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} user={session?.user || null}
        onSignOut={handleSignOut} syncing={syncing} localOnly={!supabaseConfigured}
        onEraseData={() => setShowEraseConfirm(true)} />
      <main className="main-content">{renderPage()}</main>

      {showWelcome && (
        <div className="modal-overlay" onClick={()=>setShowWelcome(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{maxWidth:420,textAlign:"center"}}>
            <div style={{fontSize:"2rem",marginBottom:8}}>🔥</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:"1.4rem",color:"var(--ember)",marginBottom:8}}>
              Welcome back{data?.spark?.target ? ", " + (session?.user?.email?.split("@")[0] || "") : ""}
            </div>
            <div style={{fontSize:"0.875rem",color:"var(--fog)",lineHeight:1.7,marginBottom:"1.5rem"}}>
              {welcomeMsg || "Ready to tend your fire today?"}
            </div>
            {welcomeLoading && <div style={{fontSize:"0.78rem",color:"var(--smoke)",marginBottom:8}}>Generating your message...</div>}
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button className="btn btn-primary" onClick={()=>{setShowWelcome(false);setPage("tend");}}>
                Tend the Fire
              </button>
              <button className="btn btn-ghost" onClick={()=>setShowWelcome(false)}>
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {showEraseConfirm && (
        <div className="modal-overlay" onClick={() => setShowEraseConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth:420 }}>
            <div className="modal-title" style={{ color:"var(--ember)" }}>Erase All Data</div>
            <div style={{ fontSize:"0.875rem", color:"var(--fog)", lineHeight:1.7, marginBottom:"1.5rem" }}>
              This permanently deletes all your data — audit history, notes, health records, spark statement, and settings. This cannot be undone.
              <br/><br/>
              <strong style={{ color:"var(--pale)" }}>Are you sure you want to start over from day one?</strong>
            </div>
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowEraseConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ background:"#B53E24" }} onClick={handleEraseData}>
                Yes, Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}