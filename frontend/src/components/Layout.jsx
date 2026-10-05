import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth, PRESET_USERS } from "../context/AuthContext";
import { requestApi } from "../api/services";
import {
  Shield,
  Lock,
  Building2,
  Users,
  LayoutDashboard,
  KeyRound,
  FileText,
  Activity,
  LogOut,
  Clock,
  RefreshCw,
  Server,
  UserCheck,
} from "lucide-react";

export default function Layout({ children }) {
  const { user, logout, quickSwitchUser, backendOnline, apiMode, setApiMode } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const navigate = useNavigate();
  const location = useLocation();

  // Load pending request badge count
  const refreshBadge = async () => {
    try {
      const { data } = await requestApi.pending();
      if (Array.isArray(data)) {
        setPendingCount(data.length);
      }
    } catch {
      // Ignore background badge errors
    }
  };

  useEffect(() => {
    refreshBadge();
    const interval = setInterval(() => {
      refreshBadge();
      setCurrentTime(new Date().toLocaleTimeString());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    {
      to: "/requests",
      label: "Access Workflow",
      icon: KeyRound,
      badge: pendingCount > 0 ? pendingCount : null,
      highlight: true,
    },
    { to: "/vaults", label: "Vaults", icon: Lock },
    { to: "/branches", label: "Branches", icon: Building2 },
    { to: "/employees", label: "Employees", icon: Users },
    { to: "/monitoring", label: "Monitoring", icon: Activity },
    { to: "/audit", label: "Chain Verification", icon: FileText },
  ];

  return (
    <div className="sv-app-container">
      {/* Sidebar Navigation */}
      <aside className="sv-sidebar">
        <div className="sv-brand">
          <div className="sv-brand-icon">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="sv-brand-text">
            <span className="sv-brand-title">SecureVault</span>
            <span className="sv-brand-sub">Core Banking Security</span>
          </div>
        </div>

        {/* Current Active Persona */}
        <div className="sv-user-profile-card">
          <div className="sv-user-avatar">
            {user?.role === "BRANCH_MANAGER" ? "BM" : user?.role === "AUDITOR" ? "AU" : "OF"}
          </div>
          <div className="sv-user-info">
            <div className="sv-user-name">{user?.fullName || user?.username || "Authenticated Officer"}</div>
            <div className="sv-user-meta">
              <span className={`sv-role-badge sv-role-${user?.role?.toLowerCase()}`}>
                {user?.role || "OFFICER"}
              </span>
              <span className="sv-branch-tag">Branch #{user?.branchId || 1}</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sv-nav">
          <div className="sv-nav-section-title">MAIN NAVIGATION</div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sv-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className="sv-nav-icon" />
                <span className="sv-nav-label">{item.label}</span>
                {item.badge && <span className="sv-nav-badge">{item.badge}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Persona Quick Switcher for Easy Role Testing */}
        <div className="sv-persona-switcher">
          <div className="sv-persona-header">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>TEST ROLES</span>
          </div>
          <div className="sv-persona-buttons">
            <button
              title="Switch to John Doe (Officer)"
              className={`sv-persona-btn ${user?.username === "johndoe" ? "active" : ""}`}
              onClick={() => quickSwitchUser("johndoe")}
            >
              Officer (John)
            </button>
            <button
              title="Switch to Sarah Smith (Branch Manager)"
              className={`sv-persona-btn ${user?.username === "sarahsmith" ? "active" : ""}`}
              onClick={() => quickSwitchUser("sarahsmith")}
            >
              Manager (Sarah)
            </button>
            <button
              title="Switch to David Kumar (Auditor)"
              className={`sv-persona-btn ${user?.username === "davidkumar" ? "active" : ""}`}
              onClick={() => quickSwitchUser("davidkumar")}
            >
              Auditor (David)
            </button>
          </div>
        </div>

        {/* Backend & Connectivity Status Footer */}
        <div className="sv-sidebar-footer">
          <div className="sv-backend-status-pill">
            <span className={`sv-status-dot ${backendOnline ? "online" : "mock"}`} />
            <div className="sv-status-details">
              <span className="sv-status-label">
                {backendOnline ? "Spring Boot 8080" : "Mock Sandbox"}
              </span>
              <span className="sv-status-sub">
                {backendOnline ? "Connected Live" : "Contract v1.0.0"}
              </span>
            </div>
            <select
              className="sv-mode-select"
              value={apiMode}
              onChange={(e) => setApiMode(e.target.value)}
              title="Toggle Live / Mock API Connection Mode"
            >
              <option value="auto">Auto</option>
              <option value="live">Live</option>
              <option value="mock">Mock</option>
            </select>
          </div>

          <button className="sv-logout-btn" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main App Content Viewport */}
      <div className="sv-main-wrapper">
        <header className="sv-topbar">
          <div className="sv-topbar-breadcrumb">
            <span className="sv-breadcrumb-root">SecureVault Core</span>
            <span className="sv-breadcrumb-separator">/</span>
            <span className="sv-breadcrumb-current">
              {navLinks.find((l) => l.to === location.pathname)?.label || "Overview"}
            </span>
          </div>

          <div className="sv-topbar-actions">
            <div className="sv-time-display">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{currentTime}</span>
            </div>

            <button
              className="sv-refresh-pill"
              onClick={refreshBadge}
              title="Refresh Queue and Backend Connectivity"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sync</span>
            </button>

            <div className="sv-security-level-pill">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>SHA-256 Chain Locked</span>
            </div>
          </div>
        </header>

        <main className="sv-content-container">{children}</main>
      </div>
    </div>
  );
}