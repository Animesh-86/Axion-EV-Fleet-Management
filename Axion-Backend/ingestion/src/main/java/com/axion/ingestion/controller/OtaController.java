package com.axion.ingestion.controller;

import com.axion.ingestion.model.dto.CampaignCreateRequest;
import com.axion.ingestion.model.dto.CampaignResponse;
import com.axion.ingestion.service.OtaCampaignService;
import com.axion.ingestion.service.OtaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/ota")
@Tag(name = "OTA Management", description = "Over-The-Air Campaign Orchestration")
public class OtaController {

    private final OtaService otaService;
    private final OtaCampaignService campaignService;

    public OtaController(OtaService otaService, OtaCampaignService campaignService) {
        this.otaService = otaService;
        this.campaignService = campaignService;
    }

    // ──── Legacy single-vehicle trigger ────

    @PostMapping("/trigger")
    @Operation(summary = "Trigger OTA Update (Legacy)", description = "Simulates an OTA update for a specific vehicle")
    public ResponseEntity<Void> triggerOta(
            @RequestParam String vehicleId,
            @RequestParam String campaignId) {

        boolean initiated = otaService.triggerOta(vehicleId, campaignId);

        if (initiated) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ──── Campaign Lifecycle API ────

    @PostMapping("/campaigns")
    @Operation(summary = "Create Campaign", description = "Create a new OTA deployment campaign in DRAFT state")
    public ResponseEntity<CampaignResponse> createCampaign(
            @RequestBody CampaignCreateRequest request,
            Principal principal) {
        String createdBy = principal != null ? principal.getName() : "system";
        CampaignResponse response = campaignService.createCampaign(request, createdBy);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/campaigns")
    @Operation(summary = "List Campaigns", description = "List all OTA campaigns ordered by creation date")
    public ResponseEntity<List<CampaignResponse>> listCampaigns() {
        return ResponseEntity.ok(campaignService.listCampaigns());
    }

    @GetMapping("/campaigns/{campaignId}")
    @Operation(summary = "Get Campaign", description = "Get full campaign details with per-vehicle job status")
    public ResponseEntity<CampaignResponse> getCampaign(@PathVariable String campaignId) {
        return ResponseEntity.ok(campaignService.getCampaign(campaignId));
    }

    @PostMapping("/campaigns/{campaignId}/approve")
    @Operation(summary = "Approve Campaign", description = "Transition campaign from DRAFT → CANARY phase")
    public ResponseEntity<CampaignResponse> approveCampaign(@PathVariable String campaignId) {
        return ResponseEntity.ok(campaignService.approveCampaign(campaignId));
    }

    @PostMapping("/campaigns/{campaignId}/halt")
    @Operation(summary = "Halt Campaign", description = "Emergency halt + rollback pending/successful deployments")
    public ResponseEntity<CampaignResponse> haltCampaign(@PathVariable String campaignId) {
        return ResponseEntity.ok(campaignService.haltCampaign(campaignId));
    }
}
