package com.axion.ingestion.mqtt;

import com.axion.ingestion.adapter.RestTelemetryAdapter;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.producer.TelemetryKafkaProducer;
import com.axion.ingestion.validation.TelemetryValidator;

public class MqttMessageHandler {

    private final RestTelemetryAdapter adapter = new RestTelemetryAdapter();
    private final TelemetryValidator validator = new TelemetryValidator();
    private final TelemetryKafkaProducer producer;

    public MqttMessageHandler(TelemetryKafkaProducer producer) {
        this.producer = producer;
    }

    public void handle(String payload) {
        CanonicalTelemetryEnvelope envelope = adapter.adapt(payload);
        envelope.getConnection().setProtocol("MQTT");

        validator.validate(envelope);
        producer.publish(envelope);
    }
}
