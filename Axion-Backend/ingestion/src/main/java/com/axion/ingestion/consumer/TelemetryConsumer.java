package com.axion.ingestion.consumer;

import com.axion.ingestion.service.DigitalTwinService;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TelemetryConsumer {

    private final DigitalTwinService digitalTwinService;

    public TelemetryConsumer(DigitalTwinService digitalTwinService) {
        this.digitalTwinService = digitalTwinService;
    }

    @KafkaListener(topics = "${axion.kafka.topic.telemetry}", groupId = "${axion.kafka.consumer.group-id}")
    public void consume(CanonicalTelemetryEnvelope event) {
        log.debug("Consumed telemetry event for vehicle: {}", event.getVehicleId());
        digitalTwinService.update(event);
    }
}
