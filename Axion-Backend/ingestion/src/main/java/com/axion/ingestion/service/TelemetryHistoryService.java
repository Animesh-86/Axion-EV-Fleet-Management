package com.axion.ingestion.service;

import com.axion.ingestion.exception.ValidationException;
import com.axion.ingestion.model.TelemetryHistory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class TelemetryHistoryService {

    private static final Map<String, String> ALLOWED_INTERVALS = Map.of(
            "5m", "5 minute", "15m", "15 minute", "30m", "30 minute",
            "1h", "1 hour", "6h", "6 hour", "12h", "12 hour", "24h", "24 hour"
    );

    private static final RowMapper<TelemetryHistory> TELEMETRY_ROW_MAPPER = (rs, rowNum) -> TelemetryHistory.builder()
            .time(rs.getTimestamp("time").toInstant())
            .vehicleId(rs.getString("vehicle_id"))
            .batterySoc(rs.getDouble("battery_soc"))
            .batteryTemp(rs.getDouble("battery_temp"))
            .motorTemp(rs.getDouble("motor_temp"))
            .speed(rs.getDouble("speed"))
            .healthScore(rs.getInt("health_score"))
            .healthState(rs.getString("health_state"))
            .build();

    private final JdbcTemplate tsdbJdbcTemplate;

    public TelemetryHistoryService(@Qualifier("tsdbJdbcTemplate") JdbcTemplate tsdbJdbcTemplate) {
        this.tsdbJdbcTemplate = tsdbJdbcTemplate;
    }

    public List<TelemetryHistory> getHistory(String vehicleId, Instant from, Instant to) {
        String sql = "SELECT time, vehicle_id, battery_soc, battery_temp, motor_temp, speed, health_score, health_state " +
                "FROM telemetry_history " +
                "WHERE vehicle_id = ? AND time >= ? AND time <= ? " +
                "ORDER BY time ASC";

        return tsdbJdbcTemplate.query(sql, TELEMETRY_ROW_MAPPER, vehicleId, Timestamp.from(from), Timestamp.from(to));
    }

    public List<TelemetryHistory> getAggregates(String vehicleId, String intervalStr) {
        String parsedInterval = ALLOWED_INTERVALS.get(intervalStr);
        if (parsedInterval == null) {
            throw new ValidationException(
                    "Invalid interval '" + intervalStr + "'. Allowed: " + ALLOWED_INTERVALS.keySet());
        }

        String sql = "SELECT time_bucket(?::interval, time) AS time, " +
                "vehicle_id, " +
                "AVG(battery_soc) AS battery_soc, " +
                "AVG(battery_temp) AS battery_temp, " +
                "AVG(motor_temp) AS motor_temp, " +
                "AVG(speed) AS speed, " +
                "AVG(health_score) AS health_score, " +
                "MAX(health_state) AS health_state " +
                "FROM telemetry_history " +
                "WHERE vehicle_id = ? " +
                "GROUP BY time, vehicle_id " +
                "ORDER BY time ASC";

        return tsdbJdbcTemplate.query(sql, TELEMETRY_ROW_MAPPER, parsedInterval, vehicleId);
    }
}
