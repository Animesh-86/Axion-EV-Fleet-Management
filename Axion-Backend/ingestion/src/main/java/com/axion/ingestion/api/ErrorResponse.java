package com.axion.ingestion.api;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Schema(description = "Standard error response")
@RequiredArgsConstructor
@Getter
@Setter
public class ErrorResponse {

    @Schema(example = "2026-01-25T18:32:47Z")
    private Instant timestamp;

    @Schema(example = "VALIDATION_FAILED")
    private String errorCode;

    @Schema(example = "battery_soc_pct is required")
    private String message;

    // getters & setters
}
