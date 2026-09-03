# SecureVault Member 4 Frontend — Backend-Integrated

This frontend is wired to the uploaded `feature/backend-workflows` backend branch.

## Confirmed integrations
- POST `/api/v1/auth/login`
- Branch CRUD: `/api/v1/branches`
- Employee CRUD: `/api/v1/employees`
- Pending vault requests: `/api/v1/vault-requests/pending`
- Request approval/rejection: `/api/v1/vault-requests/{requestId}/approval`
- Audit verification: `/api/v1/audit/verify`

## Not present in the uploaded backend branch
There is no VaultController/Vault CRUD endpoint and no monitoring API endpoint, so those screens deliberately remain UI-only rather than pretending to call nonexistent APIs.

## Run
npm install
npm run dev

Optional environment variable:
VITE_API_URL=http://localhost:8080/api/v1
