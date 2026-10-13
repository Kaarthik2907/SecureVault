package com.securevault.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "vaults")
public class Vault {
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

    public Branch getBranch() {
        return branch;
    }

    public void setBranch(Branch branch) {
        this.branch = branch;
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

    public Integer getMaxConcurrentAccess() {
        return maxConcurrentAccess;
    }

    public void setMaxConcurrentAccess(Integer maxConcurrentAccess) {
        this.maxConcurrentAccess = maxConcurrentAccess;
    }

    @JsonProperty("isLocked")
    public boolean isLocked() {
        return locked;
    }

    @JsonProperty("isLocked")
    public void setLocked(boolean locked) {
        this.locked = locked;
    }

    @JsonProperty("locked")
    public boolean getLocked() {
        return locked;
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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vault_code", nullable = false, unique = true, length = 50)
    private String vaultCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "security_level", nullable = false, length = 50)
    private String securityLevel = "HIGH";

    @Column(name = "max_concurrent_access", nullable = false)
    private Integer maxConcurrentAccess = 1;

    @JsonProperty("isLocked")
    @Column(name = "is_locked", nullable = false)
    private boolean locked = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Getters and Setters
}

