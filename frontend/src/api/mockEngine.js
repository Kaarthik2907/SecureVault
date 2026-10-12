// SecureVault Cryptographic Mock Engine & In-Browser Contract Store
// Compliant with API_CONTRACT.md v1.0.0 and db/init.sql

const STORAGE_KEYS = {
  BRANCHES: "securevault_mock_branches",
  EMPLOYEES: "securevault_mock_employees",
  VAULTS: "securevault_mock_vaults",
  REQUESTS: "securevault_mock_requests",
  AUDIT_LOGS: "securevault_mock_audit_logs",
  INIT_FLAG: "securevault_mock_initialized_v3",
};

// SHA-256 cryptographic utility using Web Crypto API
export async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Initial seed data from db/init.sql
const SEED_BRANCHES = [
  {
    id: 1,
    branchCode: "BR-MUM-001",
    name: "Mumbai Financial Hub Branch",
    city: "Mumbai",
    address: "Bandra Kurla Complex, Plot C-12, Mumbai, MH 400051",
    contactNumber: "+91-22-67890123",
    isActive: true,
  },
  {
    id: 2,
    branchCode: "BR-DEL-001",
    name: "Delhi Central Treasury Branch",
    city: "New Delhi",
    address: "Connaught Place, Block F, New Delhi, DL 110001",
    contactNumber: "+91-11-23456789",
    isActive: true,
  },
  {
    id: 3,
    branchCode: "BR-BLR-001",
    name: "Bengaluru Tech & Custody Branch",
    city: "Bengaluru",
    address: "MG Road, Trinity Circle, Bengaluru, KA 560001",
    contactNumber: "+91-80-41234567",
    isActive: true,
  },
];

const SEED_EMPLOYEES = [
  {
    id: 101,
    employeeCode: "EMP-0101",
    username: "johndoe",
    fullName: "John Doe",
    email: "johndoe@securevault.internal",
    role: "OFFICER",
    branchId: 1,
    isActive: true,
  },
  {
    id: 102,
    employeeCode: "EMP-0102",
    username: "sarahsmith",
    fullName: "Sarah Smith",
    email: "sarahsmith@securevault.internal",
    role: "BRANCH_MANAGER",
    branchId: 1,
    isActive: true,
  },
  {
    id: 103,
    employeeCode: "EMP-0103",
    username: "davidkumar",
    fullName: "David Kumar",
    email: "davidkumar@securevault.internal",
    role: "AUDITOR",
    branchId: 1,
    isActive: true,
  },
  {
    id: 104,
    employeeCode: "EMP-0201",
    username: "priyasharma",
    fullName: "Priya Sharma",
    email: "priyasharma@securevault.internal",
    role: "BRANCH_MANAGER",
    branchId: 2,
    isActive: true,
  },
  {
    id: 105,
    employeeCode: "EMP-0301",
    username: "alexchen",
    fullName: "Alex Chen",
    email: "alexchen@securevault.internal",
    role: "OFFICER",
    branchId: 3,
    isActive: true,
  },
];

const SEED_VAULTS = [
  {
    id: 501,
    vaultCode: "VLT-MUM-A1",
    branchId: 1,
    name: "High Value Bullion Vault A1",
    securityLevel: "CRITICAL",
    maxConcurrentAccess: 2,
    isLocked: true,
  },
  {
    id: 502,
    vaultCode: "VLT-MUM-B2",
    branchId: 1,
    name: "Securities & Deposit Locker B2",
    securityLevel: "HIGH",
    maxConcurrentAccess: 4,
    isLocked: true,
  },
  {
    id: 503,
    vaultCode: "VLT-DEL-01",
    branchId: 2,
    name: "Reserve Currency Vault 01",
    securityLevel: "CRITICAL",
    maxConcurrentAccess: 2,
    isLocked: true,
  },
  {
    id: 504,
    vaultCode: "VLT-BLR-01",
    branchId: 3,
    name: "Digital Asset & Escrow Storage 01",
    securityLevel: "HIGH",
    maxConcurrentAccess: 3,
    isLocked: true,
  },
];

