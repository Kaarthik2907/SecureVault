import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vaultApi, branchApi } from "../api/services";
import {
  Lock,
  Unlock,
  Shield,
  Plus,
  RefreshCw,
  Search,
  Building2,
  Users,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Trash2,
  Edit3,
} from "lucide-react";

export default function Vaults() {
  const [vaults, setVaults] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create / Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVault, setEditingVault] = useState(null);
  const [formData, setFormData] = useState({
    vaultCode: "",
    branchId: "1",
    name: "",
    securityLevel: "HIGH",
    maxConcurrentAccess: "2",
    isLocked: true,
  });

  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [vRes, bRes] = await Promise.all([vaultApi.list(), branchApi.list()]);
      setVaults(Array.isArray(vRes.data) ? vRes.data : []);
      setBranches(Array.isArray(bRes.data) ? bRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vaults from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingVault(null);
    setFormData({
      vaultCode: `VLT-BR${selectedBranch !== "ALL" ? selectedBranch : "1"}-${Math.floor(Math.random() * 900 + 100)}`,
      branchId: selectedBranch !== "ALL" ? selectedBranch : "1",
      name: "",
      securityLevel: "HIGH",
      maxConcurrentAccess: "2",
      isLocked: true,
    });
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setEditingVault(v);
    setFormData({
      vaultCode: v.vaultCode,
      branchId: String(v.branchId || v.branch?.id || 1),
      name: v.name,
      securityLevel: v.securityLevel || "HIGH",
      maxConcurrentAccess: String(v.maxConcurrentAccess || 2),
      isLocked: v.isLocked !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        vaultCode: formData.vaultCode,
        branchId: Number(formData.branchId),
        name: formData.name,
        securityLevel: formData.securityLevel,
        maxConcurrentAccess: Number(formData.maxConcurrentAccess),
        isLocked: formData.isLocked,
      };

      if (editingVault) {
        await vaultApi.update(editingVault.id, payload);
        setSuccess(`Vault ${formData.vaultCode} updated successfully.`);
      } else {
        await vaultApi.create(payload);
        setSuccess(`Vault ${formData.vaultCode} provisioned successfully.`);
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save vault.");
    }
  };

  const handleDelete = async (id, code) => {
    if (confirm(`Are you sure you want to decommission Vault ${code}?`)) {
      try {
        await vaultApi.remove(id);
        setSuccess(`Vault ${code} removed.`);
        await loadData();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete vault.");
      }
    }
  };

  const filteredVaults = vaults.filter((v) => {
    const matchesSearch =
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.vaultCode?.toLowerCase().includes(search.toLowerCase());
    const matchesBranch =
      selectedBranch === "ALL" ||
      String(v.branchId || v.branch?.id) === String(selectedBranch);
    return matchesSearch && matchesBranch;
  });

  const totalVaults = vaults.length;
  const lockedVaults = vaults.filter((v) => v.isLocked).length;
  const activeSessions = totalVaults - lockedVaults;

  return (
    <div className="sv-page-container">
      {/* Top Header */}
      <div className="sv-page-header">
        <div>
          <h1 className="sv-page-title">Vault Infrastructure Management</h1>
          <p className="sv-page-subtitle">
            Monitored high-security depository units wired to live Spring Boot endpoint <code>/api/v1/vaults</code>
          </p>
        </div>

        <div className="sv-header-actions">
          <button className="sv-btn sv-btn-secondary" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Sync</span>
          </button>
          <button className="sv-btn sv-btn-primary" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            <span>Add Vault</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="sv-stat-cards">
        <div className="sv-stat-card">
          <span className="sv-stat-label">Total Vaults</span>
          <div className="sv-stat-val text-cyan-400">{totalVaults}</div>
          <span className="sv-stat-desc">Provisioned physical enclosures</span>
        </div>

        <div className="sv-stat-card">
          <span className="sv-stat-label">Locked & Secured</span>
          <div className="sv-stat-val text-emerald-400">{lockedVaults}</div>
          <span className="sv-stat-desc">Zero unauthorized breach</span>
        </div>

        <div className="sv-stat-card">
          <span className="sv-stat-label">Active Open Sessions</span>
          <div className="sv-stat-val text-amber-400">{activeSessions}</div>
          <span className="sv-stat-desc">Authorized physical ingress</span>
        </div>

        <div className="sv-stat-card">
          <span className="sv-stat-label">Branches Covered</span>
          <div className="sv-stat-val text-indigo-400">{branches.length}</div>
          <span className="sv-stat-desc">Jurisdictional coverage</span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="sv-alert sv-alert-error">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="sv-alert-content">{error}</div>
        </div>
      )}

      {success && (
        <div className="sv-alert sv-alert-success">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <div className="sv-alert-content">{success}</div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="sv-card mb-6">
        <div className="sv-filter-bar">
          <div className="sv-search-box">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="sv-search-input"
              placeholder="Search by vault code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sv-filter-group">
            <label className="sv-filter-label">Filter Branch:</label>
            <select
              className="sv-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="ALL">All Branches ({branches.length})</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.branchCode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vaults Grid */}
      {loading ? (
        <div className="sv-loading-state">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
          <span>Connecting to Vault Endpoints...</span>
        </div>
      ) : filteredVaults.length === 0 ? (
        <div className="sv-empty-state">
          <Shield className="w-12 h-12 text-slate-500 mb-3" />
          <h4>No Vaults Found</h4>
          <p>No vaults match the search criteria or none are provisioned yet.</p>
          <button className="sv-btn sv-btn-primary mt-4" onClick={openCreateModal}>
            Create First Vault
          </button>
        </div>
      ) : (
        <div className="sv-vaults-grid">
          {filteredVaults.map((v) => {
            const branch = branches.find(
              (b) => Number(b.id) === Number(v.branchId || v.branch?.id)
            );
            return (
              <div key={v.id} className="sv-vault-card">
                <div className="sv-vault-card-header">
                  <div className="sv-vault-code-tag font-mono">{v.vaultCode}</div>
                  <span
                    className={`sv-lock-pill ${v.isLocked ? "locked" : "unlocked"}`}
                  >
                    {v.isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 mr-1" />
                        LOCKED
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 mr-1" />
                        UNLOCKED
                      </>
                    )}
                  </span>
                </div>

                <div className="sv-vault-card-body">
                  <h3 className="sv-vault-name">{v.name}</h3>

                  <div className="sv-vault-details">
                    <div className="sv-vault-detail-item">
                      <Building2 className="w-4 h-4 text-cyan-400 mr-2" />
                      <span>{branch?.name || `Branch #${v.branchId || 1}`}</span>
                    </div>

                    <div className="sv-vault-detail-item">
                      <Shield className="w-4 h-4 text-indigo-400 mr-2" />
                      <span>
                        Security Level:{" "}
                        <b
                          className={
                            v.securityLevel === "CRITICAL"
                              ? "text-rose-400"
                              : "text-amber-400"
                          }
                        >
                          {v.securityLevel || "HIGH"}
                        </b>
                      </span>
                    </div>

                    <div className="sv-vault-detail-item">
                      <Users className="w-4 h-4 text-emerald-400 mr-2" />
                      <span>
                        Max Concurrent Ingress: <b>{v.maxConcurrentAccess || 2} Officers</b>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sv-vault-card-footer">
                  <button
                    className="sv-btn sv-btn-primary sv-btn-sm flex-1"
                    onClick={() => navigate("/requests")}
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                    Request Access
                  </button>

                  <button
                    className="sv-icon-btn"
                    title="Edit Vault"
                    onClick={() => openEditModal(v)}
                  >
                    <Edit3 className="w-4 h-4 text-slate-300" />
                  </button>

                  <button
                    className="sv-icon-btn sv-icon-btn-danger"
                    title="Decommission Vault"
                    onClick={() => handleDelete(v.id, v.vaultCode)}
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Vault Modal */}
      {showModal && (
        <div className="sv-modal-overlay">
          <div className="sv-modal-card">
            <div className="sv-modal-header">
              <h3 className="sv-modal-title">
                {editingVault ? `Edit Vault: ${editingVault.vaultCode}` : "Provision New Vault"}
              </h3>
              <button className="sv-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="sv-modal-body">
                <div className="sv-form-group">
                  <label className="sv-label">Vault Code</label>
                  <input
                    type="text"
                    className="sv-input font-mono uppercase"
                    value={formData.vaultCode}
                    onChange={(e) => setFormData({ ...formData, vaultCode: e.target.value })}
                    required
                  />
                </div>

                <div className="sv-form-group">
                  <label className="sv-label">Vault Name</label>
                  <input
                    type="text"
                    className="sv-input"
                    placeholder="e.g. High Value Bullion Vault A1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="sv-form-group">
                  <label className="sv-label">Branch Jurisdiction</label>
                  <select
                    className="sv-input"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    required
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.branchCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sv-form-row">
                  <div className="sv-form-group flex-1">
                    <label className="sv-label">Security Classification</label>
                    <select
                      className="sv-input"
                      value={formData.securityLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, securityLevel: e.target.value })
                      }
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="STANDARD">STANDARD</option>
                    </select>
                  </div>

                  <div className="sv-form-group flex-1">
                    <label className="sv-label">Max Concurrent Access</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="sv-input"
                      value={formData.maxConcurrentAccess}
                      onChange={(e) =>
                        setFormData({ ...formData, maxConcurrentAccess: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="sv-form-group">
                  <label className="sv-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isLocked}
                      onChange={(e) =>
                        setFormData({ ...formData, isLocked: e.target.checked })
                      }
                    />
                    <span>Vault is physically locked and armed</span>
                  </label>
                </div>
              </div>

              <div className="sv-modal-footer">
                <button
                  type="button"
                  className="sv-btn sv-btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="sv-btn sv-btn-primary">
                  {editingVault ? "Update Vault" : "Create Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}