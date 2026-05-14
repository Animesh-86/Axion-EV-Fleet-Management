package com.axion.ingestion.service;

import com.axion.ingestion.model.TelemetryHistory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
public class TelemetryHistoryService {

    private final JdbcTemplate tsdbJdbcTemplate;

    public TelemetryHistoryService(@Qualifier("tsdbJdbcTemplate") JdbcTemplate tsdbJdbcTemplate) {
        this.tsdbJdbcTemplate = tsdbJdbcTemplate;
    }

    public List<TelemetryHistory> getHistory(String vehicleId, Instant from, Instant to) {
        String sql = "SELECT time, vehicle_id, battery_soc, battery_temp, motor_temp, speed, health_score, health_state " +
                "FROM telemetry_history " +
                "WHERE vehicle_id = ? AND time >= ? AND time <= ? " +
                "ORDER BY time ASC";

        return tsdbJdbcTemplate.query(sql,
                new Object[]{vehicleId, Timestamp.from(from), Timestamp.from(to)},
                (rs, rowNum) -> TelemetryHistory.builder()
                        .time(rs.getTimestamp("time").toInstant())
                        .vehicleId(rs.getString("vehicle_id"))
                        .batterySoc(rs.getDouble("battery_soc"))
                        .batteryTemp(rs.getDouble("battery_temp"))
                        .motorTemp(rs.getDouble("motor_temp"))
                        .speed(rs.getDouble("speed"))
                        .healthScore(rs.getInt("health_score"))
                        .healthState(rs.getString("health_state"))
                        .build());
    }

    public List<TelemetryHistory> getAggregates(String vehicleId, String intervalStr) {
        // Example intervalStr: '1 hour', '15 minutes'
        String sql = "SELECT time_bucket(?::interval, time) AS bucket, " +
                "vehicle_id, " +
                "AVG(battery_soc) AS battery_soc, " +
                "AVG(battery_temp) AS battery_temp, " +
                "AVG(motor_temp) AS motor_temp, " +
                "AVG(speed) AS speed, " +
                "AVG(health_score) AS health_score, " +
                "MAX(health_state) AS health_state " + // Approximation for state
                "FROM telemetry_history " +
                "WHERE vehicle_id = ? " +
                "GROUP BY bucket, vehicle_id " +
                "ORDER BY bucket ASC";

        // Defaulting interval to '1 hour' if simple '1h' is passed.
        String parsedInterval = intervalStr.replace("h", " hour").replace("m", " minute");
        
        return tsdbJdbcTemplate.query(sql,
                new Object[]{parsedInterval, vehicleId},
                (rs, rowNum) -> TelemetryHistory.builder()
                        .time(rs.getTimestamp("bucket").toInstant())
                        .vehicleId(rs.getString("vehicle_id"))
                        .batterySoc(rs.getDouble("battery_soc"))
                        .batteryTemp(rs.getDouble("battery_temp"))
                        .motorTemp(rs.getDouble("motor_temp"))
                        .speed(rs.getDouble("speed"))
                        .healthScore(rs.getInt("health_score"))
                        .healthState(rs.getString("health_state"))
                        .build());
    }
}
