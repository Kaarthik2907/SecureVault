package com.securevault.service;

import com.securevault.entity.Vault;
import com.securevault.repository.VaultRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VaultServiceImpl implements VaultService {

    private final VaultRepository vaultRepository;

    public VaultServiceImpl(VaultRepository vaultRepository) {
        this.vaultRepository = vaultRepository;
    }

    @Override
    public Vault createVault(Vault vault) {
        return vaultRepository.save(vault);
    }

    @Override
    public List<Vault> getAllVaults() {
        return vaultRepository.findAll();
    }

    @Override
    public Vault getVaultById(Long id) {
        return vaultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vault not found"));
    }

    @Override
    public Vault updateVault(Long id, Vault vault) {
        Vault existingVault = getVaultById(id);

        existingVault.setVaultCode(vault.getVaultCode());
        existingVault.setBranch(vault.getBranch());
        existingVault.setName(vault.getName());
        existingVault.setSecurityLevel(vault.getSecurityLevel());
        existingVault.setMaxConcurrentAccess(vault.getMaxConcurrentAccess());
        existingVault.setLocked(vault.isLocked());

        return vaultRepository.save(existingVault);
    }

    @Override
    public void deleteVault(Long id) {
        vaultRepository.deleteById(id);
    }
}
