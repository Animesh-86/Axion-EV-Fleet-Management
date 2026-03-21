package com.axion.ingestion.health;

import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.TelemetrySnapshot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class HealthScoreEngine {

    private final HealthRules rules;

    public HealthScoreEngine(HealthRules rules) {
        this.rules = rules;
    }

    public HealthScoreResult evaluate(DigitalTwinState twin) {
        int score = rules.baseScore;
        List<String> reasons = new ArrayList<>();

        TelemetrySnapshot t = twin.getTelemetry();

        if (t == null) {
            return new HealthScoreResult(0, HealthState.CRITICAL, List.of("No telemetry data available"));
        }

        // ---- Battery SOC ----
        if (t.getBatterySocPct() != null) {
            if (t.getBatterySocPct() < rules.socCritical) {
                score -= rules.penaltyCritical;
                reasons.add("Battery SOC critically low (<" + (int) rules.socCritical + "%)");
            } else if (t.getBatterySocPct() < rules.socWarning) {
                score -= rules.penaltyWarning;
                reasons.add("Battery SOC below optimal range (<" + (int) rules.socWarning + "%)");
            }
        }

        // ---- Battery Temperature ----
        if (t.getBatteryTempC() != null) {
            if (t.getBatteryTempC() > rules.batteryTempCritical) {
                score -= rules.penaltyCritical;
                reasons.add("Battery temperature critically high (>" + (int) rules.batteryTempCritical + "°C)");
            } else if (t.getBatteryTempC() > rules.batteryTempWarning) {
                score -= rules.penaltyWarning;
                reasons.add("Battery temperature above normal (>" + (int) rules.batteryTempWarning + "°C)");
            }
        }

        // ---- Connectivity ----
        if (!twin.isOnline()) {
            score -= rules.penaltyCritical;
            reasons.add("Vehicle offline");
        }

        // Clamp score
        score = Math.max(score, 0);

        HealthState state = deriveState(score);

        log.debug("Health evaluation for {}: score={} state={} reasons={}", twin.getVehicleId(), score, state, reasons);

        return new HealthScoreResult(score, state, reasons);
    }

    private HealthState deriveState(int score) {
        if (score >= 80) {
            return HealthState.HEALTHY;
        } else if (score >= 50) {
            return HealthState.DEGRADED;
        } else {
            return HealthState.CRITICAL;
        }
    }
}