import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { vaultApi, requestApi, auditApi, branchApi } from "../api/services";
import {
  Shield,
  Lock,
  Unlock,
  KeyRound,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Fingerprint,
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalVaults: 4,
    lockedVaults: 3,
    pendingRequests: 0,
    totalAuditLogs: 0,
    isChainValid: true,
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [vaultsRes, requestsRes, auditRes, logsRes] = await Promise.all([
          vaultApi.list(),
          requestApi.pending(),
          auditApi.verify(),
          auditApi.logs(),
        ]);

        const vaults = Array.isArray(vaultsRes.data) ? vaultsRes.data : [];
        const pending = Array.isArray(requestsRes.data) ? requestsRes.data : [];
        const logs = Array.isArray(logsRes.data) ? logsRes.data : [];

        setStats({
          totalVaults: vaults.length,
          lockedVaults: vaults.filter((v) => v.isLocked).length,
          pendingRequests: pending.length,
          totalAuditLogs: logs.length,
          isChainValid: auditRes.data?.isChainValid !== false,
        });

        setRecentLogs(logs.slice(-5).reverse());
      } catch (err) {
        console.warn("Failed to load full dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Line chart data
  const lineChartData = {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "Now"],
    datasets: [
      {
        label: "Cryptographic Access Events",
        data: [2, 1, 8, 14, 22, 16, 28],
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.15)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#06b6d4",
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
      y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#94a3b8" } },
    },
  };

  // Doughnut chart data
  const doughnutData = {
    labels: ["Bullion (Critical)", "Deposit (High)", "Reserve Currency"],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: ["#f43f5e", "#06b6d4", "#10b981"],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#cbd5e1", boxWidth: 12, padding: 15 },
      },
    },
    cutout: "72%",
  };

  return (
    <div className="sv-page-container">
      {/* Welcome Banner */}
      <div className="sv-dashboard-hero">
        <div className="sv-hero-content">
          <div className="sv-hero-badge">
            <Shield className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
            <span>SECUREVAULT SECURITY PROTOCOL 2.4 ACTIVE</span>
          </div>
          <h1 className="sv-hero-title">
            Welcome back, {user?.fullName || user?.username}!
          </h1>
          <p className="sv-hero-desc">
            You are operating under role <b>{user?.role}</b> with jurisdiction at{" "}
            <b>Branch #{user?.branchId || 1}</b>. All vault interactions are signed and hashed.
          </p>
        </div>

        <div className="sv-hero-action">
          <button
            className="sv-btn sv-btn-primary"
            onClick={() => navigate("/requests")}
          >
            <KeyRound className="w-4 h-4 mr-2" />
            <span>Vault Access Hub</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="sv-stat-cards">
        <div className="sv-stat-card">
          <div className="flex justify-between items-start">
            <span className="sv-stat-label">Pending Approval Queue</span>
            <KeyRound className="w-5 h-5 text-amber-400" />
          </div>
          <div className="sv-stat-val text-amber-400">{stats.pendingRequests}</div>
          <span className="sv-stat-desc">Awaiting manager authorization</span>
        </div>

        <div className="sv-stat-card">
          <div className="flex justify-between items-start">
            <span className="sv-stat-label">Armed & Locked Vaults</span>
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="sv-stat-val text-emerald-400">
            {stats.lockedVaults} / {stats.totalVaults}
          </div>
          <span className="sv-stat-desc">Zero unauthorized access</span>
        </div>

        <div className="sv-stat-card">
          <div className="flex justify-between items-start">
            <span className="sv-stat-label">Audit Log Blocks</span>
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="sv-stat-val text-cyan-400">{stats.totalAuditLogs}</div>
          <span className="sv-stat-desc">SHA-256 chained transactions</span>
        </div>

        <div className="sv-stat-card">
          <div className="flex justify-between items-start">
            <span className="sv-stat-label">Hash Chain Integrity</span>
            <Fingerprint className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="sv-stat-val text-emerald-400">
            {stats.isChainValid ? "VALID ✓" : "TAMPERED ⚠"}
          </div>
          <span className="sv-stat-desc">Continuous cryptographic proof</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="sv-charts-grid">
        <div className="sv-card">
          <div className="sv-card-header">
            <div>
              <h3 className="sv-card-title flex items-center">
                <TrendingUp className="w-4 h-4 text-cyan-400 mr-2" />
                Vault Access Ingress Trend
              </h3>
              <p className="sv-card-sub">Daily cryptographic unlock transactions</p>
            </div>
          </div>
          <div className="sv-chart-container" style={{ height: "240px" }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="sv-card">
          <div className="sv-card-header">
            <div>
              <h3 className="sv-card-title flex items-center">
                <Shield className="w-4 h-4 text-indigo-400 mr-2" />
                Asset Protection Distribution
              </h3>
              <p className="sv-card-sub">Risk tier allocation</p>
            </div>
          </div>
          <div className="sv-chart-container" style={{ height: "240px" }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="sv-quick-actions-row">
        <div
          className="sv-quick-action-card"
          onClick={() => navigate("/requests")}
        >
          <div className="sv-quick-action-icon cyan">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="sv-quick-action-text">
            <b>1. Request Vault Access</b>
            <span>Submit purpose, duration & target vault</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
        </div>

        <div
          className="sv-quick-action-card"
          onClick={() => navigate("/requests")}
        >
          <div className="sv-quick-action-icon amber">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="sv-quick-action-text">
            <b>2. Manager Approval Queue</b>
            <span>Review pending requests & issue codes</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
        </div>

        <div
          className="sv-quick-action-card"
          onClick={() => navigate("/requests")}
        >
          <div className="sv-quick-action-icon emerald">
            <Unlock className="w-6 h-6" />
          </div>
          <div className="sv-quick-action-text">
            <b>3. Unlock Vault Terminal</b>
            <span>Execute authorized access & hash write</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
        </div>

        <div
          className="sv-quick-action-card"
          onClick={() => navigate("/audit")}
        >
          <div className="sv-quick-action-icon indigo">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div className="sv-quick-action-text">
            <b>4. Verify Hash Chain</b>
            <span>Validate unbroken SHA-256 ledger</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
        </div>
      </div>

      {/* Recent Cryptographic Audit Logs */}
      <div className="sv-card mt-6">
        <div className="sv-card-header">
          <div>
            <h3 className="sv-card-title flex items-center">
              <FileCheck className="w-4 h-4 text-cyan-400 mr-2" />
              Latest Immutable Audit Events
            </h3>
            <p className="sv-card-sub">SHA-256 blocks written to tamper-evident ledger</p>
          </div>
          <button
            className="sv-btn sv-btn-secondary sv-btn-sm"
            onClick={() => navigate("/audit")}
          >
            Explore Complete Chain →
          </button>
        </div>

        <div className="sv-table-responsive">
          <table className="sv-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Event Type</th>
                <th>Employee</th>
                <th>Vault</th>
                <th>Current SHA-256 Hash</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id}>
                  <td className="font-mono text-cyan-400 font-semibold">{log.logId}</td>
                  <td>
                    <span className="sv-event-badge">{log.eventType}</span>
                  </td>
                  <td>EMP-{log.employeeId}</td>
                  <td>{log.vaultId ? `Vault #${log.vaultId}` : "—"}</td>
                  <td className="font-mono text-xs text-slate-400 truncate max-w-xs" title={log.currentHash}>
                    {log.currentHash.substring(0, 16)}...{log.currentHash.substring(48)}
                  </td>
                  <td className="text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
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