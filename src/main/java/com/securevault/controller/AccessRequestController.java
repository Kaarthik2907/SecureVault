package com.securevault.controller;

import com.securevault.dto.ApprovalDecisionRequest;
import com.securevault.dto.ApprovalDecisionResponse;
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

/**
 * Controller handling Vault Access Requests, pending queue retrieval,
 * and manager approval/denial decisions.
 */
@RestController
@RequestMapping({"/api/v1/vault-requests", "/api/v1/access-requests"})
public class AccessRequestController {

    private final AccessRequestService accessRequestService;

    public AccessRequestController(AccessRequestService accessRequestService) {
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
}
