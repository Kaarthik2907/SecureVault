import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, PRESET_USERS } from "../context/AuthContext";
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("");

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
          "Authentication failed. Please verify your credentials or server status."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setUsername(preset.username);
    setPassword(preset.password);
    setSelectedPreset(preset.username);
  };

  return (
    <div className="sv-login-page">
      <div className="sv-login-container">
        {/* Brand Lockup */}
        <div className="sv-login-header">
          <div className="sv-login-logo">
            <Shield className="w-7 h-7 text-blue-500" />
          </div>
          <h1 className="sv-login-title">SecureVault</h1>
          <p className="sv-login-subtitle">
            Enterprise Vault Access & Cryptographic Ledger Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="sv-card sv-login-card">
          <form onSubmit={handleSubmit} className="sv-form">
            {error && (
              <div className="sv-alert sv-alert-error">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <div className="sv-alert-content">{error}</div>
              </div>
            )}

            <div className="sv-form-group">
              <label className="sv-label">Username</label>
              <div className="sv-input-with-icon">
                <User className="sv-field-icon" />
                <input
                  type="text"
                  className="sv-input with-icon"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="sv-form-group">
              <label className="sv-label">Password</label>
              <div className="sv-input-with-icon">
                <Lock className="sv-field-icon" />
                <input
                  type="password"
                  className="sv-input with-icon"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Clean Persona Quick Selection */}
          <div className="sv-login-presets">
            <div className="sv-presets-header">
              <span className="sv-presets-label">QUICK PERSONA LOGIN (ONE-CLICK FILL)</span>
              {selectedPreset && (
                <span className="sv-presets-selected-tag">Active: @{selectedPreset}</span>
              )}
            </div>
            <div className="sv-presets-grid">
              {PRESET_USERS.slice(0, 3).map((p) => {
                const isSelected = selectedPreset === p.username;
                return (
                  <button
                    key={p.username}
                    type="button"
                    className={`sv-preset-btn ${isSelected ? "selected" : ""} sv-preset-${p.role.toLowerCase()}`}
                    onClick={() => handleSelectPreset(p)}
                  >
                    <span className={`sv-preset-role-chip ${p.role.toLowerCase()}`}>
                      {p.role === "BRANCH_MANAGER" ? "MANAGER" : p.role}
                    </span>
                    <span className="sv-preset-name">{p.name.split(" ")[0]}</span>
                    <span className="sv-preset-sub font-mono">@{p.username}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="sv-login-footer">
          <div className="sv-login-status-pill">
            <span className={`sv-status-dot ${backendOnline ? "online" : "mock"}`} />
            <span>
              Backend:{" "}
              <b>{backendOnline ? "Spring Boot 8080 Live" : "Sandbox Store"}</b>
            </span>
          </div>

          <div className="sv-login-mode-toggle">
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