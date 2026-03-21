package com.axion.ingestion.controller;

import com.axion.ingestion.service.OtaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ota")
@Tag(name = "OTA Management", description = "Over-The-Air Update Simulation")
public class OtaController {

    private final OtaService otaService;

    public OtaController(OtaService otaService) {
        this.otaService = otaService;
    }

    @PostMapping("/trigger")
    @Operation(summary = "Trigger OTA Update", description = "Simulates an OTA update for a specific vehicle")
    public ResponseEntity<Void> triggerOta(
            @RequestParam String vehicleId,
            @RequestParam String campaignId) {

        boolean initiated = otaService.triggerOta(vehicleId, campaignId);

        if (initiated) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build(); // Vehicle not found
        }
    }
}
