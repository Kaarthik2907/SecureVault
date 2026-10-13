package com.securevault.controller;

import com.securevault.entity.AuditLog;
import com.securevault.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST controller for cryptographic audit logs and immutable ledger inspection.
 * Supports both /api/v1/audit (standard API v1 route) and /api/audit.
 */
@RestController
@RequestMapping({"/api/v1/audit", "/api/audit"})
public class AuditController {

    private final AuditLogService auditLogService;

    public AuditController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    /**
     * Cryptographically verifies the unbroken SHA-256 hash chain.
     */
    @GetMapping("/verify")
    public ResponseEntity<AuditLogService.VerificationResult> verifyChain() {
        AuditLogService.VerificationResult result = auditLogService.verifyChain();
        return ResponseEntity.ok(result);
    }

    /**
     * Restores cryptographic integrity across the entire audit log hash chain.
     */
    @PostMapping("/reset")
    public ResponseEntity<java.util.Map<String, Object>> resetChain() {
        auditLogService.resetChain();
        return ResponseEntity.ok(java.util.Map.of(
                "success", true,
                "message", "Audit hash chain integrity successfully restored."
        ));
    }

    /**
     * Simulates malicious tampering on an audit record for security verification testing.
     */
    @PostMapping({"/tamper", "/tamper/{id}"})
    public ResponseEntity<?> simulateTamper(
            @PathVariable(required = false) Object id,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        Object target = id != null ? id : (body != null ? body.get("logId") : null);
        AuditLog tampered = auditLogService.simulateTamper(target);
        return ResponseEntity.ok(tampered);
    }

    /**
     * Retrieves historical audit log records with optional filtering (vaultId, date range)
     * and pagination.
     *
     * - If pagination params (page and/or size) are provided: returns Page<AuditLog>.
     * - If pagination params are omitted: returns List<AuditLog> (guaranteeing immediate
     *   compatibility with frontend ledger components expecting raw JSON arrays).
     *
     * @param vaultId   Optional vault ID to filter by.
     * @param startDate Optional start of timestamp range (ISO-8601, e.g., 2026-08-26T00:00:00).
     * @param endDate   Optional end of timestamp range (ISO-8601, e.g., 2026-08-26T23:59:59).
     * @param page      Optional zero-based page number.
     * @param size      Optional page size.
     * @param sort      Optional sort expression (default: "timestamp,desc").
     * @return Page<AuditLog> if paginated, or List<AuditLog> if unpaged.
     */
    @GetMapping({"/logs", ""})
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(required = false) Long vaultId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "timestamp,desc") String sort) {

        if (page != null || size != null) {
            int pageNum = page != null ? Math.max(0, page) : 0;
            int pageSize = size != null ? Math.max(1, size) : 20;

            Sort sortObj = parseSort(sort);
            Pageable pageable = PageRequest.of(pageNum, pageSize, sortObj);

            Page<AuditLog> paged = auditLogService.getHistoricalLogs(vaultId, startDate, endDate, pageable);
            return ResponseEntity.ok(paged);
        }

        List<AuditLog> list = auditLogService.getHistoricalLogs(vaultId, startDate, endDate);
        return ResponseEntity.ok(list);
    }

    /**
     * Dedicated paginated endpoint using Spring Data Pageable binding.
     * E.g. GET /api/v1/audit/logs/page?vaultId=501&page=0&size=10&sort=timestamp,desc
     */
    @GetMapping("/logs/page")
    public ResponseEntity<Page<AuditLog>> getAuditLogsPaged(
            @RequestParam(required = false) Long vaultId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "timestamp", direction = Sort.Direction.DESC) Pageable pageable) {

        Page<AuditLog> paged = auditLogService.getHistoricalLogs(vaultId, startDate, endDate, pageable);
        return ResponseEntity.ok(paged);
    }

    /**
     * Retrieves historical audit logs for a specific vault ID.
     * E.g. GET /api/v1/audit/vault/{vaultId}
     */
    @GetMapping("/vault/{vaultId}")
    public ResponseEntity<?> getAuditLogsByVault(
            @PathVariable Long vaultId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "timestamp,desc") String sort) {

        return getAuditLogs(vaultId, startDate, endDate, page, size, sort);
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "timestamp");
        }
        String[] parts = sort.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = parts.length > 1 && parts[1].trim().equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return Sort.by(direction, property);
    }
}