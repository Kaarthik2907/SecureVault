package com.securevault.controller;

import com.securevault.dto.ApprovalDecisionRequest;
import com.securevault.dto.ApprovalDecisionResponse;
import com.securevault.dto.VaultExecuteResponse;
import com.securevault.dto.VaultRequestDTO;
import com.securevault.dto.VaultRequestResponse;
import com.securevault.service.AccessRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * Controller handling Vault Access Requests, pending queue retrieval,
 * manager approval/denial decisions, and physical vault terminal unlock execution.
 */
public class VaultRequestController {

    protected final AccessRequestService accessRequestService;

    public VaultRequestController(AccessRequestService accessRequestService) {
        this.accessRequestService = accessRequestService;
    }

    @PostMapping
    public ResponseEntity<VaultRequestResponse> submitRequest(
            @Valid @RequestBody VaultRequestDTO dto,
            Principal principal) {
        String username = principal != null ? principal.getName() : null;
        VaultRequestResponse response = accessRequestService.submitRequest(dto, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<VaultRequestResponse>> getPendingRequests(
            @RequestParam(required = false) Long branchId) {
        List<VaultRequestResponse> pending = accessRequestService.getPendingRequests(branchId);
        return ResponseEntity.ok(pending);
    }

    @GetMapping
    public ResponseEntity<List<VaultRequestResponse>> getAllRequests() {
        return ResponseEntity.ok(accessRequestService.getAllRequests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VaultRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(accessRequestService.getRequestById(id));
    }

    @PostMapping("/{requestId}/approval")
    @PreAuthorize("hasAnyRole('BRANCH_MANAGER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ApprovalDecisionResponse> processApproval(
            @PathVariable Long requestId,
            @Valid @RequestBody ApprovalDecisionRequest decisionRequest,
            Principal principal) {
        String username = principal != null ? principal.getName() : null;
        ApprovalDecisionResponse response = accessRequestService.processDecision(requestId, decisionRequest, username);
        return ResponseEntity.ok(response);
    }

    /**
     * Authorizes and executes an approved vault access request, unlocking the physical vault
     * and writing an immutable SHA-256 block into the cryptographic audit chain.
     */
    @PostMapping({"/{id}/execute", "/{requestId}/execute"})
    public ResponseEntity<VaultExecuteResponse> executeRequest(
            @PathVariable(name = "id", required = false) Long pathId,
            @PathVariable(name = "requestId", required = false) Long pathRequestId,
            @RequestBody(required = false) Map<String, Object> payload,
            Principal principal) {
        Long id = pathId != null ? pathId : pathRequestId;
        String authCode = null;
        if (payload != null) {
            if (payload.containsKey("authorizationCode")) {
                authCode = String.valueOf(payload.get("authorizationCode"));
            } else if (payload.containsKey("authCode")) {
                authCode = String.valueOf(payload.get("authCode"));
            }
        }
        String username = principal != null ? principal.getName() : null;
        VaultExecuteResponse response = accessRequestService.executeRequest(id, authCode, username);
        return ResponseEntity.ok(response);
    }
}
