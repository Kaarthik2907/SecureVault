package com.securevault.service;

import com.securevault.dto.ApprovalDecisionRequest;
import com.securevault.dto.ApprovalDecisionResponse;
import com.securevault.dto.VaultExecuteResponse;
import com.securevault.dto.VaultRequestDTO;
import com.securevault.dto.VaultRequestResponse;

import java.util.List;

/**
 * Service handling the Vault Access Request lifecycle.
 */
public interface AccessRequestService {

    VaultRequestResponse submitRequest(VaultRequestDTO dto, String requesterUsername);

    List<VaultRequestResponse> getPendingRequests(Long branchId);

    List<VaultRequestResponse> getAllRequests();

    VaultRequestResponse getRequestById(Long id);

    ApprovalDecisionResponse processDecision(Long requestId, ApprovalDecisionRequest decision, String approverUsername);

    VaultExecuteResponse executeRequest(Long requestId, String authorizationCode, String executorUsername);
}
