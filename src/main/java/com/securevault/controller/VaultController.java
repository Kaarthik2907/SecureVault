package com.securevault.controller;

import com.securevault.dto.VaultRequest;
import com.securevault.entity.Branch;
import com.securevault.entity.Vault;
import com.securevault.service.VaultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vaults")
public class VaultController {

    private final VaultService vaultService;

    public VaultController(VaultService vaultService) {
        this.vaultService = vaultService;
    }

    @PostMapping
    public ResponseEntity<Vault> createVault(@RequestBody VaultRequest request) {

        Vault vault = new Vault();

        vault.setVaultCode(request.vaultCode());
        vault.setBranch(createBranchReference(request.branchId()));
        vault.setName(request.name());
        vault.setSecurityLevel(request.securityLevel());
        vault.setMaxConcurrentAccess(request.maxConcurrentAccess());
        vault.setLocked(request.isLocked());

        return ResponseEntity.ok(vaultService.createVault(vault));
    }

    @GetMapping
    public ResponseEntity<List<Vault>> getAllVaults() {
        return ResponseEntity.ok(vaultService.getAllVaults());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vault> getVaultById(@PathVariable Long id) {
        return ResponseEntity.ok(vaultService.getVaultById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vault> updateVault(
            @PathVariable Long id,
            @RequestBody VaultRequest request) {

        Vault vault = new Vault();

        vault.setVaultCode(request.vaultCode());
        vault.setBranch(createBranchReference(request.branchId()));
        vault.setName(request.name());
        vault.setSecurityLevel(request.securityLevel());
        vault.setMaxConcurrentAccess(request.maxConcurrentAccess());
        vault.setLocked(request.isLocked());

        return ResponseEntity.ok(vaultService.updateVault(id, vault));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVault(@PathVariable Long id) {
        vaultService.deleteVault(id);
        return ResponseEntity.noContent().build();
    }

    private Branch createBranchReference(Long branchId) {
        Branch branch = new Branch();
        branch.setId(branchId);
        return branch;
    }
}