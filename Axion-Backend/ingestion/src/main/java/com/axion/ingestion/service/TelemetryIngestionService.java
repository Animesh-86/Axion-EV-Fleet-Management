package com.axion.ingestion.service;

import com.axion.ingestion.adapter.RestTelemetryAdapter;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.producer.TelemetryKafkaProducer;
import com.axion.ingestion.validation.TelemetryValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class TelemetryIngestionService {

    private final RestTelemetryAdapter adapter = new RestTelemetryAdapter();
    private final TelemetryValidator validator = new TelemetryValidator();
    private final TelemetryKafkaProducer producer;
    private final ThroughputTracker throughputTracker;
    private final VehicleRegistryService registryService;

    public TelemetryIngestionService(TelemetryKafkaProducer producer,
                                     ThroughputTracker throughputTracker,
                                     @Autowired(required = false) VehicleRegistryService registryService) {
        this.producer = producer;
        this.throughputTracker = throughputTracker;
        this.registryService = registryService;
    }

    public Mono<Void> ingestRest(String rawPayload) {
        return Mono.fromCallable(() -> {
            CanonicalTelemetryEnvelope envelope = adapter.adapt(rawPayload);
            validator.validate(envelope);

            // Validate against vehicle registry — reject unprovisioned devices
            if (registryService != null && !registryService.isRegistered(envelope.getVehicleId())) {
                log.warn("Telemetry rejected: vehicle {} is not registered in fleet registry", envelope.getVehicleId());
                return true;  // Silent drop — don't crash the simulator
            }

            producer.publish(envelope);
            throughputTracker.recordEvent();
            return true;
        }).then();
    }
}

