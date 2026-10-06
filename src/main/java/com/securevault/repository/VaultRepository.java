package com.securevault.repository;

import com.securevault.entity.Vault;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VaultRepository extends JpaRepository<Vault, Long> {

    Optional<Vault> findByVaultCode(String vaultCode);

    boolean existsByVaultCode(String vaultCode);
}