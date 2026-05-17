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

    private TelemetryIngestionService service;

    // Payload uses snake_case field names matching RestTelemetryAdapter expectations
    private static final String PAYLOAD_TEMPLATE =
            "{\"vehicle_id\":\"%s\",\"vendor\":\"SIMULATED\",\"timestamp\":\"2026-05-18T00:00:00Z\"," +
            "\"telemetry\":{\"battery_soc_pct\":85.0,\"speed_kmph\":60.0,\"battery_temp_c\":30.0," +
            "\"motor_temp_c\":35.0,\"ambient_temp_c\":25.0,\"odometer_km\":15000.0}}";

    @BeforeEach
    void setUp() {
        service = new TelemetryIngestionService(producer, throughputTracker, registryService);
    }

    @Test
    @DisplayName("Registered vehicle telemetry is published to Kafka")
    void registeredVehicleTelemetryIsPublished() {
        when(registryService.isRegistered("v001")).thenReturn(true);

        service.ingestRest(String.format(PAYLOAD_TEMPLATE, "v001")).block();

        verify(producer, times(1)).publish(any(CanonicalTelemetryEnvelope.class));
        verify(throughputTracker, times(1)).recordEvent();
    }

    @Test
    @DisplayName("Unregistered vehicle telemetry is silently rejected")
    void unregisteredVehicleTelemetryIsRejected() {
        when(registryService.isRegistered("ghost-999")).thenReturn(false);

        service.ingestRest(String.format(PAYLOAD_TEMPLATE, "ghost-999")).block();

        // Producer should NOT be called — telemetry was rejected
        verify(producer, never()).publish(any());
        verify(throughputTracker, never()).recordEvent();
    }

    @Test
    @DisplayName("When VehicleRegistryService is null (unavailable), telemetry passes through")
    void registryBypassWhenServiceUnavailable() {
        // Create service without registry — simulates @Autowired(required=false) returning null
        TelemetryIngestionService serviceWithoutRegistry =
                new TelemetryIngestionService(producer, throughputTracker, null);

        serviceWithoutRegistry.ingestRest(String.format(PAYLOAD_TEMPLATE, "any-vehicle")).block();

        // Should pass through since registry is not available
        verify(producer, times(1)).publish(any(CanonicalTelemetryEnvelope.class));
    }
}
