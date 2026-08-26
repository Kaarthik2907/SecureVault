# SecureVault API Contract & Specification

Version: `1.0.0`  
Base URL: `/api/v1`  
Data Format: `application/json`  
Naming Convention: `camelCase` for all JSON properties and request/response parameters.

---

## 1. Authentication & Session (`/api/v1/auth`)

### 1.1 Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Description**: Authenticate an employee and return a JWT bearer token with employee metadata.

#### Request Body (`LoginRequest`):
```json
{
  "username": "johndoe",
  "password": "SecurePassword123!"
}
```

#### Response Body (`200 OK` - `LoginResponse`):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "johndoe",
  "role": "OFFICER",
  "employeeId": 101,
  "branchId": 1
}
```

#### Error Responses:
- `400 Bad Request`: Validation failure (missing username/password).
- `401 Unauthorized`: Invalid credentials.

---

## 2. Vault Access Management (`/api/v1/vault-requests`)

### 2.1 Submit Vault Access Request
- **Endpoint**: `POST /api/v1/vault-requests`
- **Description**: Submit a request for time-bound access to a specific branch vault.

#### Request Body (`VaultRequestDTO`):
```json
{
  "vaultId": 501,
  "reason": "Quarterly audit and physical cash reserve inspection",
  "estimatedDurationMinutes": 60
}
```

#### Response Body (`201 Created` - `VaultRequestResponse`):
```json
{
  "requestId": 1001,
  "vaultId": 501,
  "requestedById": 101,
  "status": "PENDING",
  "requestedAt": "2026-08-26T20:30:00"
}
```

---

### 2.2 List Pending Requests
- **Endpoint**: `GET /api/v1/vault-requests/pending`
- **Description**: Retrieve all pending vault access requests awaiting approval for the manager's branch.

#### Response Body (`200 OK` - Array of `VaultRequestResponse`):
```json
[
  {
    "requestId": 1001,
    "vaultId": 501,
    "requestedById": 101,
    "status": "PENDING",
    "requestedAt": "2026-08-26T20:30:00"
  }
]
```

---

### 2.3 Approve or Reject Vault Access Request
- **Endpoint**: `POST /api/v1/vault-requests/{requestId}/approval`
- **Description**: Approve or reject a pending vault access request. If approved, generates a cryptographic authorization code.

#### Request Body (`ApprovalDecisionRequest`):
```json
{
  "action": "APPROVE",
  "remarks": "Approved after verifying scheduled maintenance schedule."
}
```

*Note: `action` accepts values `APPROVE` or `REJECT`.*

#### Response Body (`200 OK` - `ApprovalDecisionResponse`):
```json
{
  "requestId": 1001,
  "status": "APPROVED",
  "approvedById": 102,
  "authorizationCode": "AUTH-7F89B2-2026"
}
```

---

## 3. Audit Trail & Chain Verification (`/api/v1/audit`)

### 3.1 Verify Audit Hash Chain
- **Endpoint**: `GET /api/v1/audit/verify`
- **Description**: Cryptographically verifies the unbroken SHA-256 hash chain of all immutable audit logs.

#### Response Body (`200 OK` - `AuditVerificationResponse`):
```json
{
  "isChainValid": true,
  "totalRecordsChecked": 1250,
  "tamperedLogId": null,
  "expectedHash": null,
  "actualHash": null,
  "verifiedAt": "2026-08-26T20:35:00"
}
```

#### Tampered Chain Scenario (`200 OK`):
```json
{
  "isChainValid": false,
  "totalRecordsChecked": 840,
  "tamperedLogId": 841,
  "expectedHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "actualHash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
  "verifiedAt": "2026-08-26T20:35:00"
}
```

---

## 4. Entity Schemas (JSON Reference)

### 4.1 Branch
```json
{
  "id": 1,
  "branchCode": "BR-MUM-001",
  "name": "Mumbai Financial Hub Branch",
  "city": "Mumbai",
  "address": "Bandra Kurla Complex, Plot C-12, Mumbai, MH 400051",
  "contactNumber": "+91-22-67890123",
  "isActive": true
}
```

### 4.2 Employee
```json
{
  "id": 101,
  "employeeCode": "EMP-0101",
  "username": "johndoe",
  "fullName": "John Doe",
  "email": "johndoe@securevault.internal",
  "role": "OFFICER",
  "branchId": 1,
  "isActive": true
}
```

### 4.3 Vault
```json
{
  "id": 501,
  "vaultCode": "VLT-MUM-A1",
  "branchId": 1,
  "name": "High Value Bullion Vault A1",
  "securityLevel": "CRITICAL",
  "maxConcurrentAccess": 2,
  "isLocked": true
}
```

### 4.4 Audit Log
```json
{
  "id": 1,
  "logId": "LOG-20260826-0001",
  "eventType": "VAULT_ACCESS_REQUEST_CREATED",
  "employeeId": 101,
  "vaultId": 501,
  "actionDetails": "Requested access to Vault VLT-MUM-A1 for Reason: Physical inspection",
  "timestamp": "2026-08-26T20:30:00",
  "previousHash": "0000000000000000000000000000000000000000000000000000000000000000",
  "currentHash": "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"
}
```
