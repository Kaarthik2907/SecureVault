import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, PRESET_USERS } from "../context/AuthContext";
import {
  Shield,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  AlertTriangle,
  Server,
  CheckCircle2,
} from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { login, backendOnline, apiMode, setApiMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await login(username.trim(), password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Authentication failed. Please verify credentials or connection."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setUsername(preset.username);
    setPassword(preset.password);
  };

  return (
    <div className="sv-login-page">
      <div className="sv-login-glow" />

      <div className="sv-login-container">
        {/* Brand Banner */}
        <div className="sv-login-header">
          <div className="sv-login-logo">
            <Shield className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="sv-login-title">SecureVault</h1>
          <p className="sv-login-subtitle">
            Core Banking Vault Access & SHA-256 Cryptographic Audit Ledger
          </p>
        </div>

        {/* Login Card */}
        <div className="sv-card sv-login-card">
          <form onSubmit={handleSubmit} className="sv-form">
            {error && (
              <div className="sv-alert sv-alert-error">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="sv-alert-content">{error}</div>
              </div>
            )}

            <div className="sv-form-group">
              <label className="sv-label">Employee Username</label>
              <div className="sv-input-with-icon">
                <User className="sv-field-icon" />
                <input
                  type="text"
                  className="sv-input with-icon"
                  placeholder="e.g. johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="sv-form-group">
              <label className="sv-label">Security Password</label>
              <div className="sv-input-with-icon">
                <Lock className="sv-field-icon" />
                <input
                  type="password"
                  className="sv-input with-icon"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="sv-btn sv-btn-primary sv-btn-block sv-btn-lg"
            >
              {busy ? (
                <span>Authenticating JWT Bearer...</span>
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Personas Bar */}
          <div className="sv-login-presets">
            <span className="sv-presets-label">QUICK PERSONA LOGIN (ONE-CLICK FILL):</span>
            <div className="sv-presets-grid">
              {PRESET_USERS.slice(0, 3).map((p) => (
                <button
                  key={p.username}
                  type="button"
                  className="sv-preset-btn"
                  onClick={() => handleSelectPreset(p)}
                >
                  <div className="sv-preset-role">{p.role}</div>
                  <div className="sv-preset-name">{p.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Backend & Security Status Footer */}
        <div className="sv-login-footer">
          <div className="sv-login-status-pill">
            <span className={`sv-status-dot ${backendOnline ? "online" : "mock"}`} />
            <span>
              Backend:{" "}
              <b>{backendOnline ? "Spring Boot 8080 Live" : "Local Contract Sandbox"}</b>
            </span>
          </div>

          <div className="sv-login-mode-toggle">
            <span className="text-xs text-slate-400">Mode:</span>
            <select
              className="sv-mode-select-sm"
              value={apiMode}
              onChange={(e) => setApiMode(e.target.value)}
            >
              <option value="auto">Auto (Live/Fallback)</option>
              <option value="live">Strict Live</option>
              <option value="mock">Offline Mock</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}