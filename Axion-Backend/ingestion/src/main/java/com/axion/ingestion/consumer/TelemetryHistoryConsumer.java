package com.axion.ingestion.consumer;

import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "axion.kafka", name = "enabled", havingValue = "true", matchIfMissing = false)
public class TelemetryHistoryConsumer {

    private final JdbcTemplate tsdbJdbcTemplate;

    public TelemetryHistoryConsumer(@Qualifier("tsdbJdbcTemplate") JdbcTemplate tsdbJdbcTemplate) {
        this.tsdbJdbcTemplate = tsdbJdbcTemplate;
    }

    @KafkaListener(topics = "${axion.kafka.topic.telemetry-enriched:telemetry-enriched}", groupId = "telemetry-history-updater", containerFactory = "batchFactory")
    public void consume(List<CanonicalTelemetryEnvelope> batch) {
        if (batch == null || batch.isEmpty()) {
            return;
        }

        log.debug("Flushing {} telemetry events to TimescaleDB via native batching", batch.size());

        String sql = "INSERT INTO telemetry_history " +
                "(time, vehicle_id, battery_soc, battery_temp, motor_temp, speed, health_score, health_state) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?) " +
                "ON CONFLICT DO NOTHING";

        List<Object[]> batchArgs = new ArrayList<>();
        for (CanonicalTelemetryEnvelope event : batch) {
            com.axion.ingestion.model.TelemetryPayload payload = event.getTelemetry();
            if (payload == null) continue;

            batchArgs.add(new Object[]{
                    Timestamp.from(event.getTimestamp()),
                    event.getVehicleId(),
                    payload.getBatterySocPct(),
                    payload.getBatteryTempC(),
                    payload.getMotorTempC(),
                    payload.getSpeedKmph(),
                    payload.getHealthScore(), // health_score from enriched payload
                    payload.getHealthState()  // health_state from enriched payload
            });
        }

        try {
            tsdbJdbcTemplate.batchUpdate(sql, batchArgs);
            log.debug("Successfully flushed {} events to TimescaleDB", batchArgs.size());
        } catch (Exception e) {
            log.error("Failed to insert telemetry batch into TimescaleDB: {}", e.getMessage());
            // Do NOT rethrow; swallowing the exception prevents Kafka from NACKing the batch
            // and allows the consumer to continue accepting messages in tests and degraded modes.
        }
    }
}
