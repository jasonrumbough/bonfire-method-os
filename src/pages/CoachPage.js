import { useState, useEffect, useRef } from "react";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../utils/supabase";

const SCORE_LABELS = {
  sp1:"Spark: Passion clarity",sp2:"Spark: Work alignment",sp3:"Spark: Pattern recognition",
  sp4:"Spark: Skill development",sp5:"Spark: Financial provision",sp6:"Spark: Personality alignment",
  sy1:"SYSTEMS: Structure",sy2:"SYSTEMS: Yield",sy3:"SYSTEMS: Support",
  sy4:"SYSTEMS: Time",sy5:"SYSTEMS: Energy",sy6:"SYSTEMS: Money",sy7:"SYSTEMS: Story",
  ai1:"AIR: Audit rhythm",ai2:"AIR: Intentional investment",ai3:"AIR: Reflection practice",
  ai4:"AIR: Drift prevention",ai5:"AIR: Sustainable growth",
  ash1:"ASHES: Apathy",ash2:"ASHES: Skepticism",ash3:"ASHES: Helplessness",
  ash4:"ASHES: Erosion of Health",ash5:"ASHES: Social Withdrawal",
};

function buildSystemPrompt(data) {
  const scores = data.auditScores || {};
  const health = data.healthData || {};
  const personality = data.personality || {};
  const profile = data.profile || {};
  const weather = data.weather || {};

  const readableScores = Object.entries(scores)
    .filter(([,v]) => v > 0)
    .map(([k,v]) => (SCORE_LABELS[k] || k) + ": " + v + "/5")
    .join("\n  ") || "No audit data yet";

  const weatherStr = weather.temp
    ? Math.round(weather.temp) + "°F, " + weather.condition + (weather.isGoodOutdoor ? " — good outdoor conditions today" : " — indoor conditions today")
    : "Unknown";

  return `You are a world-class executive performance coach deeply trained in the Bonfire Method framework by Jason Rumbough. Speak directly, clearly, and with strategic precision. No filler. No toxic positivity. Challenge assumptions, provide frameworks, help the user tend the fire.

THE BONFIRE METHOD:
1. SPARK — Six P's: Passion, Pain, Pattern, Practice, Provision, Personality. Statement: "I help [TARGET] achieve [OUTCOME] while avoiding [NEGATIVE] through [METHOD]."
2. S.Y.S.T.E.M.S. — Structure, Yield, Support, Time, Energy, Money, Story.
3. AIR — Audit, Invest, Reflect.
ASHES: Apathy, Skepticism, Helplessness, Erosion of Health, Social Withdrawal (higher = worse).

USER CONTEXT:
Spark Statement: ${data.sparkStatement || "Not yet defined"}
Profile: Age ${profile.age || "unknown"}, ${profile.gender || ""}
Weather today: ${weatherStr}

Audit Scores (1–5):
  ${readableScores}

Health: Sleep ${health.sleep || 0}hrs, Steps ${health.steps || 0}, Active Cal ${health.calories || 0}, HRV ${health.hrv || 0}ms, Energy ${health.energyLevel || 5}/10
Body: Weight ${health.weight || "?"}lbs, Body Fat ${health.bodyFat || "?"}%, Muscle Mass ${health.muscleMass || "?"}lbs
Personality: ${personality.type || "Not defined"}${personality.notes ? " — " + personality.notes : ""}

If weather is good for outdoor activity and Energy score or health energy is low, consider suggesting time outside as part of your coaching.
Reference only readable pillar names — never raw score key codes. Short paragraphs only.`;
}

async function callCoach(messages, system) {
  const url = SUPABASE_URL + "/functions/v1/coach";
  const res = await fetch(url, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "apikey":SUPABASE_ANON_KEY, "Authorization":"Bearer "+SUPABASE_ANON_KEY },
    body:JSON.stringify({ messages, system, max_tokens:1000 }),
  });
  const d = await res.json();
  if (!res.ok || d.error) throw new Error(d.error?.message || d.error || "HTTP "+res.status);
  return d.content?.[0]?.text || "No response.";
}

export default function CoachPage({ data }) {
  const [messages, setMessages] = useState([
    { role:"ai", text:"Welcome back. I'm your Bonfire Method coach. How can I help you tend your fire today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef();

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role:"user", text:userMsg }]);
    setLoading(true);
    try {
      const history = messages.slice(-8).map(m => ({ role:m.role==="ai"?"assistant":"user", content:m.text }));
      const reply = await callCoach([...history, { role:"user", content:userMsg }], buildSystemPrompt(data));
      setMessages(prev => [...prev, { role:"ai", text:reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role:"ai", text:"Error: "+(e instanceof Error?e.message:String(e)) }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Coach</div>
        <div className="page-desc">Your Bonfire Method coach — context-aware, always available.</div>
      </div>
      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Bonfire Coach</div><div className="card-sub">Powered by Claude · Bonfire Method trained</div></div>
        </div>
        <div className="chat-area" ref={chatRef}>
          {messages.map((m,i)=>(
            <div key={i} className={"chat-bubble "+(m.role==="user"?"chat-user":"chat-ai")} style={{whiteSpace:"pre-wrap"}}>{m.text}</div>
          ))}
          {loading&&(
            <div className="chat-bubble chat-ai" style={{display:"flex",gap:8,alignItems:"center"}}>
              <span className="spinner"/> Thinking...
            </div>
          )}
        </div>
        <div className="chat-input-row">
          <input value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask your coach anything..." />
          <button className="btn btn-primary" onClick={send} disabled={loading||!input.trim()}>Send</button>
        </div>
      </div>
    </div>
  );
}