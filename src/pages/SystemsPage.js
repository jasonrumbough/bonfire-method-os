import { SYSTEMS, AUDIT_QUESTIONS } from "../utils/data";

// Maps each SYSTEMS pillar to its corresponding Audit → SYSTEMS question ID
const SYS_AUDIT_MAP = {
  structure: "sy1",
  yield:     "sy2",
  support:   "sy3",
  time:      "sy4",
  energy:    "sy5",
  money:     "sy6",
  story:     "sy7",
};

// Full question text for each pillar from the audit
const SYS_QUESTION = Object.fromEntries(
  AUDIT_QUESTIONS.systems.map(q => [q.id, q])
);

const FIRE_COLORS = ["", "#6B5E52", "#8B7355", "#C9922F", "#E8923C", "#E8593C"];

function FireDisplay({ value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{
          fontSize: "1rem",
          filter: value >= n ? "none" : "grayscale(1) opacity(0.2)",
          color: value >= n ? FIRE_COLORS[n] : "var(--ash)",
        }}>🔥</span>
      ))}
      <span style={{ fontSize: "0.75rem", color: "var(--smoke)", marginLeft: 6 }}>
        {value}/5
      </span>
    </div>
  );
}

export default function SystemsPage({ data, setPage }) {
  const scores = data.auditScores || {};
  const systemNotes = data.systemNotes || {};

  const hasAuditData = AUDIT_QUESTIONS.systems.some(q => scores[q.id] > 0);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="page-title">S.Y.S.T.E.M.S.</div>
          <div className="page-desc">The seven operational pillars — scores pulled from your Audit results.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setPage("audit")}>
          Go to Audit →
        </button>
      </div>

      {!hasAuditData && (
        <div className="card" style={{ textAlign: "center", padding: "2rem", borderStyle: "dashed" }}>
          <div style={{ fontSize: "0.875rem", color: "var(--smoke)", marginBottom: 12 }}>
            No SYSTEMS audit data yet. Complete the SYSTEMS tab in the Audit section to populate scores here.
          </div>
          <button className="btn btn-primary" onClick={() => setPage("audit")}>
            Start Audit →
          </button>
        </div>
      )}

      {SYSTEMS.map(sys => {
        const auditKey = SYS_AUDIT_MAP[sys.key];
        const score = scores[auditKey] || 0;
        const question = SYS_QUESTION[auditKey];
        const note = systemNotes[sys.key] || "";

        // Score context label
        const context = ["", "Struggling", "Below Average", "Average", "Strong", "Exceptional"][score] || "";
        const contextColor = score >= 4 ? "#5DCAA5" : score >= 3 ? "#C9922F" : score > 0 ? "#E8593C" : "var(--smoke)";

        return (
          <div key={sys.key} className="card" style={{ borderLeft: "3px solid " + (score > 0 ? sys.color : "var(--ash)") }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--cream)", marginBottom: 2 }}>
                  {sys.label}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--smoke)" }}>{sys.desc}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                {score > 0
                  ? <FireDisplay value={score} />
                  : <span style={{ fontSize: "0.78rem", color: "var(--smoke)" }}>Not rated yet</span>
                }
                {score > 0 && (
                  <div style={{ fontSize: "0.7rem", color: contextColor, marginTop: 3 }}>{context}</div>
                )}
              </div>
            </div>

            {question && score > 0 && (
              <div style={{ fontSize: "0.78rem", color: "var(--smoke)", fontStyle: "italic", padding: "0.5rem 0.75rem", background: "var(--ash)", borderRadius: 6, marginBottom: note ? 10 : 0 }}>
                "{question.q}"
              </div>
            )}

            {note && (
              <div style={{ fontSize: "0.78rem", color: "var(--fog)", marginTop: 8, padding: "0.5rem 0.75rem", borderLeft: "2px solid " + sys.color, paddingLeft: 10 }}>
                {note}
              </div>
            )}
          </div>
        );
      })}

      {hasAuditData && (
        <div style={{ textAlign: "center", padding: "1rem 0", fontSize: "0.78rem", color: "var(--smoke)" }}>
          Scores reflect your last saved audit.{" "}
          <span style={{ color: "var(--ember-light)", cursor: "pointer" }} onClick={() => setPage("audit")}>
            Update in Audit →
          </span>
        </div>
      )}
    </div>
  );
}