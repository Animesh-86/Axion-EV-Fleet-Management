package com.axion.ingestion.consumer;

import com.axion.ingestion.service.DigitalTwinService;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "axion.kafka", name = "enabled", havingValue = "true", matchIfMissing = false)
public class TelemetryConsumer {

    private final DigitalTwinService digitalTwinService;

    public TelemetryConsumer(DigitalTwinService digitalTwinService) {
        this.digitalTwinService = digitalTwinService;
    }

    @KafkaListener(topics = "${axion.kafka.topic.telemetry}", groupId = "${axion.kafka.consumer.group-id}")
    public void consume(CanonicalTelemetryEnvelope event) {
        log.info("Consumed telemetry event for vehicle: {}", event.getVehicleId());
        digitalTwinService.update(event);
    }
}
