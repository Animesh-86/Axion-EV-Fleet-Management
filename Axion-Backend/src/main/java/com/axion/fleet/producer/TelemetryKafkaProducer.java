package com.axion.fleet.producer;

import com.axion.fleet.model.CanonicalTelemetryEnvelope;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class TelemetryKafkaProducer {

    private static final String TOPIC = "telemetry.normal";

    private final KafkaTemplate<String, CanonicalTelemetryEnvelope> kafkaTemplate;

    public TelemetryKafkaProducer(KafkaTemplate<String, CanonicalTelemetryEnvelope> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(CanonicalTelemetryEnvelope envelope) {
        kafkaTemplate.send(TOPIC, envelope.getVehicleId(), envelope);
    }
}
