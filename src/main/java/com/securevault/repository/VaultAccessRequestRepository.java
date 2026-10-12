package com.securevault.repository;

import com.securevault.entity.VaultAccessRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for VaultAccessRequest operations.
 */
@Repository
public interface VaultAccessRequestRepository extends JpaRepository<VaultAccessRequest, Long> {

    List<VaultAccessRequest> findByStatusOrderByIdDesc(String status);

    List<VaultAccessRequest> findByStatusAndVaultBranchIdOrderByIdDesc(String status, Long branchId);

    List<VaultAccessRequest> findAllByOrderByIdDesc();
}
