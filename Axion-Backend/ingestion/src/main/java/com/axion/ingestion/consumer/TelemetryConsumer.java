package com.axion.ingestion.consumer;

import com.axion.ingestion.service.DigitalTwinService;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class TelemetryConsumer {

    private final DigitalTwinService digitalTwinService;

    public TelemetryConsumer(DigitalTwinService digitalTwinService) {
        this.digitalTwinService = digitalTwinService;
    }

    @KafkaListener(topics = "telemetry.normal", groupId = "digital-twin-updater")
    public void consume(CanonicalTelemetryEnvelope event) {
        System.out.println("CONSUMED EVENT for " + event.getVehicleId());
        digitalTwinService.update(event);
    }
}
