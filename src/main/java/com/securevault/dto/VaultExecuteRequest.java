package com.securevault.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request DTO containing the authorization code for unlocking a vault.
 */
public record VaultExecuteRequest(
        @JsonProperty("authorizationCode")
        @JsonAlias({"authCode", "code"})
        String authorizationCode
) {}
