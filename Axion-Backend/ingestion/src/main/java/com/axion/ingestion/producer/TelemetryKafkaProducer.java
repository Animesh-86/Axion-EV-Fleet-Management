package com.axion.ingestion.producer;

import com.axion.ingestion.exception.IngestionUnavailableException;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
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
        try {
            kafkaTemplate.send(TOPIC, envelope.getVehicleId(), envelope).get();
        } catch (Exception e) {
            throw new IngestionUnavailableException(
                    "Kafka unavailable, telemetry not accepted", e
            );
        }
    }
}
