package com.axion.ingestion.consumer;

import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

@Slf4j
@Component
public class TelemetryHistoryConsumer {

    private final JdbcTemplate tsdbJdbcTemplate;
    private final List<CanonicalTelemetryEnvelope> batch = new ArrayList<>();
    private final ReentrantLock lock = new ReentrantLock();
    private static final int BATCH_SIZE = 100;

    public TelemetryHistoryConsumer(@Qualifier("tsdbJdbcTemplate") JdbcTemplate tsdbJdbcTemplate) {
        this.tsdbJdbcTemplate = tsdbJdbcTemplate;
    }

    @KafkaListener(topics = "${axion.kafka.topic.telemetry}", groupId = "telemetry-history-updater")
    public void consume(CanonicalTelemetryEnvelope event) {
        lock.lock();
        try {
            batch.add(event);
            if (batch.size() >= BATCH_SIZE) {
                flushBatch();
            }
        } finally {
            lock.unlock();
        }
    }

    /**
     * Scheduled flush ensures partial batches are always persisted.
     * Without this, if exactly 99 events arrive and then traffic stops,
     * those events would never be written to TimescaleDB.
     */
    @Scheduled(fixedDelayString = "${axion.tsdb.flush-interval-ms:5000}")
    public void scheduledFlush() {
        lock.lock();
        try {
            if (!batch.isEmpty()) {
                log.debug("Scheduled flush triggered for {} pending events", batch.size());
                flushBatch();
            }
        } finally {
            lock.unlock();
        }
    }

    private void flushBatch() {
        if (batch.isEmpty()) {
            return;
        }
        
        int batchSize = batch.size();
        log.debug("Flushing {} telemetry events to TimescaleDB", batchSize);
        
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
                    null, // health_score
                    null  // health_state
            });
        }
        
        try {
            tsdbJdbcTemplate.batchUpdate(sql, batchArgs);
            log.debug("Successfully flushed {} events to TimescaleDB", batchArgs.size());
        } catch (Exception e) {
            log.error("Failed to insert telemetry batch into TimescaleDB: {}", e.getMessage());
        }
        
        batch.clear();
    }
}
