package com.axion.ingestion.controller;

import com.axion.ingestion.model.TelemetryHistory;
import com.axion.ingestion.service.TelemetryHistoryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/history")
public class TelemetryHistoryController {

    private final TelemetryHistoryService telemetryHistoryService;

    public TelemetryHistoryController(TelemetryHistoryService telemetryHistoryService) {
        this.telemetryHistoryService = telemetryHistoryService;
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<List<TelemetryHistory>> getHistory(
            @PathVariable String vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        
        List<TelemetryHistory> history = telemetryHistoryService.getHistory(vehicleId, from, to);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{vehicleId}/aggregates")
    public ResponseEntity<List<TelemetryHistory>> getAggregates(
            @PathVariable String vehicleId,
            @RequestParam(defaultValue = "1h") String interval) {
        
        List<TelemetryHistory> aggregates = telemetryHistoryService.getAggregates(vehicleId, interval);
        return ResponseEntity.ok(aggregates);
    }
}
