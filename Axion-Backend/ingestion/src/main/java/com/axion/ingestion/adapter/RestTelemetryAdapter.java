package com.axion.ingestion.adapter;

import com.axion.ingestion.exception.InvalidPayloadException;
import com.axion.ingestion.model.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;

public class RestTelemetryAdapter implements TelemetryAdapter {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public CanonicalTelemetryEnvelope adapt(String rawPayload) {
        try {
            JsonNode root = mapper.readTree(rawPayload);

            CanonicalTelemetryEnvelope envelope = new CanonicalTelemetryEnvelope();
            envelope.setSchemaVersion("1.0");
            envelope.setVehicleId(root.get("vehicle_id").asText());
            envelope.setVendor(root.path("vendor").asText("UNKNOWN"));
            envelope.setTimestamp(Instant.parse(root.get("timestamp").asText()));
            envelope.setIngestionTs(Instant.now());

            JsonNode telemetryNode = root.path("telemetry");
            TelemetryPayload telemetry = new TelemetryPayload();
            telemetry.setBatterySocPct(telemetryNode.path("battery_soc_pct").asDouble());
            telemetry.setSpeedKmph(telemetryNode.path("speed_kmph").asDouble());
            telemetry.setBatteryTempC(telemetryNode.path("battery_temp_c").asDouble());
            telemetry.setMotorTempC(telemetryNode.path("motor_temp_c").asDouble());
            telemetry.setAmbientTempC(telemetryNode.path("ambient_temp_c").asDouble());
            telemetry.setOdometerKm(telemetryNode.path("odometer_km").asDouble());

            envelope.setTelemetry(telemetry);

            ConnectionMetadata connection = new ConnectionMetadata();
            connection.setProtocol("REST");

            envelope.setConnection(connection);

            return envelope;

        } catch (Exception e) {
            throw new InvalidPayloadException("Malformed or invalid JSON payload");
        }
    }
}
