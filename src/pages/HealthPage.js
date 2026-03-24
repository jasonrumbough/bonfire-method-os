import React from "react";
import { SUPABASE_ANON_KEY } from "../utils/supabase";
import { useState } from "react";
import ScoreSlider from "../components/ScoreSlider";
import HealthRing from "../components/HealthRing";
import { LineChart } from "../components/Charts";

const todayKey = () => new Date().toISOString().split("T")[0];
const GENDERS = ["Prefer not to say", "Male", "Female", "Non-binary", "Other"];
const ENERGY_SOURCES = [
  { key:"physicalEnergy",  label:"Physical Energy",  desc:"Sleep, nutrition, movement" },
  { key:"mentalEnergy",    label:"Mental Energy",    desc:"Focus, clarity, cognitive capacity" },
  { key:"emotionalEnergy", label:"Emotional Energy", desc:"Resilience, relational health" },
  { key:"spiritualEnergy", label:"Spiritual Energy", desc:"Purpose alignment, meaning" },
  { key:"recoveryEnergy",  label:"Recovery",         desc:"Rest, reflection, renewal" },
];

export default function HealthPage({ data, update }) {
  const today = todayKey();
  const allHealth = data.allHealthData || {};
  const health = allHealth[today] || data.healthData || {};
  const profile = data.profile || {};
  const [saved, setSaved] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [weatherMsg, setWeatherMsg] = useState("");

  const save = (key, val) => {
    const todayData = { ...health, [key]: val };
    update({ ...data, healthData: todayData, allHealthData: { ...allHealth, [today]: todayData } });
  };

  const saveProfile = (key, val) => update({ ...data, profile: { ...profile, [key]: val } });

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const fetchWeather = () => {
    setFetchingWeather(true);
    setWeatherMsg("");
    if (!navigator.geolocation) { setWeatherMsg("Geolocation not supported."); setFetchingWeather(false); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude +
          "&current=temperature_2m,weathercode&temperature_unit=fahrenheit&timezone=auto"
        );
        const d = await res.json();
        const temp = d.current?.temperature_2m;
        const code = d.current?.weathercode;
        // WMO weather codes → condition text
        const condMap = { 0:"Clear skies", 1:"Mostly clear", 2:"Partly cloudy", 3:"Overcast", 45:"Foggy", 48:"Icy fog",
          51:"Light drizzle", 61:"Light rain", 63:"Moderate rain", 65:"Heavy rain",
          71:"Light snow", 80:"Rain showers", 95:"Thunderstorm" };
        const condition = condMap[code] || condMap[Math.floor(code/10)*10] || "Cloudy";
        const isGoodOutdoor = temp > 50 && temp < 90 && code <= 3;
        // Get city from reverse geocode
        let city = "";
        try {
          const geo = await fetch("https://nominatim.openstreetmap.org/reverse?lat=" + latitude + "&lon=" + longitude + "&format=json");
          const gd = await geo.json();
          city = gd.address?.city || gd.address?.town || gd.address?.village || "";
        } catch {}
        const weather = { temp, condition, isGoodOutdoor, city, updatedAt: new Date().toISOString() };
        update({ ...data, weather });
        setWeatherMsg("Updated · " + Math.round(temp) + "°F · " + condition);
      } catch { setWeatherMsg("Could not fetch weather."); }
      setFetchingWeather(false);
    }, () => { setWeatherMsg("Location access denied."); setFetchingWeather(false); });
  };

  const makeChartData = (key) => {
    const days = Object.keys(allHealth).sort().slice(-14);
    return {
      labels: days.map(d => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric" })),
      values: days.map(d => allHealth[d]?.[key] || 0),
    };
  };

  const chartMetrics = [
    { key:"weight", label:"Weight (lbs)", color:"#E8593C" },
    { key:"bodyFat", label:"Body Fat %", color:"#C9922F" },
    { key:"muscleMass", label:"Muscle Mass (lbs)", color:"#2A9D8F" },
    { key:"sleep", label:"Sleep (hrs)", color:"#3478C0" },
    { key:"hrv", label:"HRV (ms)", color:"#5DCAA5" },
    { key:"steps", label:"Steps", color:"#A052D8" },
  ].filter(m => { const cd = makeChartData(m.key); return cd.values.some(v => v > 0); });

  const daysCount = Object.keys(allHealth).length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Health Data</div>
        <div className="page-desc">Track your energy inputs — the fuel behind the fire.</div>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="card-title" style={{ marginBottom:12 }}>Profile</div>
        <div className="two-col">
          <div className="form-group">
            <label>Age</label>
            <input type="number" value={profile.age || ""} onChange={e => saveProfile("age", e.target.value)} placeholder="42" />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select value={profile.gender || ""} onChange={e => saveProfile("gender", e.target.value)}>
              <option value="">Select...</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>


            {/* Today's metrics */}
      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div className="card-title">Today — {today}</div>
          <div style={{ fontSize:"0.7rem", color:"var(--smoke)" }}>{daysCount} days tracked</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:"1.5rem" }}>
          <HealthRing value={health.steps ? Math.round(health.steps / 1000) : 0} max={15} label="Steps (k)" color="#E8593C" />
          <HealthRing value={health.sleep || 0} max={9} label="Sleep hrs" color="#3478C0" unit="h" />
          <HealthRing value={health.calories || 0} max={600} label="Active Cal" color="#C9922F" />
          <HealthRing value={health.hrv || 0} max={100} label="HRV ms" color="#2A9D8F" />
        </div>

        <div className="two-col">
          <div className="form-group"><label>Steps</label><input type="number" value={health.steps || ""} onChange={e => save("steps", Number(e.target.value))} placeholder="8500" /></div>
          <div className="form-group"><label>Sleep (hours)</label><input type="number" step="0.5" value={health.sleep || ""} onChange={e => save("sleep", Number(e.target.value))} placeholder="7.5" /></div>
          <div className="form-group"><label>Active Calories</label><input type="number" value={health.calories || ""} onChange={e => save("calories", Number(e.target.value))} placeholder="450" /></div>
          <div className="form-group"><label>HRV (ms)</label><input type="number" value={health.hrv || ""} onChange={e => save("hrv", Number(e.target.value))} placeholder="55" /></div>
          <div className="form-group"><label>Resting Heart Rate (bpm)</label><input type="number" value={health.rhr || ""} onChange={e => save("rhr", Number(e.target.value))} placeholder="58" /></div>
        </div>

        <hr className="divider" />
        <div style={{ fontSize:"0.72rem", color:"var(--ember)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Body Composition</div>
        <div className="two-col">
          <div className="form-group"><label>Weight (lbs)</label><input type="number" step="0.5" value={health.weight || ""} onChange={e => save("weight", Number(e.target.value))} placeholder="185" /></div>
          <div className="form-group"><label>Body Fat %</label><input type="number" step="0.1" value={health.bodyFat || ""} onChange={e => save("bodyFat", Number(e.target.value))} placeholder="18.5" /></div>
          <div className="form-group"><label>Muscle Mass (lbs)</label><input type="number" step="0.5" value={health.muscleMass || ""} onChange={e => save("muscleMass", Number(e.target.value))} placeholder="165" /></div>
        </div>

        <div className="form-group">
          <label>Energy level today (0–10)</label>
          <ScoreSlider value={health.energyLevel || 5} onChange={v => save("energyLevel", v)} />
        </div>
        <div className="form-group">
          <label>Workout / movement notes</label>
          <textarea rows={2} value={health.workoutNotes || ""} onChange={e => save("workoutNotes", e.target.value)} placeholder="5AM lift — upper body, 45 min..." />
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, alignItems:"center" }}>
          {saved && <span className="save-confirm">✓ Saved</span>}
          <button className="btn btn-primary" onClick={handleSave}>Save Health Data</button>
        </div>
      </div>

      {/* Progress charts */}
      {chartMetrics.length > 0 && (
        <div className="card">
          <div className="card-title" style={{ marginBottom:16 }}>Progress Trends</div>
          <div className="two-col">
            {chartMetrics.map(m => {
              const cd = makeChartData(m.key);
              return (
                <div key={m.key}>
                  <div style={{ fontSize:"0.72rem", color:"var(--smoke)", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>{m.label}</div>
                  <div style={{ height:120 }}>
                    <LineChart data={cd.values} labels={cd.labels} label={m.label} color={m.color} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tend Summary settings */}
      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <div className="card-title">Daily Tend Summary</div>
            <div className="card-sub" style={{ marginTop:2 }}>End-of-day coaching email with reflections and prompts</div>
          </div>
          <div style={{ fontSize:"0.72rem", color: (data.tendSummary?.enabled) ? "#5DCAA5" : "var(--smoke)" }}>
            {(data.tendSummary?.enabled) ? "● Active" : "○ Off"}
          </div>
        </div>
        <div className="two-col">
          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              value={(data.tendSummary || {}).email || profile.email || ""}
              onChange={e => update({ ...data, tendSummary: { ...(data.tendSummary||{}), email: e.target.value } })}
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>Send time (your local time)</label>
            <select
              value={(data.tendSummary || {}).hour || "20"}
              onChange={e => update({ ...data, tendSummary: { ...(data.tendSummary||{}), hour: e.target.value } })}>
              {["17","18","19","20","21","22"].map(h => (
                <option key={h} value={h}>
                  {h === "17" ? "5:00 PM" : h === "18" ? "6:00 PM" : h === "19" ? "7:00 PM" : h === "20" ? "8:00 PM" : h === "21" ? "9:00 PM" : "10:00 PM"}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <button className="btn btn-primary" onClick={async () => {
            const ts = { ...(data.tendSummary||{}), enabled: true };
            update({ ...data, tendSummary: ts });
            // Send test email immediately
            const today = new Date().toISOString().split("T")[0];
            const allAudits = data.allAudits || {};
            const todayEntries = Object.entries(allAudits)
              .filter(([k]) => k.startsWith(today))
              .map(([k,v]) => v);
            const checkins = todayEntries.map(e =>
              `<strong>${e.timeframe||"Check-in"}</strong> — Overall: ${e.overall||"—"} | Spark: ${e.spark||"—"} | Systems: ${e.systems||"—"} | AIR: ${e.air||"—"}`
            ).join("<br>") || "No check-ins recorded today yet.";
            const priorityList = [...new Set(todayEntries.flatMap(e => e.priorities||[]).filter(Boolean))];
            const priorities = priorityList.length ? priorityList.map((p,i) => `${i+1}. ${p}`).join("<br>") : "None set";
            const winsList = todayEntries.map(e=>e.wins).filter(Boolean);
            const wins = winsList.length ? winsList.join("<br>") : "None recorded yet — add wins in your next check-in";
            const latestEntry = todayEntries[todayEntries.length - 1] || {};
            const sc = data.auditScores || {};
            const syAvg = (keys) => {
              const vals = keys.map(k => sc[k]).filter(Boolean);
              return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length/2).toFixed(1) : "—";
            };
            const systems = [
              `Structure: ${syAvg(["sy1","sy2"])}/5`,
              `Yield: ${syAvg(["sy3","sy4"])}/5`,
              `Support: ${syAvg(["sy5","sy6"])}/5`,
              `Time: ${syAvg(["sy7","sy8"])}/5`,
              `Energy: ${syAvg(["sy9","sy10"])}/5`,
              `Money: ${syAvg(["sy11","sy12"])}/5`,
              `Story: ${syAvg(["sy13","sy14"])}/5`,
            ].join("<br>");
            try {
              const res = await fetch("https://rqbsyadjyvzbbirsdfan.supabase.co/functions/v1/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
                body: JSON.stringify({ type: "daily_summary", email: ts.email || data.profile?.email, spark_statement: data.sparkStatement||"", checkins, priorities, wins, systems })
              });
              const result = await res.json();
              if (result.ok) alert("Daily summary enabled! Test email sent to " + (ts.email || "your email"));
              else alert("Enabled but email failed: " + JSON.stringify(result));
            } catch(e) { alert("Enabled! Email error: " + e.message); }
          }}>
            Enable Daily Summary
          </button>
          {(data.tendSummary?.enabled) && (<>
            <button className="btn btn-ghost btn-sm" onClick={async () => {
              const today = new Date().toISOString().split("T")[0];
              const allAudits = data.allAudits || {};
              const todayEntries = Object.entries(allAudits).filter(([k]) => k.startsWith(today)).map(([k,v]) => v);
              const checkins2 = todayEntries.map(e =>
                `<strong>${e.timeframe||"Check-in"}</strong> — Overall: ${e.overall||"—"} | Spark: ${e.spark||"—"} | Systems: ${e.systems||"—"}`
              ).join("<br>") || "No check-ins recorded today yet.";
              const pList = [...new Set(todayEntries.flatMap(e => e.priorities||[]).filter(Boolean))];
              const priorities2 = pList.length ? pList.map((p,i) => `${i+1}. ${p}`).join("<br>") : "None set";
              const wList = todayEntries.map(e=>e.wins).filter(Boolean);
              const wins2 = wList.length ? wList.join("<br>") : "None recorded yet";
              const sc2 = data.auditScores || {};
              const syAvg2 = (keys) => { const vals = keys.map(k=>sc2[k]).filter(Boolean); return vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length/2).toFixed(1):"—"; };
              const systems2 = [`Structure: ${syAvg2(["sy1","sy2"])}/5`,`Yield: ${syAvg2(["sy3","sy4"])}/5`,`Time: ${syAvg2(["sy7","sy8"])}/5`,`Energy: ${syAvg2(["sy9","sy10"])}/5`].join("<br>");
              await fetch("https://rqbsyadjyvzbbirsdfan.supabase.co/functions/v1/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_ANON_KEY}` },
                body: JSON.stringify({ type: "daily_summary", email: data.tendSummary?.email || data.profile?.email, spark_statement: data.sparkStatement||"", checkins: checkins2, priorities: priorities2, wins: wins2, systems: systems2 })
              });
              alert("Test email sent!");
            }}>Send Test</button>
            <button className="btn btn-ghost" onClick={() => update({ ...data, tendSummary: { ...(data.tendSummary||{}), enabled: false } })}>
              Disable
            </button>
          </>)}
        </div>
      </div>

      {/* Energy audit */}
      <div className="card">
        <div className="card-title" style={{ marginBottom:12 }}>Five Energy Sources</div>
        {ENERGY_SOURCES.map(es => (
          <div key={es.key}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
              <span style={{ fontSize:"0.875rem", color:"var(--cream)" }}>{es.label}</span>
              <span style={{ fontSize:"0.72rem", color:"var(--smoke)" }}>{es.desc}</span>
            </div>
            <ScoreSlider value={health[es.key] || 5} onChange={v => save(es.key, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}