package com.axion.ingestion.health;

import com.axion.ingestion.model.DigitalTwinState;
import com.axion.ingestion.model.TelemetrySnapshot;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class HealthScoreEngine {

    public HealthScoreResult evaluate(DigitalTwinState twin) {
        int score = 100;
        List<String> reasons = new ArrayList<>();

        TelemetrySnapshot t = twin.getTelemetry();

        // ---- Battery SOC ----
        if (t.getBatterySocPct() != null) {
            if (t.getBatterySocPct() < HealthRules.SOC_CRITICAL) {
                score -= HealthRules.PENALTY_CRITICAL;
                reasons.add("Battery SOC critically low (<15%)");
            } else if (t.getBatterySocPct() < HealthRules.SOC_WARNING) {
                score -= HealthRules.PENALTY_WARNING;
                reasons.add("Battery SOC below optimal range (<30%)");
            }
        }

        // ---- Battery Temperature ----
        if (t.getBatteryTempC() != null) {
            if (t.getBatteryTempC() > HealthRules.BATTERY_TEMP_CRITICAL) {
                score -= HealthRules.PENALTY_CRITICAL;
                reasons.add("Battery temperature critically high (>55°C)");
            } else if (t.getBatteryTempC() > HealthRules.BATTERY_TEMP_WARNING) {
                score -= HealthRules.PENALTY_WARNING;
                reasons.add("Battery temperature above normal (>45°C)");
            }
        }

        // ---- Connectivity ----
        if (!twin.isOnline()) {
            score -= HealthRules.PENALTY_CRITICAL;
            reasons.add("Vehicle offline");
        }

        // Clamp score
        score = Math.max(score, 0);

        HealthState state = deriveState(score);

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