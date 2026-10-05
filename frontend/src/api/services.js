import api, { callApi } from "./client";
import { mockEngine } from "./mockEngine";

export const authApi = {
  login: async (username, password) => {
    return callApi(
      () => api.post("/auth/login", { username, password }),
      () => mockEngine.login(username, password),
      "auth/login"
    );
  },
};

export const branchApi = {
  list: async () =>
    callApi(
      () => api.get("/branches"),
      () => mockEngine.getBranches(),
      "branches"
    ),
  get: async (id) =>
    callApi(
      () => api.get(`/branches/${id}`),
      () => mockEngine.getBranchById(id),
      `branches/${id}`
    ),
  create: async (data) =>
    callApi(
      () => api.post("/branches", data),
      () => mockEngine.createBranch(data),
      "branches POST"
    ),
  update: async (id, data) =>
    callApi(
      () => api.put(`/branches/${id}`, data),
      () => mockEngine.updateBranch(id, data),
      `branches/${id} PUT`
    ),
  remove: async (id) =>
    callApi(
      () => api.delete(`/branches/${id}`),
      () => mockEngine.deleteBranch(id),
      `branches/${id} DELETE`
    ),
};

export const employeeApi = {
  list: async () =>
    callApi(
      () => api.get("/employees"),
      () => mockEngine.getEmployees(),
      "employees"
    ),
  get: async (id) =>
    callApi(
      () => api.get(`/employees/${id}`),
      () => mockEngine.getEmployeeById(id),
      `employees/${id}`
    ),
  create: async (data) =>
    callApi(
      () => api.post("/employees", data),
      () => mockEngine.createEmployee(data),
      "employees POST"
    ),
  update: async (id, data) =>
    callApi(
      () => api.put(`/employees/${id}`, data),
      () => mockEngine.updateEmployee(id, data),
      `employees/${id} PUT`
    ),
  remove: async (id) =>
    callApi(
      () => api.delete(`/employees/${id}`),
      () => mockEngine.deleteEmployee(id),
      `employees/${id} DELETE`
    ),
};

export const vaultApi = {
  list: async () =>
    callApi(
      () => api.get("/vaults"),
      () => mockEngine.getVaults(),
      "vaults"
    ),
  get: async (id) =>
    callApi(
      () => api.get(`/vaults/${id}`),
      () => mockEngine.getVaultById(id),
      `vaults/${id}`
    ),
  create: async (data) =>
    callApi(
      () => api.post("/vaults", data),
      () => mockEngine.createVault(data),
      "vaults POST"
    ),
  update: async (id, data) =>
    callApi(
      () => api.put(`/vaults/${id}`, data),
      () => mockEngine.updateVault(id, data),
      `vaults/${id} PUT`
    ),
  remove: async (id) =>
    callApi(
      () => api.delete(`/vaults/${id}`),
      () => mockEngine.deleteVault(id),
      `vaults/${id} DELETE`
    ),
  open: async (vaultId, authCode, employeeId) =>
    callApi(
      () => api.post(`/vaults/${vaultId}/open`, { authorizationCode: authCode }),
      () => mockEngine.executeVaultAccess(vaultId, authCode, employeeId),
      `vaults/${vaultId}/open`
    ),
  lock: async (vaultId, employeeId) =>
    callApi(
      () => api.post(`/vaults/${vaultId}/lock`, {}),
      () => mockEngine.lockVault(vaultId, employeeId),
      `vaults/${vaultId}/lock`
    ),
};

export const requestApi = {
  list: async () =>
    callApi(
      () => api.get("/vault-requests"),
      () => mockEngine.getAllRequests(),
      "vault-requests"
    ),
  pending: async () =>
    callApi(
      () => api.get("/vault-requests/pending"),
      () => mockEngine.getPendingRequests(),
      "vault-requests/pending"
    ),
  create: async (data) =>
    callApi(
      () => api.post("/vault-requests", data),
      () => mockEngine.createVaultRequest(data),
      "vault-requests POST"
    ),
  approval: async (id, data) =>
    callApi(
      () => api.post(`/vault-requests/${id}/approval`, data),
      () => mockEngine.approveOrRejectRequest(id, data),
      `vault-requests/${id}/approval`
    ),
  execute: async (requestId, authCode, employeeId) =>
    callApi(
      () => api.post(`/vault-requests/${requestId}/execute`, { authorizationCode: authCode }),
      () => mockEngine.executeVaultAccess(requestId, authCode, employeeId),
      `vault-requests/${requestId}/execute`
    ),
};

export const auditApi = {
  verify: async () =>
    callApi(
      () => api.get("/audit/verify"),
      () => mockEngine.verifyAuditChain(),
      "audit/verify"
    ),
  logs: async () =>
    callApi(
      () => api.get("/audit/logs"),
      () => mockEngine.getAuditLogs(),
      "audit/logs"
    ),
  simulateTamper: async (id) => mockEngine.simulateTamper(id),
  reset: async () => mockEngine.reset(),
};
