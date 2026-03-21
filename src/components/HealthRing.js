export default function HealthRing({ value, max, label, color, unit = "" }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <div className="health-ring">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#3D3228" strokeWidth="4"/>
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "28px 28px", transition: "stroke-dashoffset 0.8s ease" }}/>
        <text x="28" y="28" textAnchor="middle" dominantBaseline="central"
          fill="#E8DDD5" fontSize="9" fontFamily="DM Sans, sans-serif">
          {value}{unit}
        </text>
      </svg>
      <div className="health-ring-label">{label}</div>
    </div>
  );
}