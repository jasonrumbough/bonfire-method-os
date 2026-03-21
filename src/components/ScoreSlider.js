export default function ScoreSlider({ label, value, onChange, color = "#E8593C" }) {
  return (
    <div className="score-row">
      {label && <span className="score-label">{label}</span>}
      <input type="range" className="score-slider" min="0" max="10" step="1"
        value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ accentColor: color, flex: label ? undefined : 1 }} />
      <span className="score-val" style={{ color }}>{value}</span>
    </div>
  );
}