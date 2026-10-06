package com.securevault.service;

import com.securevault.entity.Vault;

import java.util.List;

public interface VaultService {

    Vault createVault(Vault vault);

    List<Vault> getAllVaults();

    Vault getVaultById(Long id);

    Vault updateVault(Long id, Vault vault);

    void deleteVault(Long id);
}