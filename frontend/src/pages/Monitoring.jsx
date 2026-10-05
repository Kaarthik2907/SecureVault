import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Moon,
  Clock,
  ShieldAlert,
  Users,
  CheckCircle2,
  Filter,
  Eye,
  RefreshCw,
} from "lucide-react";

export default function Monitoring() {
  const [incidents, setIncidents] = useState([
    {
      id: "SEC-2026-089",
      rule: "After-Hours Ingress Attempt",
      severity: "HIGH",
      vaultCode: "VLT-DEL-01",
      branch: "Delhi Central Treasury",
      employee: "EMP-0201 (Priya Sharma)",
      timestamp: "2026-08-26 22:45:12",
      status: "INVESTIGATING",
      details: "Access request submitted outside permitted banking hours (09:00 - 18:00 IST). Dual-approval mandatory.",
    },
    {
      id: "SEC-2026-088",
      rule: "Prolonged Vault Open Duration",
      severity: "MEDIUM",
      vaultCode: "VLT-MUM-A1",
      branch: "Mumbai Financial Hub",
      employee: "EMP-0101 (John Doe)",
      timestamp: "2026-08-26 18:15:00",
      status: "RESOLVED",
      details: "Vault physical closure exceeded estimated duration by 18 minutes during physical bullion count.",
    },
    {
      id: "SEC-2026-087",
      rule: "Dual-Control Self-Approval Violation",
      severity: "CRITICAL",
      vaultCode: "VLT-BLR-01",
      branch: "Bengaluru Tech & Custody",
      employee: "EMP-0301 (Alex Chen)",
      timestamp: "2026-08-25 11:20:00",
      status: "BLOCKED",
      details: "System intercepted unauthorized attempt by requesting officer to approve own access ticket.",
    },
  ]);

  const [severityFilter, setSeverityFilter] = useState("ALL");

  const resolveIncident = (id) => {
    setIncidents(
      incidents.map((inc) =>
        inc.id === id ? { ...inc, status: "RESOLVED" } : inc
      )
    );
  };

  const filtered = incidents.filter(
    (inc) => severityFilter === "ALL" || inc.severity === severityFilter
  );

  return (
    <div className="sv-page-container">
      {/* Header */}
      <div className="sv-page-header">
        <div>
          <h1 className="sv-page-title">Real-Time Security Monitoring & Anomaly Detection</h1>
          <p className="sv-page-subtitle">
            Heuristic threat monitoring engine evaluating access requests against bank compliance policies
          </p>
        </div>

        <div className="sv-header-actions">
          <div className="sv-threat-meter">
            <span className="sv-threat-label">SYSTEM THREAT LEVEL:</span>
            <span className="sv-threat-val low">NORMAL (LEVEL 1)</span>
          </div>
        </div>
      </div>

      {/* Heuristic Rule Cards */}
      <div className="sv-stat-cards mb-6">
        <div className="sv-stat-card border-rose-500/30">
          <div className="flex justify-between items-start">
            <span className="sv-stat-label">🌙 After-Hours Detection</span>
            <span className="sv-severity-pill high">HIGH</span>
          </div>
          <div className="sv-rule-desc mt-2">
            Flags any vault unlock requested outside standard core banking operational hours (09:00 to 18:00 IST).
          </div>
        </div>

        <div className="sv-stat-card border-amber-500/30">
          <div className="flex justify-between items-start">
            <span className="sv-stat-label">⏱ Prolonged Session Guard</span>
            <span className="sv-severity-pill medium">MEDIUM</span>
          </div>
          <div className="sv-rule-desc mt-2">
            Dispatches automated alerts if physical doors remain unlocked past approved duration threshold.
          </div>
        </div>

        <div className="sv-stat-card border-indigo-500/30">
          <div className="flex justify-between items-start">
            <span className="sv-stat-label">👥 Dual-Control Enforcement</span>
            <span className="sv-severity-pill critical">CRITICAL</span>
          </div>
          <div className="sv-rule-desc mt-2">
            Strictly blocks self-authorization. Officer and Approver must be distinct authenticated personas.
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sv-card mb-6">
        <div className="sv-filter-bar">
          <div className="flex items-center text-sm text-slate-300">
            <Filter className="w-4 h-4 mr-2 text-cyan-400" />
            <span>Filter Severity:</span>
          </div>
          <div className="sv-tab-pills">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
              <button
                key={sev}
                className={`sv-tab-btn ${severityFilter === sev ? "active" : ""}`}
                onClick={() => setSeverityFilter(sev)}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="sv-card">
        <div className="sv-card-header">
          <div>
            <h3 className="sv-card-title flex items-center">
              <ShieldAlert className="w-5 h-5 text-rose-400 mr-2" />
              Security Anomaly Incidents
            </h3>
            <p className="sv-card-sub">Active compliance flags awaiting security officer review</p>
          </div>
        </div>

        <div className="sv-table-responsive">
          <table className="sv-table">
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Rule Violated</th>
                <th>Severity</th>
                <th>Target Vault</th>
                <th>Employee</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => (
                <tr key={inc.id}>
                  <td className="font-mono text-cyan-400 font-semibold">{inc.id}</td>
                  <td>
                    <b>{inc.rule}</b>
                    <p className="text-xs text-slate-400 mt-0.5">{inc.details}</p>
                  </td>
                  <td>
                    <span className={`sv-severity-pill ${inc.severity.toLowerCase()}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="font-mono">{inc.vaultCode}</td>
                  <td className="text-xs">{inc.employee}</td>
                  <td className="font-mono text-xs text-slate-400">{inc.timestamp}</td>
                  <td>
                    <span className={`sv-status-pill ${inc.status}`}>{inc.status}</span>
                  </td>
                  <td>
                    {inc.status !== "RESOLVED" ? (
                      <button
                        className="sv-btn sv-btn-sm sv-btn-secondary"
                        onClick={() => resolveIncident(inc.id)}
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-xs font-semibold">✓ Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}