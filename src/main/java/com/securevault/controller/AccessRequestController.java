package com.securevault.controller;

import com.securevault.service.AccessRequestService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller handling Vault Access Requests, pending queue retrieval,
 * manager approval/denial decisions, and physical vault terminal unlock execution.
 */
@RestController
@RequestMapping({"/api/v1/vault-requests", "/api/v1/access-requests"})
public class AccessRequestController extends VaultRequestController {

    public AccessRequestController(AccessRequestService accessRequestService) {
        super(accessRequestService);
    }
}
