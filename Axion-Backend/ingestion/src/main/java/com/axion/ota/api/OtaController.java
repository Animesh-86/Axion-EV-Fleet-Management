package com.axion.ota.api;

import com.axion.ota.model.OtaJob;
import com.axion.ota.service.OtaOrchestratorService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ota")
public class OtaController {

    private final OtaOrchestratorService orchestratorService;

    public OtaController(OtaOrchestratorService orchestratorService) {
        this.orchestratorService = orchestratorService;
    }

    @PostMapping("/trigger")
    public OtaJob trigger(
            @RequestParam String campaignId,
            @RequestParam String vehicleId) {

        return orchestratorService.startJob(campaignId, vehicleId);
    }
}
