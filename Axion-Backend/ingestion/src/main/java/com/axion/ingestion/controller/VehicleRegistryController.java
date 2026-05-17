package com.axion.ingestion.controller;

import com.axion.ingestion.model.primary.VehicleRegistryEntity;
import com.axion.ingestion.service.VehicleRegistryService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Vehicle Registry API — Device provisioning and lifecycle management.
 *
 * Closes the gap where any vehicleId could create a digital twin.
 * Vehicles must be provisioned via this API before telemetry is accepted.
 */
@RestController
@RequestMapping("/api/v1/registry")
public class VehicleRegistryController {

    private final VehicleRegistryService registryService;

    public VehicleRegistryController(VehicleRegistryService registryService) {
        this.registryService = registryService;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProvisionRequest {
        private String vehicleId;
        private String profile;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkProvisionRequest {
        private List<String> vehicleIds;
        private String profile;
    }

    @PostMapping("/provision")
    public ResponseEntity<VehicleRegistryEntity> provision(@RequestBody ProvisionRequest request) {
        VehicleRegistryEntity entity = registryService.provision(
                request.getVehicleId(),
                request.getProfile() != null ? request.getProfile() : "sedan_standard",
                "api"
        );
        return ResponseEntity.ok(entity);
    }

    @PostMapping("/provision/bulk")
    public ResponseEntity<Map<String, Object>> bulkProvision(@RequestBody BulkProvisionRequest request) {
        int count = registryService.bulkProvision(
                request.getVehicleIds(),
                request.getProfile() != null ? request.getProfile() : "sedan_standard",
                "api"
        );
        return ResponseEntity.ok(Map.of(
                "provisioned", count,
                "total", request.getVehicleIds().size()
        ));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<VehicleRegistryEntity>> listAll() {
        return ResponseEntity.ok(registryService.listAll());
    }

    @GetMapping("/vehicles/active")
    public ResponseEntity<List<VehicleRegistryEntity>> listActive() {
        return ResponseEntity.ok(registryService.listByState("ACTIVE"));
    }

    @GetMapping("/vehicles/{vehicleId}")
    public ResponseEntity<VehicleRegistryEntity> getVehicle(@PathVariable String vehicleId) {
        return registryService.findById(vehicleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/vehicles/{vehicleId}/decommission")
    public ResponseEntity<VehicleRegistryEntity> decommission(@PathVariable String vehicleId) {
        return ResponseEntity.ok(registryService.decommission(vehicleId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        return ResponseEntity.ok(Map.of(
                "registeredActive", registryService.countActive(),
                "totalRegistered", registryService.listAll().size()
        ));
    }
}