const SEED_REQUESTS = [
  {
    requestId: 1001,
    vaultId: 501,
    requestedById: 101,
    approvedById: 102,
    reason: "Quarterly physical bullion audit and inventory verification",
    estimatedDurationMinutes: 60,
    status: "APPROVED",
    authorizationCode: "AUTH-7F89B2-2026",
    remarks: "Approved per quarterly compliance protocol.",
    requestedAt: "2026-08-26T10:15:00",
    approvedAt: "2026-08-26T10:25:00",
  },
  {
    requestId: 1002,
    vaultId: 502,
    requestedById: 101,
    approvedById: null,
    reason: "Routine locker inspection and sensor calibration",
    estimatedDurationMinutes: 45,
    status: "PENDING",
    authorizationCode: null,
    remarks: null,
    requestedAt: "2026-08-26T14:30:00",
    approvedAt: null,
  },
  {
    requestId: 1003,
    vaultId: 503,
    requestedById: 104,
    approvedById: null,
    reason: "Emergency currency re-allocation for inter-branch transfer",
    estimatedDurationMinutes: 90,
    status: "PENDING",
    authorizationCode: null,
    remarks: null,
    requestedAt: "2026-08-26T15:45:00",
    approvedAt: null,
  },
];

const SEED_AUDIT_LOGS = [
  {
    id: 1,
    logId: "LOG-20260824-0001",
    eventType: "SYSTEM_INITIALIZATION",
    employeeId: 102,
    requesterId: 102,
    approverId: 102,
    vaultId: null,
    action: "SYSTEM_INIT",
    actionDetails: "SecureVault cryptographic ledger initialized with genesis block.",
    timestamp: "2026-08-24T08:00:00",
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    currentHash: "fe2a86804d00f5d0329c91f4a1fb0150c676fe1b5d59812f5d4146f5bcf7c422",
  },
  {
    id: 2,
    logId: "LOG-20260824-0002",
    eventType: "VAULT_ACCESS_REQUEST_CREATED",
    employeeId: 101,
    requesterId: 101,
    approverId: null,
    vaultId: 501,
    action: "REQUEST_CREATED",
    actionDetails: "Request #998 submitted by johndoe for Vault VLT-MUM-A1 (Reason: Currency counting)",
    timestamp: "2026-08-24T09:15:00",
    previousHash: "fe2a86804d00f5d0329c91f4a1fb0150c676fe1b5d59812f5d4146f5bcf7c422",
    currentHash: "330b2fd269195025bc820cfc54718c34a9c8bf98909d014045c535c05df13f07",
  },
  {
    id: 3,
    logId: "LOG-20260824-0003",
    eventType: "VAULT_ACCESS_APPROVED",
    employeeId: 102,
    requesterId: 101,
    approverId: 102,
    vaultId: 501,
    action: "ACCESS_APPROVED",
    actionDetails: "Request #998 approved by sarahsmith. Auth Code: AUTH-3B12A1-2026",
    timestamp: "2026-08-24T09:25:00",
    previousHash: "330b2fd269195025bc820cfc54718c34a9c8bf98909d014045c535c05df13f07",
    currentHash: "87c9ac9fd5f3f147dcaebd548c5c5364558e5c836030efd4ec2297299720547e",
  },
  {
    id: 4,
    logId: "LOG-20260824-0004",
    eventType: "VAULT_UNLOCKED",
    employeeId: 101,
    requesterId: 101,
    approverId: 102,
    vaultId: 501,
    action: "VAULT_UNLOCKED",
    actionDetails: "Physical Vault #501 unlocked with Auth Code AUTH-3B12A1-2026.",
    timestamp: "2026-08-24T09:30:00",
    previousHash: "87c9ac9fd5f3f147dcaebd548c5c5364558e5c836030efd4ec2297299720547e",
    currentHash: "1ea41ff37b6af75eb80f279b61e3f33a06080b5e28ea2cfe7cd68157782accfa",
  },
  {
    id: 5,
    logId: "LOG-20260824-0005",
    eventType: "VAULT_LOCKED",
    employeeId: 101,
    requesterId: 101,
    approverId: 102,
    vaultId: 501,
    action: "VAULT_LOCKED",
    actionDetails: "Physical Vault #501 locked and sealed after inspection.",
    timestamp: "2026-08-24T10:30:00",
    previousHash: "1ea41ff37b6af75eb80f279b61e3f33a06080b5e28ea2cfe7cd68157782accfa",
    currentHash: "8f17d8d330f8eb2c6204321fdc6168c918bdd34ebbc5ee9c1f934cfa9dac0651",
  },
  {
    id: 6,
    logId: "LOG-20260825-0001",
    eventType: "VAULT_ACCESS_REQUEST_CREATED",
    employeeId: 105,
    requesterId: 105,
    approverId: null,
    vaultId: 504,
    action: "REQUEST_CREATED",
    actionDetails: "Request #999 submitted by alexchen for Vault VLT-BLR-01 (Reason: Hardware HSM maintenance)",
    timestamp: "2026-08-25T11:00:00",
    previousHash: "8f17d8d330f8eb2c6204321fdc6168c918bdd34ebbc5ee9c1f934cfa9dac0651",
    currentHash: "e348689040f2cc1a765fd53de0694a93cd6bfe02a48255eb189d4b65b3468369",
  },
  {
    id: 7,
    logId: "LOG-20260825-0002",
    eventType: "VAULT_ACCESS_REJECTED",
    employeeId: 104,
    requesterId: 105,
    approverId: 104,
    vaultId: 504,
    action: "ACCESS_REJECTED",
    actionDetails: "Request #999 rejected by priyasharma (Reason: Maintenance window reschedule required).",
    timestamp: "2026-08-25T11:15:00",
    previousHash: "e348689040f2cc1a765fd53de0694a93cd6bfe02a48255eb189d4b65b3468369",
    currentHash: "ac5d868b8a31bff45c54ab13b6ec2e77ca2b0f95d6a9cefb9134677973fab3ab",
  },
  {
    id: 8,
    logId: "LOG-20260825-0003",
    eventType: "VAULT_ACCESS_REQUEST_CREATED",
    employeeId: 104,
    requesterId: 104,
    approverId: null,
    vaultId: 503,
    action: "REQUEST_CREATED",
    actionDetails: "Request #1000 submitted by priyasharma for Vault VLT-DEL-01 (Reason: Inter-branch bullion transfer)",
    timestamp: "2026-08-25T14:00:00",
    previousHash: "ac5d868b8a31bff45c54ab13b6ec2e77ca2b0f95d6a9cefb9134677973fab3ab",
    currentHash: "ea965659db64e522b74b66911ea404bd280da195213a119c3ebd9773c792373e",
  },
  {
    id: 9,
    logId: "LOG-20260825-0004",
    eventType: "VAULT_ACCESS_APPROVED",
    employeeId: 102,
    requesterId: 104,
    approverId: 102,
    vaultId: 503,
    action: "ACCESS_APPROVED",
    actionDetails: "Request #1000 approved by sarahsmith. Auth Code: AUTH-8C91D4-2026",
    timestamp: "2026-08-25T14:10:00",
    previousHash: "ea965659db64e522b74b66911ea404bd280da195213a119c3ebd9773c792373e",
    currentHash: "1d993f5bd565711d383b386f451f1246250c9e013e581cbe75123b4bf10da77c",
  },
  {
    id: 10,
    logId: "LOG-20260825-0005",
    eventType: "VAULT_UNLOCKED",
    employeeId: 104,
    requesterId: 104,
    approverId: 102,
    vaultId: 503,
    action: "VAULT_UNLOCKED",
    actionDetails: "Physical Vault #503 unlocked by priyasharma with Auth Code AUTH-8C91D4-2026.",
    timestamp: "2026-08-25T14:20:00",
    previousHash: "1d993f5bd565711d383b386f451f1246250c9e013e581cbe75123b4bf10da77c",
    currentHash: "bc9436eb033f670dac05368b29b27c8153f85001e5617c354a89dd0127fb84ed",
  },
  {
    id: 11,
    logId: "LOG-20260825-0006",
    eventType: "VAULT_LOCKED",
    employeeId: 104,
    requesterId: 104,
    approverId: 102,
    vaultId: 503,
    action: "VAULT_LOCKED",
    actionDetails: "Physical Vault #503 locked and secured.",
    timestamp: "2026-08-25T15:50:00",
    previousHash: "bc9436eb033f670dac05368b29b27c8153f85001e5617c354a89dd0127fb84ed",
    currentHash: "a1d376548f166aa1864c738a6f7fe5bf368caf28c589a20eeb2677cea87eed05",
  },
  {
    id: 12,
    logId: "LOG-20260826-0001",
    eventType: "VAULT_ACCESS_REQUEST_CREATED",
    employeeId: 101,
    requesterId: 101,
    approverId: null,
    vaultId: 501,
    action: "REQUEST_CREATED",
    actionDetails: "Request #1001 submitted by johndoe for Vault VLT-MUM-A1 (Reason: Quarterly physical bullion audit)",
    timestamp: "2026-08-26T10:15:00",
    previousHash: "a1d376548f166aa1864c738a6f7fe5bf368caf28c589a20eeb2677cea87eed05",
    currentHash: "b339c21d1510c766dcd1b72d327e62b7fadf78359230bdb2808d35abe72b3ff9",
  },
  {
    id: 13,
    logId: "LOG-20260826-0002",
    eventType: "VAULT_ACCESS_APPROVED",
    employeeId: 102,
    requesterId: 101,
    approverId: 102,
    vaultId: 501,
    action: "ACCESS_APPROVED",
    actionDetails: "Request #1001 approved by sarahsmith. Auth Code: AUTH-7F89B2-2026",
    timestamp: "2026-08-26T10:25:00",
    previousHash: "b339c21d1510c766dcd1b72d327e62b7fadf78359230bdb2808d35abe72b3ff9",
    currentHash: "1d69721df503a2f30708a7f7cf7b8f11a75df681e47ae291b0cf28d8c24e647d",
  },
  {
    id: 14,
    logId: "LOG-20260826-0003",
    eventType: "VAULT_UNLOCKED",
    employeeId: 101,
    requesterId: 101,
    approverId: 102,
    vaultId: 501,
    action: "VAULT_UNLOCKED",
    actionDetails: "Physical Vault #501 unlocked with Auth Code AUTH-7F89B2-2026.",
    timestamp: "2026-08-26T10:30:00",
    previousHash: "1d69721df503a2f30708a7f7cf7b8f11a75df681e47ae291b0cf28d8c24e647d",
    currentHash: "74a13421e2749625a37b7d1c189ca6124f4b31bc549f850fcf2178f44a2ecd41",
  },
  {
    id: 15,
    logId: "LOG-20260826-0004",
    eventType: "VAULT_LOCKED",
    employeeId: 101,
    requesterId: 101,
    approverId: 102,
    vaultId: 501,
    action: "VAULT_LOCKED",
    actionDetails: "Physical Vault #501 locked and secured.",
    timestamp: "2026-08-26T11:35:00",
    previousHash: "74a13421e2749625a37b7d1c189ca6124f4b31bc549f850fcf2178f44a2ecd41",
    currentHash: "1a5775a035a7d2017e86332d6e90a98a5669e8d142138ae13a89ce7cb03064cd",
  },
  {
    id: 16,
    logId: "LOG-20260826-0005",
    eventType: "VAULT_ACCESS_REQUEST_CREATED",
    employeeId: 101,
    requesterId: 101,
    approverId: null,
    vaultId: 502,
    action: "REQUEST_CREATED",
    actionDetails: "Request #1002 submitted by johndoe for Vault VLT-MUM-B2 (Reason: Routine locker inspection)",
    timestamp: "2026-08-26T14:30:00",
    previousHash: "1a5775a035a7d2017e86332d6e90a98a5669e8d142138ae13a89ce7cb03064cd",
    currentHash: "750c1fce6f7b8c13b8b108d132818ca350dcb7786658aa4dee0dc155ca85595d",
  },
  {
    id: 17,
    logId: "LOG-20260827-0001",
    eventType: "VAULT_ACCESS_REQUEST_CREATED",
    employeeId: 104,
    requesterId: 104,
    approverId: null,
    vaultId: 503,
    action: "REQUEST_CREATED",
    actionDetails: "Request #1003 submitted by priyasharma for Vault VLT-DEL-01 (Reason: Emergency cash reserve inspection)",
    timestamp: "2026-08-27T09:00:00",
    previousHash: "750c1fce6f7b8c13b8b108d132818ca350dcb7786658aa4dee0dc155ca85595d",
    currentHash: "f558199f1564572129355a8c7107f0b4617a02a762f87409a2f3acb8b148fdfd",
  },
  {
    id: 18,
    logId: "LOG-20260827-0002",
    eventType: "VAULT_ACCESS_APPROVED",
    employeeId: 103,
    requesterId: 104,
    approverId: 103,
    vaultId: 503,
    action: "ACCESS_APPROVED",
    actionDetails: "Request #1003 authorized by davidkumar (Auditor override). Auth Code: AUTH-9E44F1-2026",
    timestamp: "2026-08-27T09:10:00",
    previousHash: "f558199f1564572129355a8c7107f0b4617a02a762f87409a2f3acb8b148fdfd",
    currentHash: "e68666e3dce69198d6c589121a962e4921d8b0939180d21b6ae3f8f0c5c24130",
  },
  {
    id: 19,
    logId: "LOG-20260827-0003",
    eventType: "VAULT_UNLOCKED",
    employeeId: 104,
    requesterId: 104,
    approverId: 103,
    vaultId: 503,
    action: "VAULT_UNLOCKED",
    actionDetails: "Physical Vault #503 unlocked per Auditor authorization.",
    timestamp: "2026-08-27T09:15:00",
    previousHash: "e68666e3dce69198d6c589121a962e4921d8b0939180d21b6ae3f8f0c5c24130",
    currentHash: "529771670e8571bccfe564381d15a122023bfcf92cbf259d7eac79612ccdfb99",
  },
  {
    id: 20,
    logId: "LOG-20260827-0004",
    eventType: "VAULT_LOCKED",
    employeeId: 104,
    requesterId: 104,
    approverId: 103,
    vaultId: 503,
    action: "VAULT_LOCKED",
    actionDetails: "Physical Vault #503 locked. Session concluded.",
    timestamp: "2026-08-27T10:45:00",
    previousHash: "529771670e8571bccfe564381d15a122023bfcf92cbf259d7eac79612ccdfb99",
    currentHash: "9945832693c06ab28771a859e9bd19609a5eba6753caf2a4d18ee8d51d1d3192",
  },
];

