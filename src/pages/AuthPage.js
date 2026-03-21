import { useState } from "react";
import { supabase } from "../utils/supabase";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handle = async () => {
    setError(""); setMessage(""); setLoading(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.session);
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          onAuth(data.session);
        } else {
          setMessage("Check your email to confirm your account, then log in.");
          setMode("login");
        }
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage("Password reset email sent. Check your inbox.");
        setMode("login");
      }
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--coal)", padding: "1rem",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>🔥</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--ember)" }}>
            Bonfire Method
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--smoke)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
            Personal OS
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: "2rem" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--cream)", marginBottom: "1.5rem" }}>
            {mode === "login" && "Sign in to your fire"}
            {mode === "signup" && "Create your account"}
            {mode === "reset" && "Reset your password"}
          </div>

          {error && (
            <div style={{ background: "rgba(232,89,60,0.15)", border: "1px solid rgba(232,89,60,0.3)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem", color: "var(--ember-light)" }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background: "rgba(42,157,143,0.15)", border: "1px solid rgba(42,157,143,0.3)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.85rem", color: "#5DCAA5" }}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle()}
              placeholder="you@example.com" autoComplete="email" />
          </div>

          {mode !== "reset" && (
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handle()}
                placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"} />
            </div>
          )}

          <button className="btn btn-primary" onClick={handle} disabled={loading || !email || (mode !== "reset" && !password)}
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem", padding: "0.75rem" }}>
            {loading ? <span className="spinner" /> : (
              mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Email"
            )}
          </button>

          {/* Mode switchers */}
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
            {mode === "login" && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => { setMode("signup"); setError(""); }}
                  style={{ width: "100%", justifyContent: "center" }}>
                  Don't have an account? Sign up
                </button>
                <button onClick={() => { setMode("reset"); setError(""); }}
                  style={{ background: "none", border: "none", color: "var(--smoke)", fontSize: "0.78rem", cursor: "pointer", padding: "4px" }}>
                  Forgot password?
                </button>
              </>
            )}
            {mode === "signup" && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setMode("login"); setError(""); }}
                style={{ width: "100%", justifyContent: "center" }}>
                Already have an account? Sign in
              </button>
            )}
            {mode === "reset" && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setMode("login"); setError(""); }}
                style={{ width: "100%", justifyContent: "center" }}>
                Back to sign in
              </button>
            )}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.72rem", color: "var(--smoke)" }}>
          thebonfirecompany.com · © 2026 Jason Rumbough
        </div>
      </div>
    </div>
  );
}
