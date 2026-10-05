import { useState, useEffect } from "react";
import { employeeApi, branchApi } from "../api/services";
import {
  Users,
  Plus,
  RefreshCw,
  Search,
  Building2,
  Mail,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Trash2,
  Key,
} from "lucide-react";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    employeeCode: "",
    username: "",
    password: "",
    fullName: "",
    email: "",
    role: "OFFICER",
    branchId: "1",
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [empRes, brRes] = await Promise.all([
        employeeApi.list(),
        branchApi.list(),
      ]);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
      setBranches(Array.isArray(brRes.data) ? brRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load employees from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingEmp(null);
    setFormData({
      employeeCode: `EMP-0${Math.floor(Math.random() * 900 + 100)}`,
      username: "",
      password: "password123",
      fullName: "",
      email: "",
      role: "OFFICER",
      branchId: branches[0]?.id ? String(branches[0].id) : "1",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    setFormData({
      employeeCode: emp.employeeCode,
      username: emp.username,
      password: "",
      fullName: emp.fullName,
      email: emp.email,
      role: emp.role,
      branchId: String(emp.branchId || emp.branch?.id || 1),
      isActive: emp.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        employeeCode: formData.employeeCode,
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        branchId: Number(formData.branchId),
        isActive: formData.isActive,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingEmp) {
        await employeeApi.update(editingEmp.id, payload);
        setSuccess(`Employee ${formData.username} updated successfully.`);
      } else {
        await employeeApi.create(payload);
        setSuccess(`Employee ${formData.username} registered successfully.`);
      }

      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save employee.");
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to deactivate employee ${name}?`)) {
      try {
        await employeeApi.remove(id);
        setSuccess(`Employee ${name} removed.`);
        await loadData();
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete employee.");
      }
    }
  };

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      e.username?.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode?.toLowerCase().includes(search.toLowerCase()) ||
      e.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || e.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="sv-page-container">
      {/* Header */}
      <div className="sv-page-header">
        <div>
          <h1 className="sv-page-title">Employee Roster & Credentials</h1>
          <p className="sv-page-subtitle">
            Role-based authorization directory wired to live Spring Boot endpoint <code>/api/v1/employees</code>
          </p>
        </div>

        <div className="sv-header-actions">
          <button className="sv-btn sv-btn-secondary" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Sync</span>
          </button>
          <button className="sv-btn sv-btn-primary" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            <span>Enroll Employee</span>
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

      {/* Search and Role Filter Bar */}
      <div className="sv-card mb-6">
        <div className="sv-filter-bar">
          <div className="sv-search-box">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="sv-search-input"
              placeholder="Search by name, username, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sv-filter-group">
            <label className="sv-filter-label">Filter Role:</label>
            <select
              className="sv-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles ({employees.length})</option>
              <option value="OFFICER">OFFICER</option>
              <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
              <option value="AUDITOR">AUDITOR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="sv-card">
        {loading ? (
          <div className="sv-loading-state">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
            <span>Connecting to Employee Controller...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="sv-empty-state">
            <Users className="w-12 h-12 text-slate-500 mb-3" />
            <h4>No Employees Found</h4>
            <p>No employee records matched your filter.</p>
          </div>
        ) : (
          <div className="sv-table-responsive">
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Full Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Branch</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const branch = branches.find(
                    (b) => Number(b.id) === Number(emp.branchId || emp.branch?.id)
                  );
                  return (
                    <tr key={emp.id}>
                      <td className="font-mono text-cyan-400 font-semibold">{emp.employeeCode}</td>
                      <td>
                        <b>{emp.fullName}</b>
                      </td>
                      <td className="font-mono text-slate-300">@{emp.username}</td>
                      <td>
                        <span className={`sv-role-badge sv-role-${emp.role?.toLowerCase()}`}>
                          {emp.role}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center text-xs text-slate-300">
                          <Building2 className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                          <span>{branch?.name || `Branch #${emp.branchId || 1}`}</span>
                        </div>
                      </td>
                      <td className="text-xs text-slate-400">{emp.email}</td>
                      <td>
                        <span
                          className={`sv-status-chip ${emp.isActive !== false ? "active" : "inactive"}`}
                        >
                          {emp.isActive !== false ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td>
                        <div className="sv-actions-row">
                          <button
                            className="sv-icon-btn"
                            title="Edit Employee"
                            onClick={() => openEditModal(emp)}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-300" />
                          </button>
                          <button
                            className="sv-icon-btn sv-icon-btn-danger"
                            title="Deactivate"
                            onClick={() => handleDelete(emp.id, emp.fullName)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="sv-modal-overlay">
          <div className="sv-modal-card">
            <div className="sv-modal-header">
              <h3 className="sv-modal-title">
                {editingEmp ? `Edit Employee ${editingEmp.username}` : "Enroll New Employee"}
              </h3>
              <button className="sv-modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="sv-modal-body">
                <div className="sv-form-row">
                  <div className="sv-form-group flex-1">
                    <label className="sv-label">Employee Code</label>
                    <input
                      type="text"
                      className="sv-input font-mono"
                      value={formData.employeeCode}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeCode: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="sv-form-group flex-1">
                    <label className="sv-label">Username</label>
                    <input
                      type="text"
                      className="sv-input"
                      placeholder="e.g. johndoe"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="sv-form-group">
                  <label className="sv-label">Full Name</label>
                  <input
                    type="text"
                    className="sv-input"
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="sv-form-group">
                  <label className="sv-label">Email Address</label>
                  <input
                    type="email"
                    className="sv-input"
                    placeholder="user@securevault.internal"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="sv-form-row">
                  <div className="sv-form-group flex-1">
                    <label className="sv-label">System Role</label>
                    <select
                      className="sv-input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="OFFICER">OFFICER</option>
                      <option value="BRANCH_MANAGER">BRANCH_MANAGER</option>
                      <option value="AUDITOR">AUDITOR</option>
                    </select>
                  </div>

                  <div className="sv-form-group flex-1">
                    <label className="sv-label">Assigned Branch</label>
                    <select
                      className="sv-input"
                      value={formData.branchId}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sv-form-group">
                  <label className="sv-label">
                    Password {editingEmp && <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>}
                  </label>
                  <input
                    type="password"
                    className="sv-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingEmp}
                  />
                </div>

                <div className="sv-form-group">
                  <label className="sv-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                    <span>Active access authorization</span>
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
                  {editingEmp ? "Update Credentials" : "Enroll Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}