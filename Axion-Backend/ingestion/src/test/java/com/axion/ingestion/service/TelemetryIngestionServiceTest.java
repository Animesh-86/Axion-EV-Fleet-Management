package com.axion.ingestion.service;

import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.producer.TelemetryKafkaProducer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests for the telemetry ingestion pipeline verifying:
 * - Registered vehicles get their telemetry published to Kafka
 * - Unregistered vehicles are silently rejected
 * - Registry bypass works when VehicleRegistryService is unavailable
 */
@ExtendWith(MockitoExtension.class)
class TelemetryIngestionServiceTest {

    @Mock private TelemetryKafkaProducer producer;
    @Mock private ThroughputTracker throughputTracker;
    @Mock private VehicleRegistryService registryService;
    @Mock private com.axion.ingestion.validation.TelemetryValidator validator;

    private TelemetryIngestionService service;

    private CanonicalTelemetryEnvelope makeEnvelope(String vehicleId) {
        CanonicalTelemetryEnvelope env = new CanonicalTelemetryEnvelope();
        env.setVehicleId(vehicleId);
        env.setVendor("SIMULATED");
        env.setTimestamp(java.time.Instant.parse("2026-05-18T00:00:00Z"));
        com.axion.ingestion.model.TelemetryPayload tp = new com.axion.ingestion.model.TelemetryPayload();
        tp.setBatterySocPct(85.0);
        tp.setSpeedKmph(60.0);
        tp.setBatteryTempC(30.0);
        tp.setMotorTempC(35.0);
        tp.setAmbientTempC(25.0);
        tp.setOdometerKm(15000.0);
        env.setTelemetry(tp);
        return env;
    }

    @BeforeEach
    void setUp() {
        service = new TelemetryIngestionService(null, validator, producer, throughputTracker, registryService);
    }

    @Test
    @DisplayName("Registered vehicle telemetry is published to Kafka")
    void registeredVehicleTelemetryIsPublished() {
        when(registryService.isRegistered("v001")).thenReturn(true);
        when(producer.publishAsync(any())).thenReturn(java.util.concurrent.CompletableFuture.completedFuture(null));

        service.ingestRest(makeEnvelope("v001")).block();

        verify(producer, times(1)).publishAsync(any(CanonicalTelemetryEnvelope.class));
        verify(throughputTracker, times(1)).recordEvent();
    }

    @Test
    @DisplayName("Unregistered vehicle telemetry is silently rejected")
    void unregisteredVehicleTelemetryIsRejected() {
        when(registryService.isRegistered("ghost-999")).thenReturn(false);

        service.ingestRest(makeEnvelope("ghost-999")).block();

        // Producer should NOT be called — telemetry was rejected
        verify(producer, never()).publishAsync(any());
        verify(throughputTracker, never()).recordEvent();
    }

    @Test
    @DisplayName("When VehicleRegistryService is null (unavailable), telemetry passes through")
    void registryBypassWhenServiceUnavailable() {
        TelemetryIngestionService serviceWithoutRegistry =
                new TelemetryIngestionService(null, validator, producer, throughputTracker, null);

        when(producer.publishAsync(any())).thenReturn(java.util.concurrent.CompletableFuture.completedFuture(null));

        serviceWithoutRegistry.ingestRest(makeEnvelope("any-vehicle")).block();

        // Should pass through since registry is not available
        verify(producer, times(1)).publishAsync(any(CanonicalTelemetryEnvelope.class));
    }
}