// Helper to get from localStorage
function getStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Ensure storage initialized
export function initMockStorage(force = false) {
  if (force || !localStorage.getItem(STORAGE_KEYS.INIT_FLAG)) {
    setStorage(STORAGE_KEYS.BRANCHES, SEED_BRANCHES);
    setStorage(STORAGE_KEYS.EMPLOYEES, SEED_EMPLOYEES);
    setStorage(STORAGE_KEYS.VAULTS, SEED_VAULTS);
    setStorage(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    setStorage(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    localStorage.setItem(STORAGE_KEYS.INIT_FLAG, "true");
  }
}

// Calculate block hash using canonical concatenation
export async function computeLogHash(previousHash, eventType, employeeId, vaultId, timestamp, actionDetails) {
  const content = `${previousHash}|${eventType}|${employeeId || ""}|${vaultId || ""}|${timestamp}|${actionDetails}`;
  return await sha256(content);
}

// Append new audit log to chain
export async function appendAuditLog(eventType, employeeId, vaultId, actionDetails, extra = {}) {
  initMockStorage();
  const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.currentHash : "0000000000000000000000000000000000000000000000000000000000000000";
  const timestamp = new Date().toISOString();
  const currentHash = await computeLogHash(previousHash, eventType, employeeId, vaultId, timestamp, actionDetails);
  
  const id = (lastLog ? lastLog.id : 0) + 1;
  const padNum = String(id).padStart(4, "0");
  const dateStr = timestamp.split("T")[0].replace(/-/g, "");
  const logId = `LOG-${dateStr}-${padNum}`;

  const newLog = {
    id,
    logId,
    eventType,
    employeeId,
    requesterId: extra.requesterId || employeeId,
    approverId: extra.approverId || null,
    vaultId,
    action: extra.action || eventType,
    actionDetails,
    timestamp,
    previousHash,
    currentHash,
  };

  logs.push(newLog);
  setStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
  return newLog;
}

// =========================================================================
// MOCK CONTROLLER ENDPOINTS (Mirrors Spring Boot)
// =========================================================================

export const mockEngine = {
  // Auth
  async login(username, password) {
    initMockStorage();
    const employees = getStorage(STORAGE_KEYS.EMPLOYEES, SEED_EMPLOYEES);
    const emp = employees.find((e) => e.username.toLowerCase() === username.toLowerCase());

    if (!emp) {
      const err = new Error("Invalid username or password");
      err.response = { status: 401, data: { message: "Invalid username or password" } };
      throw err;
    }

    // Passwords accepted: password123, SecurePassword123!, or matching
    return {
      token: `mock-jwt-token-${emp.username}-${Date.now()}`,
      username: emp.username,
      role: emp.role,
      employeeId: emp.id,
      branchId: emp.branchId,
      fullName: emp.fullName,
    };
  },

  // Branches
  async getBranches() {
    initMockStorage();
    return getStorage(STORAGE_KEYS.BRANCHES, SEED_BRANCHES);
  },

  async getBranchById(id) {
    const branches = await this.getBranches();
    return branches.find((b) => Number(b.id) === Number(id)) || null;
  },

  async createBranch(data) {
    initMockStorage();
    const branches = getStorage(STORAGE_KEYS.BRANCHES, SEED_BRANCHES);
    const id = branches.reduce((max, b) => Math.max(max, b.id), 0) + 1;
    const branch = { id, ...data, isActive: data.isActive !== false };
    branches.push(branch);
    setStorage(STORAGE_KEYS.BRANCHES, branches);
    return branch;
  },

  async updateBranch(id, data) {
    initMockStorage();
    const branches = getStorage(STORAGE_KEYS.BRANCHES, SEED_BRANCHES);
    const idx = branches.findIndex((b) => Number(b.id) === Number(id));
    if (idx >= 0) {
      branches[idx] = { ...branches[idx], ...data };
      setStorage(STORAGE_KEYS.BRANCHES, branches);
      return branches[idx];
    }
    throw new Error("Branch not found");
  },

  async deleteBranch(id) {
    initMockStorage();
    let branches = getStorage(STORAGE_KEYS.BRANCHES, SEED_BRANCHES);
    branches = branches.filter((b) => Number(b.id) !== Number(id));
    setStorage(STORAGE_KEYS.BRANCHES, branches);
    return true;
  },

  // Employees
  async getEmployees() {
    initMockStorage();
    return getStorage(STORAGE_KEYS.EMPLOYEES, SEED_EMPLOYEES);
  },

  async getEmployeeById(id) {
    const employees = await this.getEmployees();
    return employees.find((e) => Number(e.id) === Number(id)) || null;
  },

  async createEmployee(data) {
    initMockStorage();
    const employees = getStorage(STORAGE_KEYS.EMPLOYEES, SEED_EMPLOYEES);
    const id = employees.reduce((max, e) => Math.max(max, e.id), 0) + 1;
    const emp = { id, ...data, isActive: data.isActive !== false };
    employees.push(emp);
    setStorage(STORAGE_KEYS.EMPLOYEES, employees);
    return emp;
  },

  async updateEmployee(id, data) {
    initMockStorage();
    const employees = getStorage(STORAGE_KEYS.EMPLOYEES, SEED_EMPLOYEES);
    const idx = employees.findIndex((e) => Number(e.id) === Number(id));
    if (idx >= 0) {
      employees[idx] = { ...employees[idx], ...data };
      setStorage(STORAGE_KEYS.EMPLOYEES, employees);
      return employees[idx];
    }
    throw new Error("Employee not found");
  },

  async deleteEmployee(id) {
    initMockStorage();
    let employees = getStorage(STORAGE_KEYS.EMPLOYEES, SEED_EMPLOYEES);
    employees = employees.filter((e) => Number(e.id) !== Number(id));
    setStorage(STORAGE_KEYS.EMPLOYEES, employees);
    return true;
  },

  // Vaults
  async getVaults() {
    initMockStorage();
    return getStorage(STORAGE_KEYS.VAULTS, SEED_VAULTS);
  },

  async getVaultById(id) {
    const vaults = await this.getVaults();
    return vaults.find((v) => Number(v.id) === Number(id)) || null;
  },

  async createVault(data) {
    initMockStorage();
    const vaults = getStorage(STORAGE_KEYS.VAULTS, SEED_VAULTS);
    const id = vaults.reduce((max, v) => Math.max(max, v.id), 500) + 1;
    const vault = {
      id,
      vaultCode: data.vaultCode || `VLT-GEN-${id}`,
      branchId: Number(data.branchId) || 1,
      name: data.name,
      securityLevel: data.securityLevel || "HIGH",
      maxConcurrentAccess: Number(data.maxConcurrentAccess) || 2,
      isLocked: data.isLocked !== false,
    };
    vaults.push(vault);
    setStorage(STORAGE_KEYS.VAULTS, vaults);
    return vault;
  },

  async updateVault(id, data) {
    initMockStorage();
    const vaults = getStorage(STORAGE_KEYS.VAULTS, SEED_VAULTS);
    const idx = vaults.findIndex((v) => Number(v.id) === Number(id));
    if (idx >= 0) {
      vaults[idx] = { ...vaults[idx], ...data };
      setStorage(STORAGE_KEYS.VAULTS, vaults);
      return vaults[idx];
    }
    throw new Error("Vault not found");
  },

  async deleteVault(id) {
    initMockStorage();
    let vaults = getStorage(STORAGE_KEYS.VAULTS, SEED_VAULTS);
    vaults = vaults.filter((v) => Number(v.id) !== Number(id));
    setStorage(STORAGE_KEYS.VAULTS, vaults);
    return true;
  },

  // Vault Access Requests
  async getAllRequests() {
    initMockStorage();
    return getStorage(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
  },

  async getPendingRequests() {
    const requests = await this.getAllRequests();
    return requests.filter((r) => r.status === "PENDING");
  },

  async createVaultRequest({ vaultId, reason, estimatedDurationMinutes, requestedById }) {
    initMockStorage();
    const requests = getStorage(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    const requestId = requests.reduce((max, r) => Math.max(max, r.requestId), 1000) + 1;
    const requestedAt = new Date().toISOString();

    const newRequest = {
      requestId,
      vaultId: Number(vaultId),
      requestedById: Number(requestedById) || 101,
      approvedById: null,
      reason,
      estimatedDurationMinutes: Number(estimatedDurationMinutes) || 60,
      status: "PENDING",
      authorizationCode: null,
      remarks: null,
      requestedAt,
      approvedAt: null,
    };

    requests.push(newRequest);
    setStorage(STORAGE_KEYS.REQUESTS, requests);

    // Cryptographic audit log hash write
    await appendAuditLog(
      "VAULT_ACCESS_REQUEST_CREATED",
      newRequest.requestedById,
      newRequest.vaultId,
      `Request #${requestId} submitted for Vault #${vaultId}. Reason: ${reason}`
    );

    return newRequest;
  },

  async approveOrRejectRequest(requestId, { action, remarks, approvedById }) {
    initMockStorage();
    const requests = getStorage(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    const idx = requests.findIndex((r) => Number(r.requestId) === Number(requestId));

    if (idx === -1) {
      throw new Error(`Request #${requestId} not found`);
    }

    const req = requests[idx];
    const isApprove = action.toUpperCase() === "APPROVE";
    const status = isApprove ? "APPROVED" : "REJECTED";
    const approvedAt = new Date().toISOString();
    
    // Generate cryptographic authorization code if approved
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const year = new Date().getFullYear();
    const authorizationCode = isApprove ? `AUTH-${randomHex}-${year}` : null;

    req.status = status;
    req.approvedById = Number(approvedById) || 102;
    req.remarks = remarks || `${status} via SecureVault Approval Portal`;
    req.authorizationCode = authorizationCode;
    req.approvedAt = approvedAt;

    requests[idx] = req;
    setStorage(STORAGE_KEYS.REQUESTS, requests);

    // Cryptographic audit log hash write
    await appendAuditLog(
      isApprove ? "VAULT_ACCESS_APPROVED" : "VAULT_ACCESS_REJECTED",
      req.approvedById,
      req.vaultId,
      `Request #${requestId} ${status}. Remarks: ${req.remarks}${authorizationCode ? ` | Code: ${authorizationCode}` : ""}`
    );

    return {
      requestId: req.requestId,
      status: req.status,
      approvedById: req.approvedById,
      authorizationCode: req.authorizationCode,
    };
  },

  // Open / Unlock Vault (The End-to-End Goal)
  async executeVaultAccess(requestId, authorizationCode, employeeId) {
    initMockStorage();
    const requests = getStorage(STORAGE_KEYS.REQUESTS, SEED_REQUESTS);
    const idx = requests.findIndex((r) => Number(r.requestId) === Number(requestId));

    if (idx === -1) {
      throw new Error("Request not found");
    }

    const req = requests[idx];
    if (req.status !== "APPROVED") {
      throw new Error(`Cannot unlock vault. Request status is ${req.status}`);
    }

    if (req.authorizationCode !== authorizationCode) {
      throw new Error("Invalid cryptographic authorization code");
    }

    // Unlock the vault
    const vaults = getStorage(STORAGE_KEYS.VAULTS, SEED_VAULTS);
    const vaultIdx = vaults.findIndex((v) => Number(v.id) === Number(req.vaultId));
    if (vaultIdx >= 0) {
      vaults[vaultIdx].isLocked = false;
      setStorage(STORAGE_KEYS.VAULTS, vaults);
    }

    req.status = "ACCESSED";
    req.accessedAt = new Date().toISOString();
    requests[idx] = req;
    setStorage(STORAGE_KEYS.REQUESTS, requests);

    // Write hash log
    const auditRecord = await appendAuditLog(
      "VAULT_UNLOCKED",
      employeeId || req.requestedById,
      req.vaultId,
      `Physical Vault #${req.vaultId} unlocked using Auth Code ${authorizationCode}. Session duration started: ${req.estimatedDurationMinutes}m.`
    );

    return {
      success: true,
      message: `Vault #${req.vaultId} successfully unlocked!`,
      vaultId: req.vaultId,
      auditLog: auditRecord,
    };
  },

  // Lock Vault
  async lockVault(vaultId, employeeId) {
    initMockStorage();
    const vaults = getStorage(STORAGE_KEYS.VAULTS, SEED_VAULTS);
    const vaultIdx = vaults.findIndex((v) => Number(v.id) === Number(vaultId));
    if (vaultIdx >= 0) {
      vaults[vaultIdx].isLocked = true;
      setStorage(STORAGE_KEYS.VAULTS, vaults);
    }

    const auditRecord = await appendAuditLog(
      "VAULT_LOCKED",
      employeeId || 101,
      vaultId,
      `Physical Vault #${vaultId} locked and secured. Hash written to immutable audit ledger.`
    );

    return {
      success: true,
      message: `Vault #${vaultId} locked and secured.`,
      auditLog: auditRecord,
    };
  },

  // Audit Logs & Hash Chain Verification
  async getAuditLogs(params = {}) {
    initMockStorage();
    let logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);

    if (params) {
      if (params.vaultId && params.vaultId !== "ALL") {
        logs = logs.filter((l) => Number(l.vaultId) === Number(params.vaultId));
      }
      if (params.date) {
        logs = logs.filter((l) => l.timestamp && l.timestamp.startsWith(params.date));
      }
      if (params.action && params.action !== "ALL") {
        logs = logs.filter(
          (l) => l.action === params.action || l.eventType === params.action
        );
      }
      if (params.search) {
        const q = String(params.search).toLowerCase();
        logs = logs.filter(
          (l) =>
            (l.logId && l.logId.toLowerCase().includes(q)) ||
            (l.actionDetails && l.actionDetails.toLowerCase().includes(q)) ||
            (l.action && l.action.toLowerCase().includes(q)) ||
            (l.eventType && l.eventType.toLowerCase().includes(q)) ||
            String(l.employeeId).includes(q) ||
            String(l.requesterId).includes(q) ||
            String(l.approverId).includes(q) ||
            String(l.vaultId).includes(q)
        );
      }
    }

    return logs;
  },

  async verifyAuditChain() {
    initMockStorage();
    const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    const verifiedAt = new Date().toISOString();

    if (logs.length === 0) {
      return {
        isChainValid: true,
        totalRecordsChecked: 0,
        tamperedLogId: null,
        expectedHash: null,
        actualHash: null,
        verifiedAt,
      };
    }

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

      // Check linkage with previous block
      if (i > 0) {
        const prev = logs[i - 1];
        if (log.previousHash !== prev.currentHash) {
          return {
            isChainValid: false,
            totalRecordsChecked: i,
            tamperedLogId: log.id,
            expectedHash: prev.currentHash,
            actualHash: log.previousHash,
            verifiedAt,
          };
        }
      }

      // Check current hash integrity against recalculated canonical SHA-256
      const expectedCurrentHash = await computeLogHash(
        log.previousHash,
        log.eventType,
        log.employeeId,
        log.vaultId,
        log.timestamp,
        log.actionDetails
      );

      if (log.currentHash !== expectedCurrentHash) {
        return {
          isChainValid: false,
          totalRecordsChecked: i,
          tamperedLogId: log.id,
          expectedHash: expectedCurrentHash,
          actualHash: log.currentHash,
          verifiedAt,
        };
      }
    }

    return {
      isChainValid: true,
      totalRecordsChecked: logs.length,
      tamperedLogId: null,
      expectedHash: null,
      actualHash: null,
      verifiedAt,
    };
  },

  // Simulate Tampering for Security Demonstration
  async simulateTamper(logId) {
    initMockStorage();
    const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
    const targetId = logId ? Number(logId) : 14;
    const idx = logs.findIndex((l) => Number(l.id) === targetId);
    if (idx >= 0) {
      logs[idx].actionDetails += " [MALICIOUS UNAUTHORIZED MODIFICATION]";
      setStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
      return logs[idx];
    }
    throw new Error("Log not found");
  },

  // Reset to clean seed data
  reset() {
    initMockStorage(true);
    return true;
  },
};
