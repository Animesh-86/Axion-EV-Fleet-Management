package com.axion.fleet.adapter;

import com.axion.fleet.exception.InvalidPayloadException;
import com.axion.fleet.model.CanonicalTelemetryEnvelope;
import com.axion.fleet.model.ConnectionMetadata;
import com.axion.fleet.model.TelemetryPayload;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;

public class RestTelemetryAdapter implements TelemetryAdapter {

    private final ObjectMapper mapper = new ObjectMapper();

    @Override
    public CanonicalTelemetryEnvelope adapt(String rawPayLoad) {
        try {
            JsonNode root = mapper.readTree(rawPayLoad);

            CanonicalTelemetryEnvelope envelope = new CanonicalTelemetryEnvelope();
            envelope.setSchemaVersion("1.0");
            envelope.setVehicleId(root.get("vehicle_id").asText());
            envelope.setVendor(root.path("vendor").asText("UNKNOWN"));
            envelope.setTimestamp(Instant.parse(root.get("timestamp").asText()));
            envelope.setIngestionTs(Instant.now());

            TelemetryPayload telemetry = new TelemetryPayload();
            telemetry.setBatterySocPct(root.path("battery_soc_pct").asDouble());
            telemetry.setSpeedKmph(root.path("speed_kmph").asDouble());

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
