package com.axion.ingestion.service;

import com.axion.ingestion.model.primary.VehicleRegistryEntity;
import com.axion.ingestion.repository.primary.VehicleRegistryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests for VehicleRegistryService verifying:
 * - Provisioning creates vehicle entries
 * - isRegistered() uses O(1) cache lookup
 * - Decommissioned vehicles are removed from cache
 * - Bulk provisioning skips existing vehicles
 * - Unregistered vehicles are correctly rejected
 */
@ExtendWith(MockitoExtension.class)
class VehicleRegistryServiceTest {

    @Mock private VehicleRegistryRepository repository;

    private VehicleRegistryService service;

    @BeforeEach
    void setUp() {
        // Start with empty cache (no active vehicles in DB)
        when(repository.findByLifecycleState("ACTIVE")).thenReturn(Collections.emptyList());
        service = new VehicleRegistryService(repository);
    }

    @Test
    @DisplayName("Unregistered vehicle returns false from isRegistered()")
    void unregisteredVehicleIsRejected() {
        assertFalse(service.isRegistered("ghost-vehicle-999"));
    }

    @Test
    @DisplayName("Provisioned vehicle returns true from isRegistered()")
    void provisionedVehicleIsAccepted() {
        when(repository.existsByVehicleId("v001")).thenReturn(false);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.provision("v001", "sedan_standard", "test");

        assertTrue(service.isRegistered("v001"));
    }

    @Test
    @DisplayName("Duplicate provisioning returns existing entity, doesn't create duplicate")
    void duplicateProvisioningReturnsExisting() {
        VehicleRegistryEntity existing = VehicleRegistryEntity.builder()
                .vehicleId("v001")
                .vehicleProfile("sedan_standard")
                .build();

        when(repository.existsByVehicleId("v001")).thenReturn(true);
        when(repository.findById("v001")).thenReturn(Optional.of(existing));

        VehicleRegistryEntity result = service.provision("v001", "sedan_standard", "test");

        assertEquals("v001", result.getVehicleId());
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Decommissioned vehicle is removed from isRegistered cache")
    void decommissionedVehicleRemovedFromCache() {
        // First provision
        when(repository.existsByVehicleId("v-retire")).thenReturn(false);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        service.provision("v-retire", "sedan_standard", "test");
        assertTrue(service.isRegistered("v-retire"));

        // Decommission
        VehicleRegistryEntity entity = VehicleRegistryEntity.builder()
                .vehicleId("v-retire")
                .vehicleProfile("sedan_standard")
                .lifecycleState("ACTIVE")
                .build();
        when(repository.findById("v-retire")).thenReturn(Optional.of(entity));
        service.decommission("v-retire");

        assertFalse(service.isRegistered("v-retire"));
    }

    @Test
    @DisplayName("Bulk provision correctly counts new registrations, skipping existing")
    void bulkProvisionSkipsExisting() {
        when(repository.existsByVehicleId("v001")).thenReturn(true);  // Already exists
        when(repository.existsByVehicleId("v002")).thenReturn(false); // New
        when(repository.existsByVehicleId("v003")).thenReturn(false); // New
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        int provisioned = service.bulkProvision(
                List.of("v001", "v002", "v003"), "sedan_standard", "test"
        );

        assertEquals(2, provisioned);  // Only v002 and v003 were new
        assertTrue(service.isRegistered("v002"));
        assertTrue(service.isRegistered("v003"));
    }

    @Test
    @DisplayName("countActive() reflects cache state")
    void countActiveReflectsCache() {
        assertEquals(0, service.countActive());

        when(repository.existsByVehicleId(anyString())).thenReturn(false);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.provision("v001", "sedan_standard", "test");
        service.provision("v002", "sedan_standard", "test");

        assertEquals(2, service.countActive());
    }
}
