import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auditApi } from "../api/services";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowDown,
  RotateCcw,
  FileText,
  Clock,
  KeyRound,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Flame,
  Bug,
  Info,
  ExternalLink,
  Check,
  Copy,
} from "lucide-react";

export default function ChainVerification() {
  const { user } = useAuth();
  const [verification, setVerification] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tamperingLoading, setTamperingLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState("");
  const [tamperedId, setTamperedId] = useState(null);
  const [auditTriggered, setAuditTriggered] = useState(false);

  // Security: Mask hashes by default. Track unmasked block IDs in component state.
  const [revealedBlockIds, setRevealedBlockIds] = useState(new Set());

  // Security Officer PIN Re-authentication Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [targetBlockForAuth, setTargetBlockForAuth] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Hardcoded dummy PIN for frontend demo contract
  const HARDCODED_OFFICER_PIN = "1234";

  // Load audit logs and trigger chain verification
  const runManualAudit = async () => {
    setLoading(true);
    setError("");
    setAuditTriggered(true);
    try {
      const [verRes, logsRes] = await Promise.all([
        auditApi.verify(),
        auditApi.getLogs(),
      ]);
      setVerification(verRes.data);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to communicate with Audit Verification endpoint."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runManualAudit();
  }, []);

  // Simulate malicious tampering of a record
  const handleSimulateTamper = async (logId = 14) => {
    setTamperingLoading(true);
    setError("");
    try {
      await auditApi.simulateTamper(logId);
      setTamperedId(logId);
      // Run verification immediately to show failure state
      const [verRes, logsRes] = await Promise.all([
        auditApi.verify(),
        auditApi.getLogs(),
      ]);
      setVerification(verRes.data);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (err) {
      setError(err.message || "Failed to simulate tampering");
    } finally {
      setTamperingLoading(false);
    }
  };

  // Reset chain back to valid state
  const handleReset = async () => {
    setResetLoading(true);
    setError("");
    try {
      await auditApi.reset();
      setTamperedId(null);
      await runManualAudit();
    } catch (err) {
      setError(err.message || "Failed to reset chain");
    } finally {
      setResetLoading(false);
    }
  };

  // Open PIN verification modal for a specific block
  const handleOpenAuthModal = (log) => {
    setTargetBlockForAuth(log);
    setPinInput("");
    setPinError("");
    setAuthModalOpen(true);
  };

  // Close PIN verification modal
  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
    setTargetBlockForAuth(null);
    setPinInput("");
    setPinError("");
  };

  // Verify PIN submission
  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === HARDCODED_OFFICER_PIN) {
      if (targetBlockForAuth) {
        setRevealedBlockIds((prev) => {
          const updated = new Set(prev);
          updated.add(targetBlockForAuth.id);
          return updated;
        });
      }
      handleCloseAuthModal();
    } else {
      setPinError("Invalid Security Officer PIN. Authorization denied.");
    }
  };

  // Re-mask / Hide hashes for a specific block
  const handleHideHashes = (blockId) => {
    setRevealedBlockIds((prev) => {
      const updated = new Set(prev);
      updated.delete(blockId);
      return updated;
    });
  };

  // Mask all currently revealed blocks
  const handleMaskAll = () => {
    setRevealedBlockIds(new Set());
  };

  return (
    <div className="sv-page-container">
      {/* Header */}
      <div className="sv-page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="sv-page-title">Cryptographic Hash Chain Verification</h1>
            <span
              className="sv-role-badge sv-role-auditor"
              title="Restricted Security Officer Clearance"
            >
              Security Officer Console
            </span>
          </div>
          <p className="sv-page-subtitle">
            Zero-Trust manual verification of immutable SHA-256 forward-linked audit blocks wired to live endpoint{" "}
            <code>/api/v1/audit/verify</code>
          </p>
        </div>

        <div className="sv-header-actions">
          <Link
            to="/audit"
            className="sv-btn sv-btn-secondary"
            title="Browse all historical access logs"
          >
            <FileText className="w-4 h-4 mr-2" />
            <span>Audit Log Viewer</span>
          </Link>

          <button
            className="sv-btn sv-btn-secondary"
            onClick={handleReset}
            disabled={resetLoading || loading}
            title="Reset to clean baseline chain"
          >
            <RotateCcw
              className={`w-4 h-4 mr-2 ${resetLoading ? "animate-spin" : ""}`}
            />
            <span>Reset Baseline Chain</span>
          </button>

          <button
            className="sv-btn sv-btn-primary"
            onClick={runManualAudit}
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            <span>Trigger Manual Audit</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="sv-alert sv-alert-error">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="sv-alert-content">{error}</div>
        </div>
      )}

      {/* Security Demonstration Testing Sandbox */}
      <div className="sv-card mb-6" style={{ background: "rgba(15, 23, 42, 0.7)" }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <Bug className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Security Auditor Simulation Sandbox
              </div>
              <div className="text-[11px] text-slate-400">
                Test the cryptographic detection engine by simulating an unauthorized database modification
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="sv-btn sv-btn-sm sv-btn-reject"
              onClick={() => handleSimulateTamper(14)}
              disabled={tamperingLoading || loading}
              title="Simulate attacker modifying record #14 in database"
            >
              <Flame className="w-3.5 h-3.5 mr-1 text-rose-400" />
              <span>Simulate Malicious Tampering (Record #14)</span>
            </button>

            <button
              className="sv-btn sv-btn-sm sv-btn-secondary"
              onClick={handleReset}
              disabled={resetLoading || loading}
              title="Restore mathematical integrity"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Restore Integrity</span>
            </button>

            {revealedBlockIds.size > 0 && (
              <button
                className="sv-btn sv-btn-sm sv-btn-secondary"
                onClick={handleMaskAll}
                title="Mask all currently revealed block hashes"
              >
                <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <span>Mask All Hashes ({revealedBlockIds.size})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Verification Outcome Visual State Banner */}
      {verification && (
        <div
          className={`sv-card sv-audit-result-banner ${
            verification.isChainValid ? "valid" : "tampered"
          }`}
          style={
            !verification.isChainValid
              ? {
                  borderColor: "rgba(239, 68, 68, 0.6)",
                  boxShadow: "0 0 25px -5px rgba(239, 68, 68, 0.25)",
                }
              : {}
          }
        >
          <div className="sv-audit-banner-left">
            <div className="sv-audit-banner-icon">
              {verification.isChainValid ? (
                <ShieldCheck className="w-12 h-12 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-12 h-12 text-rose-400 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="sv-audit-banner-title">
                  {verification.isChainValid
                    ? "CHAIN INTACT: ZERO TAMPERING DETECTED"
                    : "TAMPERING DETECTED: INTEGRITY COMPROMISED"}
                </h2>
                <span
                  className={`sv-status-chip ${
                    verification.isChainValid ? "active" : "inactive"
                  }`}
                >
                  {verification.isChainValid ? "CHAIN INTACT" : "HIGH ALERT"}
                </span>
              </div>
              <p className="sv-audit-banner-desc">
                {verification.isChainValid
                  ? `All ${verification.totalRecordsChecked} audit blocks verified sequentially via unbroken SHA-256 forward hashes.`
                  : `Cryptographic mismatch found at Log ID #${verification.tamperedLogId}. Record modified without valid key hash.`}
              </p>
            </div>
          </div>

          <div className="sv-audit-banner-meta">
            <div>
              <span className="sv-meta-label">Records Checked</span>
              <b className="font-mono text-xl text-slate-100">
                {verification.totalRecordsChecked}
              </b>
            </div>
            <div>
              <span className="sv-meta-label">Audit Timestamp</span>
              <span className="font-mono text-xs text-slate-300 block mt-1">
                {verification.verifiedAt
                  ? new Date(verification.verifiedAt).toLocaleTimeString()
                  : "Just now"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* High-Alert Forensic Breakdown (If Tampered State) */}
      {verification && !verification.isChainValid && (
        <div
          className="sv-card mb-6"
          style={{
            borderColor: "rgba(239, 68, 68, 0.6)",
            background: "rgba(220, 38, 38, 0.08)",
          }}
        >
          <div className="sv-card-header border-b border-rose-900/50 pb-3 mb-3">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-rose-400 mr-2" />
              <h3 className="sv-card-title text-rose-400">
                Forensic Tamper Breakdown — Cryptographic Discrepancy
              </h3>
            </div>
            <span
              className="sv-status-pill REJECTED"
              style={{ fontWeight: 700 }}
            >
              CRITICAL VIOLATION
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-4">
            The sequential forward hash of block <b>Log ID #{verification.tamperedLogId}</b> failed cryptographic validation. The database record content deviates from the mathematically expected digest calculated from its immutable predecessor.
          </p>

          <div className="sv-hash-block">
            <div className="sv-hash-row">
              <span className="sv-hash-k">Compromised Block:</span>
              <span className="sv-hash-v font-mono text-rose-300 font-semibold">
                Log ID #{verification.tamperedLogId}
              </span>
            </div>

            <div className="sv-hash-row">
              <span className="sv-hash-k">Expected Hash:</span>
              <span className="sv-hash-v font-mono text-emerald-400 text-xs break-all">
                {verification.expectedHash}
              </span>
            </div>

            <div className="sv-hash-row">
              <span className="sv-hash-k">Actual Database Hash:</span>
              <span className="sv-hash-v font-mono text-rose-400 text-xs break-all">
                {verification.actualHash}
              </span>
            </div>

            <div className="sv-hash-row highlight">
              <span className="sv-hash-k">Security Protocol:</span>
              <span className="sv-hash-v text-xs text-amber-300">
                SOC-2 & Vault Access Freeze Triggered — Notify Internal Audit Immediately
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Blockchain Sequence & Block Explorer */}
      <div className="sv-card">
        <div className="sv-card-header">
          <div>
            <h3 className="sv-card-title flex items-center">
              <Layers className="w-5 h-5 text-blue-400 mr-2" />
              Cryptographic Audit Chain Explorer
            </h3>
            <p className="sv-card-sub">
              Sequential ledger entries where each block contains the cryptographic digest of its predecessor
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="sv-badge sv-badge-blue">
              {logs.length} Blocks Sequenced
            </span>
          </div>
        </div>

        <div className="sv-blockchain-timeline">
          {logs.map((log, index) => {
            const isGenesis = index === 0;
            const isCompromised =
              !verification?.isChainValid &&
              Number(verification?.tamperedLogId) === Number(log.id);

            const isRevealed = revealedBlockIds.has(log.id);

            return (
              <div key={log.id} className="sv-block-wrapper">
                {/* Connector Arrow */}
                {!isGenesis && (
                  <div className="sv-block-connector">
                    <div className="sv-connector-line" />
                    <div className="sv-connector-arrow">
                      <ArrowDown className="w-4 h-4 text-slate-400" />
                      <span className="sv-connector-label font-mono">
                        prev_hash: {log.previousHash ? log.previousHash.substring(0, 10) : "0000000000"}...
                      </span>
                    </div>
                  </div>
                )}

                {/* Block Card */}
                <div
                  className={`sv-block-card ${
                    isCompromised ? "compromised" : ""
                  }`}
                  style={
                    isCompromised
                      ? {
                          borderColor: "rgba(239, 68, 68, 0.8)",
                          boxShadow: "0 0 15px rgba(239, 68, 68, 0.2)",
                        }
                      : {}
                  }
                >
                  <div className="sv-block-card-header">
                    <div className="flex items-center">
                      <div className="sv-block-index-pill font-mono">
                        BLOCK #{index + 1}
                      </div>
                      <span className="sv-block-log-id font-mono ml-3 text-blue-400">
                        {log.logId}
                      </span>
                      {isCompromised && (
                        <span className="ml-2 sv-status-pill REJECTED text-[10px] font-bold">
                          TAMPERED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="sv-event-badge">{log.eventType}</span>
                      <button
                        className="sv-btn sv-btn-tamper-demo"
                        title="Simulate attacker modifying this record in the database"
                        onClick={() => handleSimulateTamper(log.id)}
                      >
                        Tamper Test
                      </button>
                    </div>
                  </div>

                  <div className="sv-block-body">
                    <p className="sv-block-action">"{log.actionDetails}"</p>

                    <div className="sv-block-meta-row">
                      <div>
                        <span className="sv-meta-label">Requester / Officer:</span>
                        <span className="sv-meta-value font-mono">
                          EMP-{log.requesterId || log.employeeId}
                        </span>
                      </div>
                      <div>
                        <span className="sv-meta-label">Approver:</span>
                        <span className="sv-meta-value font-mono">
                          {log.approverId ? `EMP-${log.approverId}` : "None"}
                        </span>
                      </div>
                      <div>
                        <span className="sv-meta-label">Vault ID:</span>
                        <span className="sv-meta-value font-mono">
                          {log.vaultId ? `Vault #${log.vaultId}` : "System Core"}
                        </span>
                      </div>
                      <div>
                        <span className="sv-meta-label">Timestamp:</span>
                        <span className="sv-meta-value font-mono text-xs">
                          {log.timestamp
                            ? new Date(log.timestamp).toLocaleString()
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Hashes Display Container with Security Masking & Reveal Option */}
                    <div className="sv-block-hashes">
                      {/* Hash Container Action Bar */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2 text-xs">
                          {isRevealed ? (
                            <Unlock className="w-3.5 h-3.5 text-blue-400" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span className="text-slate-300 font-medium">
                            Cryptographic Hashes
                          </span>
                          {isRevealed ? (
                            <span className="sv-badge sv-badge-blue text-[10px] py-0 px-1.5">
                              UNMASKED
                            </span>
                          ) : (
                            <span className="sv-badge text-[10px] py-0 px-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              MASKED BY DEFAULT
                            </span>
                          )}
                        </div>

                        {/* Reveal or Mask Toggle Button */}
                        {isRevealed ? (
                          <button
                            className="sv-btn sv-btn-secondary sv-btn-sm text-[11px] py-0.5 px-2"
                            onClick={() => handleHideHashes(log.id)}
                            title="Mask cryptographic digests for this block"
                          >
                            <EyeOff className="w-3 h-3 mr-1 text-slate-400" />
                            <span>Mask Hashes</span>
                          </button>
                        ) : (
                          <button
                            className="sv-btn-auth-reveal py-0.5 px-2"
                            onClick={() => handleOpenAuthModal(log)}
                            title="Authenticate to reveal raw SHA-256 hashes"
                          >
                            <KeyRound className="w-3 h-3 mr-1.5 text-blue-300" />
                            <span>Authenticate to Reveal Hashes</span>
                          </button>
                        )}
                      </div>

                      {/* Previous Hash Row */}
                      <div className="sv-hash-display-row items-center">
                        <span className="sv-hash-display-k">Previous Hash:</span>
                        {isRevealed ? (
                          <span className="sv-hash-display-v font-mono text-xs text-slate-400 break-all select-all">
                            {log.previousHash}
                          </span>
                        ) : (
                          <span className="sv-hash-display-v sv-hash-masked-dots">
                            ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                          </span>
                        )}
                      </div>

                      {/* Current Hash Row */}
                      <div className="sv-hash-display-row items-center mt-1.5">
                        <span className="sv-hash-display-k text-blue-400 font-medium">
                          Current Hash:
                        </span>
                        {isRevealed ? (
                          <span
                            className={`sv-hash-display-v font-mono text-xs font-semibold break-all select-all ${
                              isCompromised
                                ? "text-rose-400 font-bold"
                                : "text-slate-200"
                            }`}
                          >
                            {log.currentHash}
                          </span>
                        ) : (
                          <span
                            className={`sv-hash-display-v sv-hash-masked-dots ${
                              isCompromised ? "text-rose-400/60 font-semibold" : ""
                            }`}
                          >
                            ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Officer PIN Re-Authentication Modal */}
      {authModalOpen && targetBlockForAuth && (
        <div className="sv-modal-overlay" onClick={handleCloseAuthModal}>
          <div
            className="sv-modal-card"
            style={{ maxWidth: "440px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sv-modal-header">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-400" />
                <h3 className="sv-modal-title">Security Officer Authorization</h3>
              </div>
              <button
                className="sv-modal-close"
                onClick={handleCloseAuthModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleVerifyPin}>
              <div className="sv-modal-body">
                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  Enter Security Officer PIN to view raw ledger data for{" "}
                  <b>Block #{targetBlockForAuth.id}</b> ({targetBlockForAuth.logId}).
                </p>

                {/* Target Block Metadata Pill */}
                <div className="bg-slate-900/60 border border-slate-800 rounded p-2.5 mb-4 text-xs font-mono flex items-center justify-between">
                  <span className="text-slate-400">Target Record:</span>
                  <span className="text-blue-400 font-semibold">
                    {targetBlockForAuth.logId}
                  </span>
                </div>

                {/* Error Alert */}
                {pinError && (
                  <div className="sv-alert sv-alert-error py-2 mb-3 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <div className="sv-alert-content">{pinError}</div>
                  </div>
                )}

                <div className="sv-form-group">
                  <label className="sv-label flex items-center justify-between">
                    <span>Security Officer PIN</span>
                    <span className="text-[11px] text-blue-400 font-normal">
                      Demo PIN: <b>1234</b>
                    </span>
                  </label>
                  <input
                    type="password"
                    className="sv-input font-mono text-center tracking-widest text-lg"
                    placeholder="••••"
                    maxLength={8}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError("");
                    }}
                    autoFocus
                    required
                  />
                  <span className="sv-help-text">
                    Restricted cryptographic clearance required under FIPS 140-3 protocol.
                  </span>
                </div>
              </div>

              <div className="sv-modal-footer">
                <button
                  type="button"
                  className="sv-btn sv-btn-secondary sv-btn-sm"
                  onClick={handleCloseAuthModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="sv-btn sv-btn-primary sv-btn-sm"
                >
                  <Unlock className="w-3.5 h-3.5 mr-1" />
                  Verify PIN & Reveal Hashes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
