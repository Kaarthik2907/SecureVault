import { useState, useEffect } from "react";
import { branchApi } from "../api/services";
import {
  Building2,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Trash2,
} from "lucide-react";

export default function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [formData, setFormData] = useState({
    branchCode: "",
    name: "",
    city: "",
    address: "",
    contactNumber: "",
    isActive: true,
  });

  const loadBranches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await branchApi.list();
      setBranches(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load branches from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({
      branchCode: `BR-HUB-${Math.floor(Math.random() * 900 + 100)}`,
      name: "",
      city: "",
      address: "",
      contactNumber: "+91-22-",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (b) => {
    setEditingBranch(b);
    setFormData({
      branchCode: b.branchCode,
      name: b.name,
      city: b.city,
      address: b.address,
      contactNumber: b.contactNumber,
      isActive: b.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingBranch) {
        await branchApi.update(editingBranch.id, formData);
        setSuccess(`Branch ${formData.branchCode} updated successfully.`);
      } else {
        await branchApi.create(formData);
        setSuccess(`Branch ${formData.branchCode} established successfully.`);
      }

      setShowModal(false);
      await loadBranches();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save branch.");
    }
  };

  const handleDelete = async (id, code) => {
    if (confirm(`Are you sure you want to deactivate Branch ${code}?`)) {
      try {
        await branchApi.remove(id);
        setSuccess(`Branch ${code} removed.`);
        await loadBranches();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete branch.");
      }
    }
  };

  const filtered = branches.filter(
    (b) =>
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.branchCode?.toLowerCase().includes(search.toLowerCase()) ||
      b.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sv-page-container">
      {/* Page Header */}
      <div className="sv-page-header">
        <div>
          <h1 className="sv-page-title">Branch Network Management</h1>
          <p className="sv-page-subtitle">
            Secure banking centers wired to live Spring Boot endpoint <code>/api/v1/branches</code>
          </p>
        </div>

        <div className="sv-header-actions">
          <button className="sv-btn sv-btn-secondary" onClick={loadBranches}>
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Sync</span>
          </button>
          <button className="sv-btn sv-btn-primary" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            <span>Establish Branch</span>
          </button>
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

      {/* Search & Filter */}
      <div className="sv-card mb-6">
        <div className="sv-search-box">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="sv-search-input"
            placeholder="Search branches by code, name, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Branch Grid */}
      {loading ? (
        <div className="sv-loading-state">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
          <span>Connecting to Branch Controller...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="sv-empty-state">
          <Building2 className="w-12 h-12 text-slate-500 mb-3" />
          <h4>No Branches Found</h4>
          <p>No branch records match your filter criteria.</p>
        </div>
      ) : (
        <div className="sv-branches-grid">
          {filtered.map((b) => (
            <div key={b.id} className="sv-branch-card">
              <div className="sv-branch-card-header">
                <div className="sv-branch-code-badge font-mono">{b.branchCode}</div>
                <span className={`sv-status-chip ${b.isActive !== false ? "active" : "inactive"}`}>
                  {b.isActive !== false ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div className="sv-branch-card-body">
                <h3 className="sv-branch-name">{b.name}</h3>

                <div className="sv-branch-info-list">
                  <div className="sv-branch-info-item">
                    <MapPin className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
                    <span>{b.city} — {b.address}</span>
                  </div>

                  <div className="sv-branch-info-item">
                    <Phone className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                    <span className="font-mono">{b.contactNumber}</span>
                  </div>
                </div>
              </div>

              <div className="sv-branch-card-footer">
                <span className="text-xs text-slate-500">ID #{b.id}</span>
                <div className="sv-actions-row">
                  <button
                    className="sv-icon-btn"
                    title="Edit Branch"
                    onClick={() => openEditModal(b)}
                  >
                    <Edit3 className="w-4 h-4 text-slate-300" />
                  </button>
                  <button
                    className="sv-icon-btn sv-icon-btn-danger"
                    title="Delete Branch"
                    onClick={() => handleDelete(b.id, b.branchCode)}
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="sv-modal-overlay">
          <div className="sv-modal-card">
            <div className="sv-modal-header">
              <h3 className="sv-modal-title">
                {editingBranch ? `Edit Branch ${editingBranch.branchCode}` : "Establish New Branch"}
              </h3>
              <button className="sv-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="sv-modal-body">
                <div className="sv-form-group">
                  <label className="sv-label">Branch Code</label>
                  <input
                    type="text"
                    className="sv-input font-mono"
                    value={formData.branchCode}
                    onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                    required
                  />
                </div>

                <div className="sv-form-group">
                  <label className="sv-label">Branch Name</label>
                  <input
                    type="text"
                    className="sv-input"
                    placeholder="e.g. Mumbai Financial Hub Branch"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="sv-form-row">
                  <div className="sv-form-group flex-1">
                    <label className="sv-label">City</label>
                    <input
                      type="text"
                      className="sv-input"
                      placeholder="e.g. Mumbai"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>

                  <div className="sv-form-group flex-1">
                    <label className="sv-label">Contact Number</label>
                    <input
                      type="text"
                      className="sv-input font-mono"
                      placeholder="+91-22-67890123"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="sv-form-group">
                  <label className="sv-label">Physical Address</label>
                  <textarea
                    className="sv-input"
                    rows="2"
                    placeholder="Full street address..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="sv-form-group">
                  <label className="sv-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>Branch is actively operational</span>
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
                  {editingBranch ? "Update Branch" : "Establish Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}