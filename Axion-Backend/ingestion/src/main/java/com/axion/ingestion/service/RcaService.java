package com.axion.ingestion.service;

import com.axion.ingestion.model.TelemetryHistory;
import com.axion.ingestion.model.dto.RcaEvent;
import com.axion.ingestion.model.primary.OtaJobEntity;
import com.axion.ingestion.repository.primary.OtaJobRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
public class RcaService {

    private final TelemetryHistoryService telemetryHistoryService;
    private final OtaJobRepository otaJobRepository;

    private static final double TEMP_SHIFT_THRESHOLD_C = 5.0;
    private static final double TEMP_CRITICAL_THRESHOLD_C = 45.0;
    private static final double TEMP_WARNING_THRESHOLD_C = 40.0;
    private static final double TEMP_ABSOLUTE_HIGH_C = 48.0;

    public RcaService(TelemetryHistoryService telemetryHistoryService, OtaJobRepository otaJobRepository) {
        this.telemetryHistoryService = telemetryHistoryService;
        this.otaJobRepository = otaJobRepository;
    }

    public List<RcaEvent> getUnifiedTimeline(String vehicleId, Instant from, Instant to) {
        List<RcaEvent> events = new ArrayList<>();

        // 1. Fetch OTA Events from PostgreSQL for target vehicle
        List<OtaJobEntity> otaJobs = otaJobRepository.findByVehicleId(vehicleId);

        for (OtaJobEntity job : otaJobs) {
            String version = job.getCampaign() != null ? job.getCampaign().getTargetVersion() : "unknown";

            if (job.getStartedAt() != null && !job.getStartedAt().isBefore(from) && !job.getStartedAt().isAfter(to)) {
                events.add(RcaEvent.builder()
                        .timestamp(job.getStartedAt())
                        .category("OTA")
                        .severity("INFO")
                        .title("OTA Update Initiated")
                        .detail(String.format("Deployment started for firmware version %s (Job ID: %s)", version, job.getJobId()))
                        .vehicleId(vehicleId)
                        .build());
            }

            if (job.getCompletedAt() != null && !job.getCompletedAt().isBefore(from) && !job.getCompletedAt().isAfter(to)) {
                String severity = "SUCCESS".equals(job.getState()) ? "INFO" :
                                  "ROLLED_BACK".equals(job.getState()) ? "WARNING" : "CRITICAL";

                String title = "SUCCESS".equals(job.getState()) ? "OTA Completed Successfully" :
                               "ROLLED_BACK".equals(job.getState()) ? "OTA Rolled Back" : "OTA Failed";

                events.add(RcaEvent.builder()
                        .timestamp(job.getCompletedAt())
                        .category("OTA")
                        .severity(severity)
                        .title(title)
                        .detail(String.format("Job finished with terminal state: %s. Target firmware: %s", job.getState(), version))
                        .vehicleId(vehicleId)
                        .build());
            }
        }

        // 2. Fetch Telemetry History from TimescaleDB and extract notable shifts
        List<TelemetryHistory> history = telemetryHistoryService.getHistory(vehicleId, from, to);
        
        Double lastTemp = null;
        Integer lastHealthScore = null;
        String lastHealthState = null;

        for (TelemetryHistory item : history) {
            Instant time = item.getTime();

            // Detect Temperature Anomalies / Significant shifts
            if (item.getBatteryTemp() != null) {
                double currentTemp = item.getBatteryTemp();
                if (lastTemp != null && Math.abs(currentTemp - lastTemp) >= TEMP_SHIFT_THRESHOLD_C) {
                    String severity = currentTemp > TEMP_CRITICAL_THRESHOLD_C ? "CRITICAL" : currentTemp > TEMP_WARNING_THRESHOLD_C ? "WARNING" : "INFO";
                    String direction = currentTemp > lastTemp ? "rose" : "dropped";
                    events.add(RcaEvent.builder()
                            .timestamp(time)
                            .category("TELEMETRY")
                            .severity(severity)
                            .title("Battery Temperature Excursion")
                            .detail(String.format("Battery temp %s rapidly from %.1f°C → %.1f°C", direction, lastTemp, currentTemp))
                            .vehicleId(vehicleId)
                            .build());
                    lastTemp = currentTemp;
                } else if (lastTemp == null || currentTemp > TEMP_ABSOLUTE_HIGH_C && lastTemp <= TEMP_ABSOLUTE_HIGH_C) {
                    if (currentTemp > TEMP_ABSOLUTE_HIGH_C) {
                        events.add(RcaEvent.builder()
                                .timestamp(time)
                                .category("TELEMETRY")
                                .severity("CRITICAL")
                                .title("Thermal Overheating Triggered")
                                .detail(String.format("Absolute threshold breach: Core temp reached %.1f°C", currentTemp))
                                .vehicleId(vehicleId)
                                .build());
                        lastTemp = currentTemp;
                    }
                }
                if (lastTemp == null) lastTemp = currentTemp;
            }

            // Detect Health Score / State Drops
            if (item.getHealthState() != null && item.getHealthScore() != null) {
                if (lastHealthState != null && !item.getHealthState().equals(lastHealthState)) {
                    String severity = "CRITICAL".equals(item.getHealthState()) ? "CRITICAL" :
                                      "DEGRADED".equals(item.getHealthState()) ? "WARNING" : "INFO";

                    String title = item.getHealthScore() < (lastHealthScore != null ? lastHealthScore : 100) ?
                            "Health Assessment Dropped" : "Health Assessment Recovered";

                    events.add(RcaEvent.builder()
                            .timestamp(time)
                            .category("HEALTH")
                            .severity(severity)
                            .title(title)
                            .detail(String.format("Overall diagnostic status shifted: %s → %s (Score: %d → %d)",
                                    lastHealthState, item.getHealthState(),
                                    lastHealthScore != null ? lastHealthScore : 0, item.getHealthScore()))
                            .vehicleId(vehicleId)
                            .build());
                }
                lastHealthState = item.getHealthState();
                lastHealthScore = item.getHealthScore();
            }
        }

        // 3. Sort unified list chronologically
        events.sort(Comparator.comparing(RcaEvent::getTimestamp));

        log.info("RCA aggregation complete for {}: merged {} distinct events", vehicleId, events.size());
        return events;
    }
}
