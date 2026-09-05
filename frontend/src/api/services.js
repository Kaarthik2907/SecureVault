import api from "./client";
export const authApi={login:(username,password)=>api.post("/auth/login",{username,password})};
export const branchApi={list:()=>api.get("/branches"),get:id=>api.get(`/branches/${id}`),create:data=>api.post("/branches",data),update:(id,data)=>api.put(`/branches/${id}`,data),remove:id=>api.delete(`/branches/${id}`)};
export const employeeApi={list:()=>api.get("/employees"),get:id=>api.get(`/employees/${id}`),create:data=>api.post("/employees",data),update:(id,data)=>api.put(`/employees/${id}`,data),remove:id=>api.delete(`/employees/${id}`)};
export const requestApi={pending:()=>api.get("/vault-requests/pending"),create:data=>api.post("/vault-requests",data),approval:(id,data)=>api.post(`/vault-requests/${id}/approval`,data)};
export const auditApi={verify:()=>api.get("/audit/verify")};
// Vault CRUD is intentionally not called here: the uploaded backend branch has no VaultController/endpoints.
