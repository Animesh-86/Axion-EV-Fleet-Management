package com.axion.ingestion.producer;

import com.axion.ingestion.exception.IngestionUnavailableException;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class TelemetryKafkaProducer {

    @Value("${axion.kafka.topic.telemetry}")
    private String topic;

    private final KafkaTemplate<String, CanonicalTelemetryEnvelope> kafkaTemplate;

    public TelemetryKafkaProducer(KafkaTemplate<String, CanonicalTelemetryEnvelope> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(CanonicalTelemetryEnvelope envelope) {
        try {
            kafkaTemplate.send(topic, envelope.getVehicleId(), envelope).get();
        } catch (Exception e) {
            throw new IngestionUnavailableException(
                    "Kafka unavailable, telemetry not accepted", e
            );
        }
    }
}
