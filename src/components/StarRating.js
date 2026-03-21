// FireRating — replaces stars with fire icons
// For ASHES: inverted so 5 = severe symptom (bad), 1 = not present (good)
// For normal audit: 5 = exceptional (good), 1 = struggling (bad)

export default function FireRating({ value, onChange, inverted = false }) {
  const labels = inverted
    ? ['', 'Not present', 'Mild', 'Moderate', 'Significant', 'Severe']
    : ['', 'Struggling', 'Below Avg', 'Average', 'Strong', 'Exceptional'];

  // For inverted (ASHES), fire color intensity increases with score (more = worse = more fire)
  // For normal, fire color increases with score (more = better = more fire)
  const getColor = (n) => {
    if (value < n) return 'var(--ash)';
    if (inverted) {
      // Gradual red-orange as severity increases
      const colors = ['','#6B5E52','#C9922F','#E8812F','#E8593C','#B53E24'];
      return colors[n] || 'var(--ember)';
    }
    // Normal: gold/amber for good scores
    const colors = ['','#6B5E52','#8B7355','#C9922F','#E8923C','#E8593C'];
    return colors[n] || 'var(--ember)';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          onClick={() => onChange(value === n ? 0 : n)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.2rem', padding: '2px 4px',
            filter: value >= n ? 'none' : 'grayscale(1) opacity(0.3)',
            color: getColor(n),
            transform: value >= n ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.1s',
            lineHeight: 1,
          }}
          title={labels[n]}
        >
          🔥
        </button>
      ))}
      {value > 0 && (
        <span style={{ fontSize: '0.72rem', color: 'var(--smoke)', marginLeft: 4 }}>
          {labels[value]}
        </span>
      )}
    </div>
  );
}

// FireDots for IntakeResultsPage — explicit comparisons, no .map() loop
export function FireDots({ value }) {
  const v = Number(value) || 0;
  const on  = { fontSize:"0.85rem", color:"#E8593C" };
  const off = { fontSize:"0.85rem", color:"#3D3228", opacity:0.3 };
  return (
    <span style={{ display:"inline-flex", gap:1 }}>
      <span style={v >= 1 ? on : off}>🔥</span>
      <span style={v >= 2 ? on : off}>🔥</span>
      <span style={v >= 3 ? on : off}>🔥</span>
      <span style={v >= 4 ? on : off}>🔥</span>
      <span style={v >= 5 ? on : off}>🔥</span>
    </span>
  );
}
