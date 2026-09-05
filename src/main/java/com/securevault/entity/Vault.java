package com.securevault.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing a high-security vault in SecureVault.
 * Mapped to the 'vaults' database table.
 */
@Entity
@Table(name = "vaults")
public class Vault {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vault_code", nullable = false, unique = true, length = 50)
    private String vaultCode;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "security_level", nullable = false, length = 50)
    private String securityLevel = "HIGH";

    @Column(name = "max_concurrent_access", nullable = false)
    private int maxConcurrentAccess = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private VaultStatus status = VaultStatus.LOCKED;

    @Column(name = "is_locked", nullable = false)
    private boolean locked = true;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Vault() {
    }

    public Vault(Long id, String vaultCode, Long branchId, String name, String securityLevel,
                 int maxConcurrentAccess, VaultStatus status, boolean locked) {
        this.id = id;
        this.vaultCode = vaultCode;
        this.branchId = branchId;
        this.name = name;
        this.securityLevel = securityLevel;
        this.maxConcurrentAccess = maxConcurrentAccess;
        this.status = status;
        this.locked = locked;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVaultCode() {
        return vaultCode;
    }

    public void setVaultCode(String vaultCode) {
        this.vaultCode = vaultCode;
    }

    public Long getBranchId() {
        return branchId;
    }

    public void setBranchId(Long branchId) {
        this.branchId = branchId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }

    public int getMaxConcurrentAccess() {
        return maxConcurrentAccess;
    }

    public void setMaxConcurrentAccess(int maxConcurrentAccess) {
        this.maxConcurrentAccess = maxConcurrentAccess;
    }

    public VaultStatus getStatus() {
        return status;
    }

    public void setStatus(VaultStatus status) {
        this.status = status;
        if (status != null) {
            this.locked = (status == VaultStatus.LOCKED);
        }
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
        this.status = locked ? VaultStatus.LOCKED : VaultStatus.UNLOCKED;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
