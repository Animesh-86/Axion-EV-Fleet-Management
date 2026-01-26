package com.axion.fleet.mqtt;


import com.axion.fleet.adapter.RestTelemetryAdapter;
import com.axion.fleet.model.CanonicalTelemetryEnvelope;
import com.axion.fleet.producer.TelemetryKafkaProducer;
import com.axion.fleet.validation.TelemetryValidator;

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