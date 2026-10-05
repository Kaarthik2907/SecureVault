import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { requestApi, vaultApi, branchApi } from "../api/services";
import {
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  Copy,
  Check,
  Send,
  UserCheck,
  FileCheck,
  ArrowRight,
  Terminal,
  RefreshCw,
} from "lucide-react";

export default function Requests() {
  const { user, isManager, isOfficer } = useAuth();

  // Active view: "submit" | "approval" | "terminal" | "all"
  const [activeTab, setActiveTab] = useState(isManager ? "approval" : "submit");

  // Data states
  const [requests, setRequests] = useState([]);
  const [vaults, setVaults] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Submit Request Form State
  const [selectedVaultId, setSelectedVaultId] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("60");
  const [submittedRequest, setSubmittedRequest] = useState(null);

  // Approval Modal State
  const [modalRequest, setModalRequest] = useState(null);
  const [modalAction, setModalAction] = useState("APPROVE"); // "APPROVE" | "REJECT"
  const [remarks, setRemarks] = useState("");
  const [approvalResult, setApprovalResult] = useState(null);

  // Terminal / Unlock Vault State
  const [terminalReqId, setTerminalReqId] = useState("");
  const [terminalAuthCode, setTerminalAuthCode] = useState("");
  const [unlockSuccess, setUnlockSuccess] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Load requests, vaults, branches
  const loadData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [reqRes, vltRes, brRes] = await Promise.all([
        requestApi.list(),
        vaultApi.list(),
        branchApi.list(),
      ]);

      setRequests(Array.isArray(reqRes.data) ? reqRes.data : []);
      setVaults(Array.isArray(vltRes.data) ? vltRes.data : []);
      setBranches(Array.isArray(brRes.data) ? brRes.data : []);

      if (Array.isArray(vltRes.data) && vltRes.data.length > 0 && !selectedVaultId) {
        setSelectedVaultId(String(vltRes.data[0].id));
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Failed to load requests and vaults. Check backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick-fill reason templates
  const reasonTemplates = [
    "Quarterly physical bullion audit and inventory verification",
    "Routine physical security locker inspection and sensor calibration",
    "Emergency currency re-allocation for inter-branch transfer",
    "Internal compliance inspection per RBI regulatory protocol",
  ];

  // Submit Access Request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedVaultId) {
      setErrorMessage("Please select a vault.");
      return;
    }
    if (!reason.trim()) {
      setErrorMessage("Please provide a business justification for access.");
      return;
    }

    setActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setSubmittedRequest(null);

    try {
      const payload = {
        vaultId: Number(selectedVaultId),
        reason: reason.trim(),
        estimatedDurationMinutes: Number(duration),
        requestedById: user?.employeeId || 101,
      };

      const res = await requestApi.create(payload);
      setSubmittedRequest(res.data);
      setSuccessMessage(`Vault Access Request #${res.data.requestId} submitted successfully!`);
      setReason("");
      await loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Approval Modal
  const openDecisionModal = (req, action) => {
    setModalRequest(req);
    setModalAction(action);
    setRemarks(
      action === "APPROVE"
        ? "Approved after verifying scheduled operational maintenance."
        : "Rejected due to policy compliance restrictions."
    );
    setApprovalResult(null);
  };

  // Process Approval / Rejection
  const handleDecisionSubmit = async () => {
    if (!modalRequest) return;
    setActionLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        action: modalAction,
        remarks: remarks.trim(),
        approvedById: user?.employeeId || 102,
      };

      const res = await requestApi.approval(modalRequest.requestId, payload);
      setApprovalResult(res.data);
      setSuccessMessage(
        `Request #${modalRequest.requestId} was ${modalAction === "APPROVE" ? "APPROVED" : "REJECTED"}!`
      );
      await loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Approval action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Vault Access (The End-to-End Goal)
  const handleExecuteUnlock = async (e) => {
    e.preventDefault();
    if (!terminalReqId || !terminalAuthCode) {
      setErrorMessage("Please select an approved request and enter its authorization code.");
      return;
    }

    setActionLoading(true);
    setErrorMessage("");
    setUnlockSuccess(null);

    try {
      const res = await requestApi.execute(
        Number(terminalReqId),
        terminalAuthCode.trim(),
        user?.employeeId || 101
      );
      setUnlockSuccess(res.data);
      setSuccessMessage("Vault unlocked! Cryptographic hash recorded in audit ledger.");
      await loadData();
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to unlock vault with given credentials."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Copy code utility
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Pre-fill terminal with an approved request
  const launchTerminalForRequest = (req) => {
    setTerminalReqId(String(req.requestId));
    setTerminalAuthCode(req.authorizationCode || "");
    setActiveTab("terminal");
  };

  // Derived filtered requests
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const approvedRequests = requests.filter((r) => r.status === "APPROVED");

  return (
    <div className="sv-page-container">
      {/* Header & Tabs */}
      <div className="sv-page-header">
        <div>
          <h1 className="sv-page-title">Vault Access Workflow</h1>
          <p className="sv-page-subtitle">
            Time-bound authorization lifecycle: Request Submission → Manager Approval Queue → Terminal Unlock & Hash Chaining
          </p>
        </div>

        <div className="sv-tab-pills">
          <button
            className={`sv-tab-btn ${activeTab === "submit" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("submit");
              setErrorMessage("");
            }}
          >
            <Send className="w-4 h-4 mr-2" />
            <span>1. Submit Request</span>
          </button>

          <button
            className={`sv-tab-btn ${activeTab === "approval" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("approval");
              setErrorMessage("");
            }}
          >
            <UserCheck className="w-4 h-4 mr-2" />
            <span>2. Manager Queue</span>
            {pendingRequests.length > 0 && (
              <span className="sv-tab-counter">{pendingRequests.length}</span>
            )}
          </button>

          <button
            className={`sv-tab-btn ${activeTab === "terminal" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("terminal");
              setErrorMessage("");
            }}
          >
            <Terminal className="w-4 h-4 mr-2" />
            <span>3. Unlock & Hash Write</span>
          </button>

          <button
            className={`sv-tab-btn ${activeTab === "all" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("all");
              setErrorMessage("");
            }}
          >
            <FileCheck className="w-4 h-4 mr-2" />
            <span>Audit History ({requests.length})</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <div className="sv-alert sv-alert-error">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="sv-alert-content">
            <b>Action Alert:</b> {errorMessage}
          </div>
          <button className="sv-alert-close" onClick={() => setErrorMessage("")}>
            ×
          </button>
        </div>
      )}

      {successMessage && (
        <div className="sv-alert sv-alert-success">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="sv-alert-content">{successMessage}</div>
          <button className="sv-alert-close" onClick={() => setSuccessMessage("")}>
            ×
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: SUBMIT ACCESS REQUEST */}
      {/* ========================================================================= */}
      {activeTab === "submit" && (
        <div className="sv-workflow-grid">
          {/* Submission Form Card */}
          <div className="sv-card sv-card-glow">
            <div className="sv-card-header">
              <div className="sv-card-icon-badge">
                <Send className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="sv-card-title">New Vault Access Request</h3>
                <p className="sv-card-sub">
                  Officer: <b>{user?.fullName || user?.username}</b> (Employee ID #{user?.employeeId || 101})
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="sv-form">
              {/* Vault Selector */}
              <div className="sv-form-group">
                <label className="sv-label">Target Branch Vault</label>
                <select
                  className="sv-input"
                  value={selectedVaultId}
                  onChange={(e) => setSelectedVaultId(e.target.value)}
                  required
                >
                  {vaults.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vaultCode} — {v.name} (Sec: {v.securityLevel}, Branch #{v.branchId})
                    </option>
                  ))}
                </select>
                <span className="sv-help-text">
                  Only authorized vaults in your branch jurisdiction can be unlocked.
                </span>
              </div>

              {/* Reason / Justification */}
              <div className="sv-form-group">
                <label className="sv-label">Business Justification / Reason</label>
                <textarea
                  className="sv-input sv-textarea"
                  rows="3"
                  placeholder="Enter audit or physical access justification..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
                <div className="sv-templates-container">
                  <span className="sv-templates-label">Quick Templates:</span>
                  {reasonTemplates.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="sv-template-chip"
                      onClick={() => setReason(t)}
                    >
                      {t.substring(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Duration */}
              <div className="sv-form-group">
                <label className="sv-label">Estimated Access Duration</label>
                <div className="sv-duration-pills">
                  {[15, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      className={`sv-duration-btn ${Number(duration) === mins ? "active" : ""}`}
                      onClick={() => setDuration(String(mins))}
                    >
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={actionLoading}
                className="sv-btn sv-btn-primary sv-btn-block"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Submitting to Spring Boot Backend...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Access Request (/api/v1/vault-requests)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Submission Info & Confirmation Sidebar */}
          <div className="sv-workflow-sidebar">
            {submittedRequest ? (
              <div className="sv-card sv-card-success-border">
                <div className="sv-card-header">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h3 className="sv-card-title">Request #{submittedRequest.requestId} Queued</h3>
                    <p className="sv-card-sub">Awaiting Manager Approval</p>
                  </div>
                </div>

                <div className="sv-status-banner-pending">
                  <div className="sv-status-pill-lg PENDING">PENDING MANAGER APPROVAL</div>
                  <p className="sv-pending-notice">
                    Your request has been cryptographically recorded and routed to Branch Manager{" "}
                    <b>Sarah Smith</b>.
                  </p>
                </div>

                <div className="sv-request-details-list">
                  <div className="sv-detail-row">
                    <span className="sv-detail-k">Request ID:</span>
                    <span className="sv-detail-v font-mono">#{submittedRequest.requestId}</span>
                  </div>
                  <div className="sv-detail-row">
                    <span className="sv-detail-k">Vault ID:</span>
                    <span className="sv-detail-v">Vault #{submittedRequest.vaultId}</span>
                  </div>
                  <div className="sv-detail-row">
                    <span className="sv-detail-k">Duration:</span>
                    <span className="sv-detail-v">{submittedRequest.estimatedDurationMinutes} minutes</span>
                  </div>
                  <div className="sv-detail-row">
                    <span className="sv-detail-k">Timestamp:</span>
                    <span className="sv-detail-v font-mono text-xs">
                      {new Date(submittedRequest.requestedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  className="sv-btn sv-btn-secondary sv-btn-block mt-4"
                  onClick={() => setActiveTab("approval")}
                >
                  <span>Go to Manager Approval Queue</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            ) : (
              <div className="sv-card">
                <h3 className="sv-card-title flex items-center">
                  <Shield className="w-5 h-5 text-indigo-400 mr-2" />
                  Dual-Control Protocol
                </h3>
                <p className="sv-info-text">
                  Per banking security guidelines (SOX & RBI compliance), no individual officer may access
                  a vault independently.
                </p>
                <div className="sv-timeline-steps">
                  <div className="sv-timeline-step active">
                    <div className="sv-step-circle">1</div>
                    <div className="sv-step-info">
                      <b>Submit Request</b>
                      <span>Officer declares purpose and duration</span>
                    </div>
                  </div>
                  <div className="sv-timeline-step">
                    <div className="sv-step-circle">2</div>
                    <div className="sv-step-info">
                      <b>Manager Decision</b>
                      <span>Cryptographic Auth Code issued upon review</span>
                    </div>
                  </div>
                  <div className="sv-timeline-step">
                    <div className="sv-step-circle">3</div>
                    <div className="sv-step-info">
                      <b>Terminal Unlock & Hash Log</b>
                      <span>SHA-256 immutable audit block appended</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANAGER APPROVAL QUEUE */}
      {/* ========================================================================= */}
      {activeTab === "approval" && (
        <div className="sv-card">
          <div className="sv-queue-header">
            <div>
              <h3 className="sv-card-title flex items-center">
                <UserCheck className="w-5 h-5 text-cyan-400 mr-2" />
                Manager Approval Queue
                <span className="sv-badge sv-badge-cyan ml-2">
                  {pendingRequests.length} Pending
                </span>
              </h3>
              <p className="sv-card-sub">
                Review and approve vault access requests for Branch #{user?.branchId || 1}.
              </p>
            </div>

            <button className="sv-btn sv-btn-secondary" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              <span>Refresh Queue</span>
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="sv-empty-state">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
              <h4>Approval Queue is Clear!</h4>
              <p>No pending vault access requests awaiting approval at this time.</p>
              <button
                className="sv-btn sv-btn-primary mt-4"
                onClick={() => setActiveTab("submit")}
              >
                Submit a Test Access Request
              </button>
            </div>
          ) : (
            <div className="sv-queue-grid">
              {pendingRequests.map((req) => {
                const targetVault = vaults.find((v) => Number(v.id) === Number(req.vaultId));
                return (
                  <div key={req.requestId} className="sv-queue-card">
                    <div className="sv-queue-card-top">
                      <div className="sv-request-id-badge">
                        REQUEST <b>#{req.requestId}</b>
                      </div>
                      <span className="sv-status-pill PENDING">PENDING</span>
                    </div>

                    <div className="sv-queue-card-body">
                      <div className="sv-queue-vault-info">
                        <Lock className="w-4 h-4 text-cyan-400 mr-2" />
                        <b>{targetVault?.vaultCode || `Vault #${req.vaultId}`}</b>
                        <span className="sv-vault-subname">
                          {targetVault?.name || "Branch Bullion Vault"}
                        </span>
                      </div>

                      <div className="sv-queue-meta-row">
                        <div>
                          <span className="sv-meta-label">Officer ID:</span>
                          <span className="sv-meta-value">EMP-{req.requestedById}</span>
                        </div>
                        <div>
                          <span className="sv-meta-label">Duration:</span>
                          <span className="sv-meta-value">{req.estimatedDurationMinutes} mins</span>
                        </div>
                        <div>
                          <span className="sv-meta-label">Security:</span>
                          <span className="sv-meta-value text-amber-400">
                            {targetVault?.securityLevel || "CRITICAL"}
                          </span>
                        </div>
                      </div>

                      <div className="sv-reason-box">
                        <span className="sv-reason-label">Justification:</span>
                        <p className="sv-reason-text">"{req.reason}"</p>
                      </div>

                      <div className="sv-timestamp-sub">
                        Requested: {new Date(req.requestedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="sv-queue-actions">
                      <button
                        className="sv-btn sv-btn-approve"
                        onClick={() => openDecisionModal(req, "APPROVE")}
                      >
                        <Check className="w-4 h-4 mr-1.5" />
                        Approve
                      </button>
                      <button
                        className="sv-btn sv-btn-reject"
                        onClick={() => openDecisionModal(req, "REJECT")}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VAULT TERMINAL / UNLOCK & HASH WRITE (End-to-End Goal) */}
      {/* ========================================================================= */}
      {activeTab === "terminal" && (
        <div className="sv-terminal-wrapper">
          <div className="sv-card sv-terminal-card">
            <div className="sv-card-header">
              <div className="sv-terminal-icon">
                <Terminal className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="sv-card-title font-mono">SECURE VAULT UNLOCK CONSOLE</h3>
                <p className="sv-card-sub">
                  Physical Biometric & Authorization Code Verification Terminal
                </p>
              </div>
            </div>

            {/* Approved Requests Quick Pick */}
            {approvedRequests.length > 0 && (
              <div className="sv-approved-quick-pick">
                <label className="sv-label">Approved Requests Ready to Unlock:</label>
                <div className="sv-quick-pick-chips">
                  {approvedRequests.map((req) => (
                    <button
                      type="button"
                      key={req.requestId}
                      className={`sv-quick-chip ${
                        Number(terminalReqId) === req.requestId ? "selected" : ""
                      }`}
                      onClick={() => {
                        setTerminalReqId(String(req.requestId));
                        setTerminalAuthCode(req.authorizationCode || "");
                      }}
                    >
                      <span>Request #{req.requestId} (Vault #{req.vaultId})</span>
                      <span className="sv-quick-code font-mono">{req.authorizationCode}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleExecuteUnlock} className="sv-terminal-form">
              <div className="sv-form-row">
                <div className="sv-form-group flex-1">
                  <label className="sv-label">Request ID</label>
                  <input
                    type="number"
                    className="sv-input font-mono"
                    placeholder="e.g. 1001"
                    value={terminalReqId}
                    onChange={(e) => setTerminalReqId(e.target.value)}
                    required
                  />
                </div>

                <div className="sv-form-group flex-2">
                  <label className="sv-label">Cryptographic Authorization Code</label>
                  <input
                    type="text"
                    className="sv-input font-mono uppercase tracking-wider"
                    placeholder="AUTH-XXXXXX-2026"
                    value={terminalAuthCode}
                    onChange={(e) => setTerminalAuthCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="sv-btn sv-btn-unlock-terminal"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Verifying Authorization & Hashing Audit Log...
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5 mr-2 text-emerald-400" />
                    AUTHORIZE & UNLOCK PHYSICAL VAULT
                  </>
                )}
              </button>
            </form>

            {/* Unlock Success & Cryptographic Hash Write Display */}
            {unlockSuccess && (
              <div className="sv-unlock-result-panel">
                <div className="sv-unlock-result-header">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="sv-unlock-title">
                      PHYSICAL VAULT #{unlockSuccess.vaultId} UNLOCKED
                    </h4>
                    <span className="sv-unlock-status">SESSION ACTIVE · ACCESS GRANTED</span>
                  </div>
                </div>

                {unlockSuccess.auditLog && (
                  <div className="sv-audit-write-card">
                    <div className="sv-audit-card-title">
                      <Shield className="w-4 h-4 text-cyan-400 mr-2" />
                      <span>IMMUTABLE AUDIT LOG WRITTEN (SHA-256 HASH CHAIN)</span>
                    </div>

                    <div className="sv-hash-block">
                      <div className="sv-hash-row">
                        <span className="sv-hash-k">Log ID:</span>
                        <span className="sv-hash-v font-mono">{unlockSuccess.auditLog.logId}</span>
                      </div>
                      <div className="sv-hash-row">
                        <span className="sv-hash-k">Event Type:</span>
                        <span className="sv-hash-v font-mono text-cyan-300">
                          {unlockSuccess.auditLog.eventType}
                        </span>
                      </div>
                      <div className="sv-hash-row">
                        <span className="sv-hash-k">Timestamp:</span>
                        <span className="sv-hash-v font-mono text-xs">
                          {unlockSuccess.auditLog.timestamp}
                        </span>
                      </div>
                      <div className="sv-hash-row">
                        <span className="sv-hash-k">Previous Hash:</span>
                        <span className="sv-hash-v font-mono text-xs break-all text-slate-400">
                          {unlockSuccess.auditLog.previousHash}
                        </span>
                      </div>
                      <div className="sv-hash-row highlight">
                        <span className="sv-hash-k text-emerald-400">Current SHA-256 Hash:</span>
                        <span className="sv-hash-v font-mono text-xs break-all text-emerald-400 font-semibold">
                          {unlockSuccess.auditLog.currentHash}
                        </span>
                      </div>
                    </div>

                    <div className="sv-audit-footer-actions">
                      <span className="sv-ledger-tag">✓ Cryptographically Sealed in Database</span>
                      <a href="#/audit" className="sv-btn sv-btn-sm sv-btn-secondary">
                        Verify Audit Chain Integrity →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPLETE REQUEST AUDIT HISTORY */}
      {/* ========================================================================= */}
      {activeTab === "all" && (
        <div className="sv-card">
          <div className="sv-card-header">
            <div>
              <h3 className="sv-card-title">Access Request Ledger</h3>
              <p className="sv-card-sub">All submitted requests across branch vaults</p>
            </div>
            <button className="sv-btn sv-btn-secondary" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="sv-table-responsive">
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Vault</th>
                  <th>Officer</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Authorization Code</th>
                  <th>Requested At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const targetVault = vaults.find((v) => Number(v.id) === Number(r.vaultId));
                  return (
                    <tr key={r.requestId}>
                      <td className="font-mono font-semibold">#{r.requestId}</td>
                      <td>
                        <b>{targetVault?.vaultCode || `Vault #${r.vaultId}`}</b>
                      </td>
                      <td>EMP-{r.requestedById}</td>
                      <td>{r.estimatedDurationMinutes}m</td>
                      <td className="sv-table-truncate" title={r.reason}>
                        {r.reason}
                      </td>
                      <td>
                        <span className={`sv-status-pill ${r.status}`}>{r.status}</span>
                      </td>
                      <td>
                        {r.authorizationCode ? (
                          <div className="sv-code-pill font-mono">
                            <span>{r.authorizationCode}</span>
                            <button
                              className="sv-code-copy-btn"
                              title="Copy code"
                              onClick={() => copyToClipboard(r.authorizationCode)}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="text-xs font-mono text-slate-400">
                        {new Date(r.requestedAt).toLocaleDateString()}
                      </td>
                      <td>
                        {r.status === "PENDING" && (
                          <button
                            className="sv-btn sv-btn-sm sv-btn-primary"
                            onClick={() => {
                              openDecisionModal(r, "APPROVE");
                              setActiveTab("approval");
                            }}
                          >
                            Review
                          </button>
                        )}
                        {r.status === "APPROVED" && (
                          <button
                            className="sv-btn sv-btn-sm sv-btn-unlock"
                            onClick={() => launchTerminalForRequest(r)}
                          >
                            <Unlock className="w-3.5 h-3.5 mr-1" />
                            Unlock
                          </button>
                        )}
                        {r.status === "ACCESSED" && (
                          <span className="text-emerald-400 text-xs font-semibold">
                            ✓ Unlocked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DECISION MODAL (APPROVE / REJECT) */}
      {/* ========================================================================= */}
      {modalRequest && (
        <div className="sv-modal-overlay">
          <div className="sv-modal-card">
            <div className="sv-modal-header">
              <h3 className="sv-modal-title">
                {modalAction === "APPROVE" ? "Approve Access Request" : "Reject Access Request"} #
                {modalRequest.requestId}
              </h3>
              <button className="sv-modal-close" onClick={() => setModalRequest(null)}>
                ×
              </button>
            </div>

            <div className="sv-modal-body">
              <div className="sv-modal-summary">
                <div>
                  <span className="sv-meta-label">Vault:</span>
                  <b>Vault #{modalRequest.vaultId}</b>
                </div>
                <div>
                  <span className="sv-meta-label">Requested By:</span>
                  <b>Officer EMP-{modalRequest.requestedById}</b>
                </div>
                <div>
                  <span className="sv-meta-label">Duration:</span>
                  <b>{modalRequest.estimatedDurationMinutes} minutes</b>
                </div>
              </div>

              <div className="sv-form-group mt-4">
                <label className="sv-label">
                  {modalAction === "APPROVE" ? "Approval Remarks" : "Rejection Reason"}
                </label>
                <textarea
                  className="sv-input"
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter manager remarks for the audit record..."
                />
              </div>

              {approvalResult && (
                <div className="sv-approval-result-box">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1" />
                  <h4>Request #{approvalResult.requestId} Approved!</h4>
                  {approvalResult.authorizationCode && (
                    <div className="sv-generated-code-box">
                      <span className="sv-code-label">Cryptographic Authorization Code:</span>
                      <div className="sv-code-copy-row">
                        <span className="font-mono text-lg text-cyan-300 font-bold">
                          {approvalResult.authorizationCode}
                        </span>
                        <button
                          className="sv-btn sv-btn-sm sv-btn-secondary"
                          onClick={() => copyToClipboard(approvalResult.authorizationCode)}
                        >
                          {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span className="ml-1">{copiedCode ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sv-modal-footer">
              {!approvalResult ? (
                <>
                  <button
                    className="sv-btn sv-btn-secondary"
                    onClick={() => setModalRequest(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`sv-btn ${modalAction === "APPROVE" ? "sv-btn-approve" : "sv-btn-reject"}`}
                    onClick={handleDecisionSubmit}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : `Confirm ${modalAction}`}
                  </button>
                </>
              ) : (
                <button
                  className="sv-btn sv-btn-primary"
                  onClick={() => {
                    setModalRequest(null);
                    setApprovalResult(null);
                    setActiveTab("terminal");
                    setTerminalReqId(String(approvalResult.requestId));
                    setTerminalAuthCode(approvalResult.authorizationCode || "");
                  }}
                >
                  Proceed to Vault Unlock Terminal →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}