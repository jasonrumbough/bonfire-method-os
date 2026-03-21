import React from "react";
import { useState } from "react";
import { SYSTEMS, AUDIT_QUESTIONS } from "../utils/data";
import { RadarChart, LineChart } from "../components/Charts";
import HealthRing from "../components/HealthRing";

const todayKey = () => new Date().toISOString().split("T")[0];
const SYS_AUDIT_MAP = { structure:"sy1", yield:"sy2", support:"sy3", time:"sy4", energy:"sy5", money:"sy6", story:"sy7" };



export default function Dashboard({ data, update, setPage }) {
  const [fetchingWeather, setFetchingWeather] = useState(false);

  const fetchWeather = () => {
    setFetchingWeather(true);
    if (!navigator.geolocation) { setFetchingWeather(false); return; }
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
        const condMap = { 0:"Clear skies",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",45:"Foggy",51:"Light drizzle",61:"Light rain",63:"Moderate rain",80:"Rain showers",95:"Thunderstorm" };
        const condition = condMap[code] || condMap[Math.floor(code/10)*10] || "Cloudy";
        const isGoodOutdoor = temp > 50 && temp < 90 && code <= 3;
        let city = "";
        try {
          const geo = await fetch("https://nominatim.openstreetmap.org/reverse?lat=" + latitude + "&lon=" + longitude + "&format=json");
          const gd = await geo.json();
          city = gd.address?.city || gd.address?.town || gd.address?.village || "";
        } catch {}
        update({ ...data, weather: { temp, condition, isGoodOutdoor, city, updatedAt: new Date().toISOString() } });
      } catch {}
      setFetchingWeather(false);
    }, () => setFetchingWeather(false));
  };

  const scores = data.auditScores || data.scores || {};
  const sparkScore = AUDIT_QUESTIONS.spark.reduce((a, q) => a + (scores[q.id] || 0), 0) / AUDIT_QUESTIONS.spark.length || 0;
  const sysScore   = AUDIT_QUESTIONS.systems.reduce((a, q) => a + (scores[q.id] || 0), 0) / AUDIT_QUESTIONS.systems.length || 0;
  const airScore   = AUDIT_QUESTIONS.air.reduce((a, q) => a + (scores[q.id] || 0), 0) / AUDIT_QUESTIONS.air.length || 0;
  const overall    = (sparkScore + sysScore + airScore) / 3;
  const radarScores = SYSTEMS.map(s => scores[SYS_AUDIT_MAP[s.key]] || 0);
  const hasAuditData = radarScores.some(v => v > 0);

  const health = data.healthData || {};
  const today = todayKey();
  const todayFire = (data.dailyFire || {})[today] || { entries: [] };
  const fireCount = (todayFire.entries || []).length;
  const weather = data.weather || {};

  const historyEntries = (data.history || []).slice(-8);
  const histScores = historyEntries.map(h => h.overall || 0);
  const histLabels = historyEntries.map(h =>
    h.date ? new Date(h.date).toLocaleDateString("en-US", { month:"short", day:"numeric" }) : ""
  );

  const metrics = [
    { label:"Overall Health", val:overall.toFixed(1),    color:"#E8593C" },
    { label:"Spark Score",    val:sparkScore.toFixed(1), color:"#C9922F" },
    { label:"SYSTEMS Score",  val:sysScore.toFixed(1),   color:"#2A9D8F" },
    { label:"AIR Score",      val:(airScore*2).toFixed(1), color:"#3478C0", max:10 },
  ];

  const weatherIcon = (cond) => {
    if (!cond) return "";
    const c = cond.toLowerCase();
    if (c.includes("sun") || c.includes("clear")) return "☀️";
    if (c.includes("cloud")) return "⛅";
    if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
    if (c.includes("storm") || c.includes("thunder")) return "⛈️";
    if (c.includes("snow")) return "❄️";
    if (c.includes("fog") || c.includes("mist")) return "🌫️";
    if (c.includes("wind")) return "💨";
    return "🌤️";
  };

  return (
    <div>
      {/* Spark Statement */}
      {data.sparkStatement ? (
        <div className="card ember-glow" style={{ marginBottom:"1.5rem" }}>
          <div style={{ fontSize:"0.68rem", color:"var(--ember)", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>My Spark Statement</div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:"1.05rem", color:"var(--cream)", lineHeight:1.6, fontStyle:"italic" }}>
            "{data.sparkStatement}"
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom:"1.5rem", cursor:"pointer", borderStyle:"dashed" }} onClick={() => setPage("spark")}>
          <div style={{ textAlign:"center", color:"var(--smoke)", fontSize:"0.875rem" }}>
            No Spark Statement yet — <span style={{ color:"var(--ember-light)" }}>define yours →</span>
          </div>
        </div>
      )}

      <div className="page-header" style={{ marginBottom:"1rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div className="page-title">Dashboard</div>
            <div className="page-desc">{new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })}</div>
          </div>
          {/* Weather widget */}
          {weather.temp && (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"1.4rem" }}>{weatherIcon(weather.condition)}</div>
              <div style={{ fontSize:"0.85rem", color:"var(--cream)", fontWeight:500 }}>{Math.round(weather.temp)}°F</div>
              <div style={{ fontSize:"0.7rem", color:"var(--smoke)" }}>{weather.condition}</div>
              {weather.city && <div style={{ fontSize:"0.65rem", color:"var(--smoke)" }}>{weather.city}</div>}
            </div>
          )}
        </div>
      </div>

      <div className="metric-row">
        {metrics.map(m => (
          <div key={m.label} className="metric-card">
            <div className="metric-value" style={{ color:m.color }}>{m.val}</div>
            <div className="metric-label">{m.label}</div>
            <div className="progress-bar" style={{ marginTop:8 }}>
              <div className="progress-fill" style={{ width:Math.min((parseFloat(m.val) / (m.max||5) * 100),100) + "%", background:m.color }} />
            </div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">SYSTEMS Radar</div><div className="card-sub">From your Audit → SYSTEMS scores</div></div>
          </div>
          <div style={{ height:220 }}>
            {hasAuditData
              ? <RadarChart scores={radarScores} labels={SYSTEMS.map(s => s.label)} />
              : <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:12 }}>
                  <div style={{ color:"var(--smoke)", fontSize:"0.85rem", textAlign:"center" }}>Complete the SYSTEMS audit to populate this radar.</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPage("audit")}>Go to Audit →</button>
                </div>
            }
          </div>
          {hasAuditData && (
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
              {SYSTEMS.map((s, i) => (
                <div key={s.key} style={{ display:"flex", alignItems:"center", gap:4, fontSize:"0.7rem", color:"var(--smoke)" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:s.color }} />
                  {s.label}: <span style={{ color:"var(--pale)", marginLeft:2 }}>{radarScores[i]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-header"><div><div className="card-title">Score Trend</div><div className="card-sub">Historical fire health</div></div></div>
          <div style={{ height:220 }}>
            {histScores.length >= 2
              ? <LineChart data={histScores} labels={histLabels} />
              : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", color:"var(--smoke)", fontSize:"0.85rem", textAlign:"center", padding:"0 1rem" }}>
                  Complete 2+ audits to see your trend
                </div>
            }
          </div>
        </div>
      </div>

      {/* Morning Fire Check — simplified, just the CTA */}
      <div className="two-col">
        <div className="card" style={{ display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
          <div>
            <div className="card-title" style={{ marginBottom:4 }}>Morning Fire Check</div>
            <div style={{ fontSize:"0.82rem", color:"var(--smoke)", lineHeight:1.6, marginBottom:"1.25rem" }}>
              {today}
              {fireCount > 0
                ? <><br /><span style={{ color:"#5DCAA5" }}>{fireCount} {fireCount === 1 ? "entry" : "entries"} logged today</span></>
                : <><br />No entries yet today.</>
              }
              {weather.temp && (
                <><br />
                  <span style={{ color: weather.isGoodOutdoor ? "#5DCAA5" : "var(--smoke)" }}>
                    {weatherIcon(weather.condition)} {Math.round(weather.temp)}°F — {weather.condition}
                    {weather.isGoodOutdoor ? " · Good day to get outside" : ""}
                  </span>
                </>
              )}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setPage("audit")} style={{ width:"100%", justifyContent:"center", padding:"0.75rem" }}>
            Tend the Fire →
          </button>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom:"1rem" }}>Health Snapshot</div>
          <div className="health-grid">
            <HealthRing value={health.steps ? Math.round(health.steps / 1000) : 0} max={15} label="Steps (k)" color="#E8593C" />
            <HealthRing value={health.sleep || 0} max={9} label="Sleep hrs" color="#3478C0" unit="h" />
            <HealthRing value={health.calories || 0} max={600} label="Active Cal" color="#C9922F" />
            <HealthRing value={health.hrv || 0} max={100} label="HRV ms" color="#2A9D8F" />
          </div>
          <div style={{ marginTop:12, fontSize:"0.75rem", color:"var(--smoke)", textAlign:"center" }}>
            <span style={{ color:"var(--ember-light)", cursor:"pointer" }} onClick={() => setPage("health")}>Update Health Data →</span>
          </div>
        </div>
      </div>

    </div>
  );
}