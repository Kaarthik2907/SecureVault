import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { auditApi, vaultApi, employeeApi } from "../api/services";
import {
  FileText,
  Search,
  RefreshCw,
  Filter,
  Calendar,
  Lock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Clock,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  KeyRound,
  Eye,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [vaults, setVaults] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedHash, setCopiedHash] = useState(null);

  // Filters
  const [selectedVault, setSelectedVault] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Inspection modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Load audit records and auxiliary data
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [logsRes, vaultsRes, empRes] = await Promise.all([
        auditApi.getLogs(),
        vaultApi.list(),
        employeeApi.list(),
      ]);

      const logData = Array.isArray(logsRes.data) ? logsRes.data : [];
      setLogs(logData);
      setVaults(Array.isArray(vaultsRes.data) ? vaultsRes.data : []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load audit logs from immutable ledger."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset to first page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedVault, selectedDate, selectedAction, searchQuery, pageSize]);

  // Filtered dataset
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Vault filter
      if (
        selectedVault !== "ALL" &&
        String(log.vaultId) !== String(selectedVault)
      ) {
        return false;
      }

      // Date filter (matches YYYY-MM-DD prefix of ISO timestamp)
      if (selectedDate) {
        const logDate = log.timestamp ? log.timestamp.split("T")[0] : "";
        if (logDate !== selectedDate) {
          return false;
        }
      }

      // Action / Event filter
      if (selectedAction !== "ALL") {
        const matchesAction =
          (log.action && log.action === selectedAction) ||
          (log.eventType && log.eventType === selectedAction);
        if (!matchesAction) return false;
      }

      // Search Query (matches logId, employee codes, details, vaultId)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inLogId = log.logId?.toLowerCase().includes(q);
        const inDetails = log.actionDetails?.toLowerCase().includes(q);
        const inRequester =
          String(log.requesterId || log.employeeId || "").includes(q);
        const inApprover = String(log.approverId || "").includes(q);
        const inVault = String(log.vaultId || "").includes(q);
        const inAction = log.action?.toLowerCase().includes(q);
        const inEvent = log.eventType?.toLowerCase().includes(q);

        if (
          !inLogId &&
          !inDetails &&
          !inRequester &&
          !inApprover &&
          !inVault &&
          !inAction &&
          !inEvent
        ) {
          return false;
        }
      }

      return true;
    });
  }, [logs, selectedVault, selectedDate, selectedAction, searchQuery]);

  // Pagination calculations
  const totalRecords = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  // Reset all filters
  const resetFilters = () => {
    setSelectedVault("ALL");
    setSelectedDate("");
    setSelectedAction("ALL");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedVault !== "ALL" ||
    selectedDate !== "" ||
    selectedAction !== "ALL" ||
    searchQuery.trim() !== "";

  // Helper to copy hash
  const copyToClipboard = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedHash(key);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Helper to resolve employee name
  const getEmployeeName = (empId) => {
    if (!empId) return null;
    const emp = employees.find((e) => Number(e.id) === Number(empId));
    return emp ? emp.fullName : null;
  };

  // Helper to resolve vault code
  const getVaultCode = (vId) => {
    if (!vId) return "System";
    const v = vaults.find((vault) => Number(vault.id) === Number(vId));
    return v ? v.vaultCode : `VLT-${vId}`;
  };

  // KPI Metrics
  const approvedCount = logs.filter(
    (l) => l.action === "ACCESS_APPROVED" || l.eventType === "VAULT_ACCESS_APPROVED"
  ).length;
  const rejectedCount = logs.filter(
    (l) => l.action === "ACCESS_REJECTED" || l.eventType === "VAULT_ACCESS_REJECTED"
  ).length;
  const unlockedCount = logs.filter(
    (l) => l.action === "VAULT_UNLOCKED" || l.eventType === "VAULT_UNLOCKED"
  ).length;

  // Badge styling for resulting action
  const renderActionBadge = (action, eventType) => {
    const act = action || eventType || "";
    if (act.includes("APPROVED")) {
      return (
        <span className="sv-status-pill APPROVED">
          <CheckCircle2 className="w-3 h-3 inline mr-1" />
          APPROVED
        </span>
      );
    }
    if (act.includes("REJECTED")) {
      return (
        <span className="sv-status-pill REJECTED">
          <XCircle className="w-3 h-3 inline mr-1" />
          REJECTED
        </span>
      );
    }
    if (act.includes("UNLOCKED")) {
      return (
        <span className="sv-status-pill ACCESSED">
          <KeyRound className="w-3 h-3 inline mr-1" />
          UNLOCKED
        </span>
      );
    }
    if (act.includes("LOCKED")) {
      return (
        <span className="sv-status-pill" style={{ background: "rgba(100, 116, 139, 0.2)", color: "#cbd5e1", border: "1px solid #475569" }}>
          <Lock className="w-3 h-3 inline mr-1" />
          LOCKED
        </span>
      );
    }
    if (act.includes("REQUEST_CREATED") || act.includes("REQUESTED")) {
      return (
        <span className="sv-status-pill PENDING">
          <Clock className="w-3 h-3 inline mr-1" />
          REQUESTED
        </span>
      );
    }
    return <span className="sv-event-badge">{act}</span>;
  };

  return (
    <div className="sv-page-container">
      {/* Header */}
      <div className="sv-page-header">
        <div>
          <h1 className="sv-page-title">Vault Access Audit Ledger</h1>
          <p className="sv-page-subtitle">
            Historical tamper-evident records of vault access authorizations, entry events, and custody actions
          </p>
        </div>

        <div className="sv-header-actions">
          <button
            className="sv-btn sv-btn-secondary"
            onClick={loadData}
            title="Synchronize audit ledger records"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Ledger</span>
          </button>

          <Link
            to="/chain-verification"
            className="sv-btn sv-btn-primary"
            title="Launch Cryptographic Hash Chain Audit"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            <span>Verify Hash Chain</span>
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="sv-alert sv-alert-error">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="sv-alert-content">{error}</div>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="sv-stat-cards">
        <div className="sv-stat-card">
          <div className="sv-stat-label">Total Access Events</div>
          <div className="sv-stat-val text-blue-400">{logs.length}</div>
          <span className="sv-stat-desc">Sequentially chained blocks</span>
        </div>

        <div className="sv-stat-card">
          <div className="sv-stat-label">Authorized Approvals</div>
          <div className="sv-stat-val text-emerald-400">{approvedCount}</div>
          <span className="sv-stat-desc">Cryptographic keys issued</span>
        </div>

        <div className="sv-stat-card">
          <div className="sv-stat-label">Rejected Inquiries</div>
          <div className="sv-stat-val text-rose-400">{rejectedCount}</div>
          <span className="sv-stat-desc">Access denied by officers</span>
        </div>

        <div className="sv-stat-card">
          <div className="sv-stat-label">Physical Unlocks</div>
          <div className="sv-stat-val text-cyan-400">{unlockedCount}</div>
          <span className="sv-stat-desc">Executed custody sessions</span>
        </div>
      </div>

      {/* Filters and Controls Card */}
      <div className="sv-card mb-6">
        <div className="sv-filter-bar">
          {/* Search Box */}
          <div className="sv-search-box" style={{ flex: "1 1 240px" }}>
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="sv-search-input"
              placeholder="Filter by log ID, employee, action, details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="sv-code-copy-btn"
                onClick={() => setSearchQuery("")}
                title="Clear query"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter by Vault ID */}
          <div className="sv-filter-group flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <label className="sv-label" style={{ margin: 0 }}>
              Vault:
            </label>
            <select
              className="sv-select"
              value={selectedVault}
              onChange={(e) => setSelectedVault(e.target.value)}
            >
              <option value="ALL">All Vaults</option>
              {vaults.map((v) => (
                <option key={v.id} value={v.id}>
                  Vault #{v.id} ({v.vaultCode})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Date */}
          <div className="sv-filter-group flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <label className="sv-label" style={{ margin: 0 }}>
              Date:
            </label>
            <input
              type="date"
              className="sv-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              title="Filter by event date"
            />
          </div>

          {/* Filter by Action */}
          <div className="sv-filter-group flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label className="sv-label" style={{ margin: 0 }}>
              Action:
            </label>
            <select
              className="sv-select"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="REQUEST_CREATED">REQUEST_CREATED</option>
              <option value="ACCESS_APPROVED">ACCESS_APPROVED</option>
              <option value="ACCESS_REJECTED">ACCESS_REJECTED</option>
              <option value="VAULT_UNLOCKED">VAULT_UNLOCKED</option>
              <option value="VAULT_LOCKED">VAULT_LOCKED</option>
              <option value="SYSTEM_INIT">SYSTEM_INIT</option>
            </select>
          </div>

          {/* Reset Filters CTA */}
          {hasActiveFilters && (
            <button
              className="sv-btn sv-btn-secondary sv-btn-sm"
              onClick={resetFilters}
              title="Reset all active filters"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Audit Data Table */}
      <div className="sv-card">
        <div className="sv-card-header">
          <div>
            <h3 className="sv-card-title flex items-center">
              <FileText className="w-5 h-5 text-blue-400 mr-2" />
              Historical Vault Access Records
            </h3>
            <p className="sv-card-sub">
              Showing {totalRecords === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords}{" "}
              records
              {hasActiveFilters ? " (Filtered)" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="sv-badge sv-badge-blue">
              Page {validCurrentPage} of {totalPages}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="sv-loading-state py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mb-2" />
            <span>Retrieving audit records from database...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="sv-empty-state py-12 text-center">
            <FileText className="w-12 h-12 text-slate-500 mb-3 mx-auto" />
            <h4 className="text-lg font-semibold text-slate-200">
              No Audit Records Found
            </h4>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              No historical vault access logs matched your active filter criteria. Try broadening your filter parameters.
            </p>
            {hasActiveFilters && (
              <button
                className="sv-btn sv-btn-secondary sv-btn-sm mt-4"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="sv-table-responsive">
            <table className="sv-table">
              <thead>
                <tr>
                  <th style={{ width: "160px" }}>Timestamp</th>
                  <th style={{ width: "160px" }}>Log ID</th>
                  <th style={{ width: "140px" }}>Requester</th>
                  <th style={{ width: "140px" }}>Approver</th>
                  <th style={{ width: "130px" }}>Vault</th>
                  <th style={{ width: "130px" }}>Action</th>
                  <th>Action Details</th>
                  <th style={{ width: "100px", textAlign: "right" }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log) => {
                  const requesterId = log.requesterId || log.employeeId;
                  const approverId = log.approverId;
                  const requesterName = getEmployeeName(requesterId);
                  const approverName = getEmployeeName(approverId);
                  const vaultCode = getVaultCode(log.vaultId);

                  return (
                    <tr
                      key={log.id}
                      className="cursor-pointer hover:bg-slate-800/40 transition-colors"
                      onClick={() => setSelectedLog(log)}
                    >
                      {/* Timestamp */}
                      <td className="font-mono text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span>
                            {log.timestamp
                              ? new Date(log.timestamp).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: false,
                                })
                              : "—"}
                          </span>
                        </div>
                      </td>

                      {/* Log ID */}
                      <td className="font-mono text-xs text-blue-400 font-semibold">
                        {log.logId}
                      </td>

                      {/* Requester ID */}
                      <td>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-slate-200 font-medium">
                            {requesterId ? `EMP-${requesterId}` : "System"}
                          </span>
                          {requesterName && (
                            <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                              {requesterName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Approver ID */}
                      <td>
                        {approverId ? (
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-emerald-300 font-medium">
                              EMP-{approverId}
                            </span>
                            {approverName && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                                {approverName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs font-mono">—</span>
                        )}
                      </td>

                      {/* Vault ID */}
                      <td>
                        {log.vaultId ? (
                          <div className="flex items-center gap-1">
                            <span className="sv-vault-code-tag font-mono text-xs">
                              {vaultCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs font-mono">System</span>
                        )}
                      </td>

                      {/* Resulting Action */}
                      <td>{renderActionBadge(log.action, log.eventType)}</td>

                      {/* Action Details */}
                      <td>
                        <div
                          className="sv-table-truncate text-slate-300 text-xs"
                          style={{ maxWidth: "300px" }}
                          title={log.actionDetails}
                        >
                          {log.actionDetails}
                        </div>
                      </td>

                      {/* Inspect Action */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="sv-btn sv-btn-secondary sv-btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          title="Inspect cryptographic proof"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalRecords > 0 && (
          <div className="sv-pagination-container">
            {/* Page Size Selector */}
            <div className="sv-page-size-selector">
              <span>Rows per page:</span>
              <select
                className="sv-select sv-btn-sm"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="sv-pagination-controls">
              <button
                className="sv-pagination-btn"
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                className="sv-pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - validCurrentPage) <= 1
                )
                .map((pageNum, idx, arr) => {
                  const showEllipsisBefore =
                    idx > 0 && pageNum - arr[idx - 1] > 1;

                  return (
                    <span key={pageNum} className="flex items-center">
                      {showEllipsisBefore && (
                        <span className="px-1 text-slate-500 text-xs">…</span>
                      )}
                      <button
                        className={`sv-pagination-btn ${
                          validCurrentPage === pageNum ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </span>
                  );
                })}

              <button
                className="sv-pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                className="sv-pagination-btn"
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forensic Inspection Modal */}
      {selectedLog && (
        <div className="sv-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div
            className="sv-modal-card"
            style={{ maxWidth: "620px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sv-modal-header">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="sv-modal-title">
                  Audit Log #{selectedLog.id} — Cryptographic Proof
                </h3>
              </div>
              <button
                className="sv-modal-close"
                onClick={() => setSelectedLog(null)}
              >
                ×
              </button>
            </div>

            <div className="sv-modal-body">
              {/* Top Meta Bar */}
              <div className="sv-block-meta-row mb-4 bg-slate-900/60 p-3 rounded-md border border-slate-800">
                <div>
                  <span className="sv-meta-label">Log Identifier:</span>
                  <span className="sv-meta-value font-mono text-blue-400 font-semibold">
                    {selectedLog.logId}
                  </span>
                </div>
                <div>
                  <span className="sv-meta-label">Timestamp:</span>
                  <span className="sv-meta-value font-mono text-xs">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="sv-meta-label">Vault:</span>
                  <span className="sv-meta-value font-mono text-xs">
                    {selectedLog.vaultId ? `Vault #${selectedLog.vaultId}` : "System Core"}
                  </span>
                </div>
              </div>

              {/* Event Type & Action */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                  <span className="sv-meta-label">Event Type</span>
                  <span className="font-mono text-xs text-slate-200">
                    {selectedLog.eventType}
                  </span>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                  <span className="sv-meta-label">Resulting Action</span>
                  <div className="mt-1">
                    {renderActionBadge(selectedLog.action, selectedLog.eventType)}
                  </div>
                </div>
              </div>

              {/* Custody Parties */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                  <span className="sv-meta-label">Requester ID</span>
                  <span className="font-mono text-xs text-slate-200">
                    EMP-{selectedLog.requesterId || selectedLog.employeeId}
                    {getEmployeeName(selectedLog.requesterId || selectedLog.employeeId) && (
                      <span className="text-slate-400 ml-1">
                        ({getEmployeeName(selectedLog.requesterId || selectedLog.employeeId)})
                      </span>
                    )}
                  </span>
                </div>
                <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                  <span className="sv-meta-label">Approver ID</span>
                  <span className="font-mono text-xs text-slate-200">
                    {selectedLog.approverId ? (
                      <>
                        EMP-{selectedLog.approverId}
                        {getEmployeeName(selectedLog.approverId) && (
                          <span className="text-slate-400 ml-1">
                            ({getEmployeeName(selectedLog.approverId)})
                          </span>
                        )}
                      </>
                    ) : (
                      "None / Unapproved"
                    )}
                  </span>
                </div>
              </div>

              {/* Action Details */}
              <div className="mb-4">
                <span className="sv-meta-label mb-1">Action Narrative Details</span>
                <p className="bg-slate-950 p-3 rounded border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                  "{selectedLog.actionDetails}"
                </p>
              </div>

              {/* Cryptographic Hashes */}
              <div>
                <span className="sv-meta-label mb-1 flex items-center justify-between">
                  <span>SHA-256 Block Hashes</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ✓ Forward-Chained
                  </span>
                </span>

                <div className="sv-hash-block">
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Previous Block Hash:</span>
                      <button
                        className="sv-code-copy-btn text-xs"
                        onClick={() => copyToClipboard(selectedLog.previousHash, "prev")}
                        title="Copy Previous Hash"
                      >
                        {copiedHash === "prev" ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 break-all bg-slate-950/70 p-2 rounded border border-slate-800/80">
                      {selectedLog.previousHash}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-blue-400 font-semibold">
                        Current Block Digest:
                      </span>
                      <button
                        className="sv-code-copy-btn text-xs"
                        onClick={() => copyToClipboard(selectedLog.currentHash, "curr")}
                        title="Copy Current Hash"
                      >
                        {copiedHash === "curr" ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-slate-200 font-semibold break-all bg-slate-950/70 p-2 rounded border border-blue-900/40">
                      {selectedLog.currentHash}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sv-modal-footer">
              <Link
                to="/chain-verification"
                className="sv-btn sv-btn-secondary sv-btn-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Audit In Hash Chain
              </Link>
              <button
                className="sv-btn sv-btn-primary sv-btn-sm"
                onClick={() => setSelectedLog(null)}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}