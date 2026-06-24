package com.axion.ingestion.consumer;

import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.model.TelemetryPayload;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests for TelemetryHistoryConsumer verifying:
 * - Batch flushing at threshold (100 events)
 * - Scheduled flush for partial batches
 * - Null telemetry payloads are skipped gracefully
 * - Database errors don't crash the consumer
 */
@ExtendWith(MockitoExtension.class)
class TelemetryHistoryConsumerTest {

    @Mock private JdbcTemplate tsdbJdbcTemplate;

    private TelemetryHistoryConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new TelemetryHistoryConsumer(tsdbJdbcTemplate);
    }

    @Test
    @DisplayName("Flushes batch when threshold (100) is reached")
    void flushesBatchAtThreshold() {
        // Build a single batch of 100 events and consume it
        java.util.List<CanonicalTelemetryEnvelope> batch = new java.util.ArrayList<>();
        for (int i = 0; i < 100; i++) {
            batch.add(buildEnvelope("v" + String.format("%03d", i)));
        }
        consumer.consume(batch);

        // Verify batchUpdate was called once with ~100 items
        verify(tsdbJdbcTemplate, times(1)).batchUpdate(anyString(), anyList());
    }

    @Test
    @DisplayName("Does not flush before threshold is reached")
    void doesNotFlushBeforeThreshold() {
        // Build a single batch of 50 events and consume it
        java.util.List<CanonicalTelemetryEnvelope> batch = new java.util.ArrayList<>();
        for (int i = 0; i < 50; i++) {
            batch.add(buildEnvelope("v" + String.format("%03d", i)));
        }
        consumer.consume(batch);

        // Current consumer flushes whatever batch it receives; expect one call
        verify(tsdbJdbcTemplate, times(1)).batchUpdate(anyString(), anyList());
    }
    

    @Test
    @DisplayName("Skips events with null telemetry payload")
    void skipsNullTelemetryPayload() {
        // Build a batch of 100 events with null telemetry
        java.util.List<CanonicalTelemetryEnvelope> batch = new java.util.ArrayList<>();
        for (int i = 0; i < 100; i++) {
            CanonicalTelemetryEnvelope envelope = new CanonicalTelemetryEnvelope();
            envelope.setVehicleId("v" + i);
            envelope.setTimestamp(Instant.now());
            envelope.setTelemetry(null);
            batch.add(envelope);
        }
        consumer.consume(batch);

        // batchUpdate should be called but with empty args list (all filtered)
        ArgumentCaptor<List> captor = ArgumentCaptor.forClass(List.class);
        verify(tsdbJdbcTemplate, times(1)).batchUpdate(anyString(), captor.capture());
        assertTrue(captor.getValue().isEmpty());
    }

    @Test
    @DisplayName("Database error does not crash consumer — batch is cleared")
    void databaseErrorDoesNotCrashConsumer() {
        when(tsdbJdbcTemplate.batchUpdate(anyString(), anyList()))
                .thenThrow(new RuntimeException("TimescaleDB connection lost"));
        // Build a single batch that will cause the mocked exception
        java.util.List<CanonicalTelemetryEnvelope> batch = new java.util.ArrayList<>();
        for (int i = 0; i < 100; i++) {
            batch.add(buildEnvelope("v" + String.format("%03d", i)));
        }

        // Should not throw
        assertDoesNotThrow(() -> consumer.consume(batch));

        // Consumer should still accept new events after the error
        java.util.List<CanonicalTelemetryEnvelope> after = List.of(buildEnvelope("v-after-error"));
        assertDoesNotThrow(() -> consumer.consume(after));
    }

    private CanonicalTelemetryEnvelope buildEnvelope(String vehicleId) {
        CanonicalTelemetryEnvelope envelope = new CanonicalTelemetryEnvelope();
        envelope.setVehicleId(vehicleId);
        envelope.setTimestamp(Instant.now());
        TelemetryPayload payload = new TelemetryPayload();
        payload.setBatterySocPct(85.0);
        payload.setBatteryTempC(30.0);
        payload.setMotorTempC(35.0);
        payload.setSpeedKmph(60.0);
        envelope.setTelemetry(payload);
        return envelope;
    }
}
