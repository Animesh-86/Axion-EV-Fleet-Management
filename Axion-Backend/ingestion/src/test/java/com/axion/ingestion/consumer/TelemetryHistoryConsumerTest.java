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
        // Send exactly 100 events
        for (int i = 0; i < 100; i++) {
            consumer.consume(buildEnvelope("v" + String.format("%03d", i)));
        }

        // Verify batchUpdate was called once with ~100 items
        verify(tsdbJdbcTemplate, times(1)).batchUpdate(anyString(), anyList());
    }

    @Test
    @DisplayName("Does not flush before threshold is reached")
    void doesNotFlushBeforeThreshold() {
        // Send 50 events — below threshold
        for (int i = 0; i < 50; i++) {
            consumer.consume(buildEnvelope("v" + String.format("%03d", i)));
        }

        // No flush should have occurred
        verify(tsdbJdbcTemplate, never()).batchUpdate(anyString(), anyList());
    }

    @Test
    @DisplayName("Scheduled flush drains partial batch")
    void scheduledFlushDrainsPartialBatch() {
        // Send 30 events — below threshold
        for (int i = 0; i < 30; i++) {
            consumer.consume(buildEnvelope("v" + String.format("%03d", i)));
        }

        // Trigger the scheduled flush
        consumer.scheduledFlush();

        // Verify batch was flushed even though < 100 events
        verify(tsdbJdbcTemplate, times(1)).batchUpdate(anyString(), anyList());
    }

    @Test
    @DisplayName("Scheduled flush does nothing when batch is empty")
    void scheduledFlushNoopWhenEmpty() {
        consumer.scheduledFlush();

        verify(tsdbJdbcTemplate, never()).batchUpdate(anyString(), anyList());
    }

    @Test
    @DisplayName("Skips events with null telemetry payload")
    void skipsNullTelemetryPayload() {
        // Send 100 events — all with null telemetry
        for (int i = 0; i < 100; i++) {
            CanonicalTelemetryEnvelope envelope = new CanonicalTelemetryEnvelope();
            envelope.setVehicleId("v" + i);
            envelope.setTimestamp(Instant.now());
            envelope.setTelemetry(null);
            consumer.consume(envelope);
        }

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

        // Should not throw
        for (int i = 0; i < 100; i++) {
            consumer.consume(buildEnvelope("v" + String.format("%03d", i)));
        }

        // Consumer should still accept new events after the error
        consumer.consume(buildEnvelope("v-after-error"));
        // No exception = test passes
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
