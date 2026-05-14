package com.axion.ingestion.controller;

import com.axion.ingestion.model.dto.RcaEvent;
import com.axion.ingestion.service.RcaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rca")
@Tag(name = "Root Cause Analysis", description = "Cross-Storage Timeline Event Correlation")
public class RcaController {

    private final RcaService rcaService;

    public RcaController(RcaService rcaService) {
        this.rcaService = rcaService;
    }

    @GetMapping("/{vehicleId}")
    @Operation(summary = "Get Unified Timeline", description = "Retrieves correlated events from TimescaleDB telemetry shifts and PostgreSQL OTA operations")
    public ResponseEntity<List<RcaEvent>> getTimeline(
            @PathVariable String vehicleId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {

        // Default to last 24 hours if ranges aren't specified
        Instant actualTo = to != null ? to : Instant.now();
        Instant actualFrom = from != null ? from : actualTo.minus(24, ChronoUnit.HOURS);

        List<RcaEvent> timeline = rcaService.getUnifiedTimeline(vehicleId, actualFrom, actualTo);
        return ResponseEntity.ok(timeline);
    }
}
