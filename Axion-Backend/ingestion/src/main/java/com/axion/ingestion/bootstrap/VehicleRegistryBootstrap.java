package com.axion.ingestion.bootstrap;

import com.axion.ingestion.service.VehicleRegistryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Auto-registers the known simulator fleet on application startup.
 * This ensures the vehicle registry is populated before the simulator
 * begins emitting telemetry, closing the implicit-twin-creation gap.
 *
 * In a production system, vehicles would be provisioned via the
 * /api/v1/registry/provision endpoint during hardware onboarding.
 */
@Slf4j
@Component
@Order(2) // Run after DB migrations and admin bootstrap
public class VehicleRegistryBootstrap implements CommandLineRunner {

    private final VehicleRegistryService registryService;

    public VehicleRegistryBootstrap(VehicleRegistryService registryService) {
        this.registryService = registryService;
    }

    @Override
    public void run(String... args) {
        log.info("Bootstrapping vehicle registry for simulator fleet...");

        // Manually listed vehicles (v001-v020)
        List<String> sedanIds = new ArrayList<>();
        for (int i = 1; i <= 15; i++) {
            sedanIds.add(String.format("v%03d", i));
        }
        registryService.bulkProvision(sedanIds, "sedan_standard", "bootstrap");

        // Trucks v016-v018
        registryService.bulkProvision(List.of("v016", "v017", "v018"), "truck_heavy", "bootstrap");

        // Scenario vehicles
        registryService.bulkProvision(List.of("v019"), "sedan_sport", "bootstrap");
        registryService.bulkProvision(List.of("v020"), "truck_light", "bootstrap");

        // Auto-generated fleet-a (120 vehicles)
        List<String> fleetA = new ArrayList<>();
        for (int i = 1; i <= 120; i++) {
            fleetA.add(String.format("fleet-a-%03d", i));
        }
        registryService.bulkProvision(fleetA, "sedan_standard", "bootstrap");

        // Auto-generated fleet-b (80 vehicles)
        List<String> fleetB = new ArrayList<>();
        for (int i = 1; i <= 80; i++) {
            fleetB.add(String.format("fleet-b-%03d", i));
        }
        registryService.bulkProvision(fleetB, "truck_heavy", "bootstrap");

        // Auto-generated fleet-c (30 vehicles)
        List<String> fleetC = new ArrayList<>();
        for (int i = 1; i <= 30; i++) {
            fleetC.add(String.format("fleet-c-%03d", i));
        }
        registryService.bulkProvision(fleetC, "sedan_sport", "bootstrap");

        log.info("Vehicle registry bootstrap complete: {} active vehicles", registryService.countActive());
    }
}
