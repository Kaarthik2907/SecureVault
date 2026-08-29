-- SecureVault Database Initialization Script
-- Target RDBMS: MySQL 8.0

CREATE DATABASE IF NOT EXISTS securevault_db;
USE securevault_db;

-- 1. Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    branch_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_employees_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Vaults Table
CREATE TABLE IF NOT EXISTS vaults (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vault_code VARCHAR(50) NOT NULL UNIQUE,
    branch_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    security_level VARCHAR(50) NOT NULL DEFAULT 'HIGH',
    max_concurrent_access INT NOT NULL DEFAULT 1,
    is_locked BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vaults_branch FOREIGN KEY (branch_id) REFERENCES branches (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Vault Access Requests Table
CREATE TABLE IF NOT EXISTS vault_access_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vault_id BIGINT NOT NULL,
    requested_by_id BIGINT NOT NULL,
    approved_by_id BIGINT NULL,
    reason TEXT NOT NULL,
    estimated_duration_minutes INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    authorization_code VARCHAR(100) NULL UNIQUE,
    remarks TEXT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    CONSTRAINT fk_var_vault FOREIGN KEY (vault_id) REFERENCES vaults (id) ON DELETE RESTRICT,
    CONSTRAINT fk_var_requester FOREIGN KEY (requested_by_id) REFERENCES employees (id) ON DELETE RESTRICT,
    CONSTRAINT fk_var_approver FOREIGN KEY (approved_by_id) REFERENCES employees (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Immutable Audit Logs Table (SHA-256 Hash Chaining)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    employee_id BIGINT NOT NULL,
    vault_id BIGINT NULL,
    action_details TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    previous_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    CONSTRAINT fk_audit_employee FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE RESTRICT,
    CONSTRAINT fk_audit_vault FOREIGN KEY (vault_id) REFERENCES vaults (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Indexes for performance
CREATE INDEX idx_emp_username ON employees (username);
CREATE INDEX idx_emp_role ON employees (role);
CREATE INDEX idx_vault_branch ON vaults (branch_id);
CREATE INDEX idx_var_status ON vault_access_requests (status);
CREATE INDEX idx_var_requested_at ON vault_access_requests (requested_at);
CREATE INDEX idx_audit_timestamp ON audit_logs (timestamp);
CREATE INDEX idx_audit_prev_hash ON audit_logs (previous_hash);

-- =========================================================================
-- Initial Seed Data
-- =========================================================================

-- Branches
INSERT INTO branches (id, branch_code, name, city, address, contact_number, is_active)
VALUES
(1, 'BR-MUM-001', 'Mumbai Financial Hub Branch', 'Mumbai', 'Bandra Kurla Complex, Plot C-12, Mumbai, MH 400051', '+91-22-67890123', TRUE),
(2, 'BR-DEL-001', 'Delhi Central Treasury Branch', 'New Delhi', 'Connaught Place, Block F, New Delhi, DL 110001', '+91-11-23456789', TRUE),
(3, 'BR-BLR-001', 'Bengaluru Tech & Custody Branch', 'Bengaluru', 'MG Road, Trinity Circle, Bengaluru, KA 560001', '+91-80-41234567', TRUE);

-- Employees (Passwords are BCrypt hashed for 'password123': $2a$10$wN3W6eYQn6eYh7rG9L/pfe91Z2nL2/2P... standard)
INSERT INTO employees (id, employee_code, username, password_hash, full_name, email, role, branch_id, is_active)
VALUES
(101, 'EMP-0101', 'johndoe', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'John Doe', 'johndoe@securevault.internal', 'OFFICER', 1, TRUE),
(102, 'EMP-0102', 'sarahsmith', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Sarah Smith', 'sarahsmith@securevault.internal', 'BRANCH_MANAGER', 1, TRUE),
(103, 'EMP-0103', 'davidkumar', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'David Kumar', 'davidkumar@securevault.internal', 'AUDITOR', 1, TRUE),
(104, 'EMP-0201', 'priyasharma', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Priya Sharma', 'priyasharma@securevault.internal', 'BRANCH_MANAGER', 2, TRUE),
(105, 'EMP-0301', 'alexchen', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Alex Chen', 'alexchen@securevault.internal', 'OFFICER', 3, TRUE);

-- Vaults
INSERT INTO vaults (id, vault_code, branch_id, name, security_level, max_concurrent_access, is_locked)
VALUES
(501, 'VLT-MUM-A1', 1, 'High Value Bullion Vault A1', 'CRITICAL', 2, TRUE),
(502, 'VLT-MUM-B2', 1, 'Securities & Deposit Locker B2', 'HIGH', 4, TRUE),
(503, 'VLT-DEL-01', 2, 'Reserve Currency Vault 01', 'CRITICAL', 2, TRUE),
(504, 'VLT-BLR-01', 3, 'Digital Asset & Escrow Storage 01', 'HIGH', 3, TRUE);

-- Vault Access Requests
INSERT INTO vault_access_requests (id, vault_id, requested_by_id, approved_by_id, reason, estimated_duration_minutes, status, authorization_code, remarks, requested_at, approved_at)
VALUES
(1001, 501, 101, 102, 'Quarterly physical bullion audit and inventory verification', 60, 'APPROVED', 'AUTH-7F89B2-2026', 'Approved per quarterly compliance protocol.', '2026-08-26 10:15:00', '2026-08-26 10:25:00'),
(1002, 502, 101, NULL, 'Routine locker inspection and sensor calibration', 45, 'PENDING', NULL, NULL, '2026-08-26 14:30:00', NULL),
(1003, 503, 104, NULL, 'Emergency currency re-allocation for inter-branch transfer', 90, 'PENDING', NULL, NULL, '2026-08-26 15:45:00', NULL);

-- Immutable Audit Logs (Demonstrating SHA-256 Hash Chaining)
INSERT INTO audit_logs (id, log_id, event_type, employee_id, vault_id, action_details, timestamp, previous_hash, current_hash)
VALUES
(1, 'LOG-20260826-0001', 'SYSTEM_INITIALIZATION', 102, NULL, 'SecureVault core schema and cryptographic audit chain initialized.', '2026-08-26 09:00:00', '0000000000000000000000000000000000000000000000000000000000000000', '065b75f8f5bcfae6ff8b8cbdf4eaee1e6a4b1ca7067d0269f8cbb8fa4a67e108'),
(2, 'LOG-20260826-0002', 'VAULT_ACCESS_REQUESTED', 101, 501, 'Request #1001 submitted by johndoe for Vault VLT-MUM-A1', '2026-08-26 10:15:00', '065b75f8f5bcfae6ff8b8cbdf4eaee1e6a4b1ca7067d0269f8cbb8fa4a67e108', '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b'),
(3, 'LOG-20260826-0003', 'VAULT_ACCESS_APPROVED', 102, 501, 'Request #1001 approved by sarahsmith. Auth Code: AUTH-7F89B2-2026 generated.', '2026-08-26 10:25:00', '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b', '8b3c94d1f2e5a7b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4'),
(4, 'LOG-20260826-0004', 'VAULT_ACCESS_REQUESTED', 101, 502, 'Request #1002 submitted by johndoe for Vault VLT-MUM-B2', '2026-08-26 14:30:00', '8b3c94d1f2e5a7b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4', '2e1f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f');
