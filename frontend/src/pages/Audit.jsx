import { useState, useEffect } from "react";
import { auditApi } from "../api/services";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Fingerprint,
  Link,
  Lock,
  Layers,
  FileText,
  Clock,
  ArrowDown,
  RotateCcw,
} from "lucide-react";

export default function Audit() {
  const [verification, setVerification] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tamperedId, setTamperedId] = useState(null);

  // Load audit logs and verify chain
  const loadAndVerify = async () => {
    setLoading(true);
    setError("");
    try {
      const [verRes, logsRes] = await Promise.all([
        auditApi.verify(),
        auditApi.logs(),
      ]);
      setVerification(verRes.data);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to communicate with Audit Verification endpoint."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAndVerify();
  }, []);

  // Simulate malicious modification of a record
  const handleSimulateTamper = async (logId) => {
    try {
      await auditApi.simulateTamper(logId);
      setTamperedId(logId);
      // Run verification immediately to show failure
      const verRes = await auditApi.verify();
      const logsRes = await auditApi.logs();
      setVerification(verRes.data);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch (err) {
      setError(err.message || "Failed to simulate tampering");
    }
  };

  // Reset chain back to valid state
  const handleReset = async () => {
    try {
      await auditApi.reset();
      setTamperedId(null);
      await loadAndVerify();
    } catch (err) {
      setError(err.message || "Failed to reset chain");
    }
  };

  return (
    <div className="sv-page-container">
      {/* Header */}
      <div className="sv-page-header">
        <div>
          <h1 className="sv-page-title">Cryptographic Hash Chain Verification</h1>
          <p className="sv-page-subtitle">
            Immutable SHA-256 forward-linked audit blocks wired to live Spring Boot endpoint <code>/api/v1/audit/verify</code>
          </p>
        </div>

        <div className="sv-header-actions">
          <button
            className="sv-btn sv-btn-secondary"
            onClick={handleReset}
            title="Reset to clean baseline chain"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>Reset Chain</span>
          </button>

          <button
            className="sv-btn sv-btn-primary"
            onClick={loadAndVerify}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            <span>Verify Entire Audit Chain</span>
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

      {/* Verification Status Banner */}
      {verification && (
        <div
          className={`sv-card sv-audit-result-banner ${
            verification.isChainValid ? "valid" : "tampered"
          }`}
        >
          <div className="sv-audit-banner-left">
            <div className="sv-audit-banner-icon">
              {verification.isChainValid ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-rose-400" />
              )}
            </div>
            <div>
              <h2 className="sv-audit-banner-title">
                {verification.isChainValid
                  ? "✓ HASH CHAIN VALID: ZERO TAMPERING DETECTED"
                  : "⚠ INTEGRITY VIOLATION: TAMPERED RECORD DETECTED"}
              </h2>
              <p className="sv-audit-banner-desc">
                {verification.isChainValid
                  ? `All ${verification.totalRecordsChecked} audit blocks verified sequentially via SHA-256 forward hashes.`
                  : `Cryptographic mismatch found at Log ID #${verification.tamperedLogId}. Record modified without valid key hash.`}
              </p>
            </div>
          </div>

          <div className="sv-audit-banner-meta">
            <div>
              <span className="sv-meta-label">Records Checked:</span>
              <b className="font-mono text-lg">{verification.totalRecordsChecked}</b>
            </div>
            <div>
              <span className="sv-meta-label">Verification Time:</span>
              <span className="font-mono text-xs text-slate-300">
                {new Date(verification.verifiedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tampered Details Card (If Compromised) */}
      {verification && !verification.isChainValid && (
        <div className="sv-card sv-card-error-border mb-6">
          <div className="sv-card-header">
            <AlertTriangle className="w-5 h-5 text-rose-400 mr-2" />
            <h3 className="sv-card-title text-rose-400">Tamper Forensic Breakdown</h3>
          </div>
          <div className="sv-hash-block">
            <div className="sv-hash-row">
              <span className="sv-hash-k">Tampered Block:</span>
              <span className="sv-hash-v font-mono">Log ID #{verification.tamperedLogId}</span>
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
          </div>
        </div>
      )}

      {/* Visual Blockchain Sequence */}
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
          <span className="sv-badge sv-badge-blue">{logs.length} Blocks Sequenced</span>
        </div>

        <div className="sv-blockchain-timeline">
          {logs.map((log, index) => {
            const isGenesis = index === 0;
            const isCompromised = !verification?.isChainValid && verification?.tamperedLogId === log.id;

            return (
              <div key={log.id} className="sv-block-wrapper">
                {/* Connector Arrow */}
                {!isGenesis && (
                  <div className="sv-block-connector">
                    <div className="sv-connector-line" />
                    <div className="sv-connector-arrow">
                      <ArrowDown className="w-4 h-4 text-slate-400" />
                      <span className="sv-connector-label font-mono">
                        prev_hash: {log.previousHash.substring(0, 10)}...
                      </span>
                    </div>
                  </div>
                )}

                {/* Block Card */}
                <div className={`sv-block-card ${isCompromised ? "compromised" : ""}`}>
                  <div className="sv-block-card-header">
                    <div className="flex items-center">
                      <div className="sv-block-index-pill font-mono">
                        BLOCK #{index + 1}
                      </div>
                      <span className="sv-block-log-id font-mono ml-3 text-blue-400">
                        {log.logId}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="sv-event-badge">{log.eventType}</span>
                      <button
                        className="sv-btn sv-btn-tamper-demo ml-3"
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
                        <span className="sv-meta-label">Employee:</span>
                        <span className="sv-meta-value">EMP-{log.employeeId}</span>
                      </div>
                      <div>
                        <span className="sv-meta-label">Vault ID:</span>
                        <span className="sv-meta-value">{log.vaultId ? `Vault #${log.vaultId}` : "System"}</span>
                      </div>
                      <div>
                        <span className="sv-meta-label">Timestamp:</span>
                        <span className="sv-meta-value font-mono text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Hashes Display */}
                    <div className="sv-block-hashes">
                      <div className="sv-hash-display-row">
                        <span className="sv-hash-display-k">Previous Hash:</span>
                        <span className="sv-hash-display-v font-mono text-xs text-slate-400 break-all">
                          {log.previousHash}
                        </span>
                      </div>
                      <div className="sv-hash-display-row mt-1">
                        <span className="sv-hash-display-k text-blue-400">Current Hash:</span>
                        <span className="sv-hash-display-v font-mono text-xs text-slate-200 font-semibold break-all">
                          {log.currentHash}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}