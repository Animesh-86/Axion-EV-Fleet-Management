package com.axion.ingestion.service;

import com.axion.ingestion.adapter.RestTelemetryAdapter;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.producer.TelemetryProducer;
import com.axion.ingestion.validation.TelemetryValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class TelemetryIngestionService {

    private final RestTelemetryAdapter adapter;
    private final TelemetryValidator validator;
    private final TelemetryProducer producer;
    private final ThroughputTracker throughputTracker;
    private final VehicleRegistryService registryService;

    public TelemetryIngestionService(RestTelemetryAdapter adapter,
                                     TelemetryValidator validator,
                                     TelemetryProducer producer,
                                     ThroughputTracker throughputTracker,
                                     @Autowired(required = false) VehicleRegistryService registryService) {
        this.adapter = adapter;
        this.validator = validator;
        this.producer = producer;
        this.throughputTracker = throughputTracker;
        this.registryService = registryService;
    }

    public Mono<Void> ingestRest(CanonicalTelemetryEnvelope envelope) {
        return Mono.defer(() -> {
            try {
                validator.validate(envelope);

                // Validate against vehicle registry — reject unprovisioned devices
                if (registryService != null && !registryService.isRegistered(envelope.getVehicleId())) {
                    log.warn("Telemetry rejected: vehicle {} is not registered in fleet registry", envelope.getVehicleId());
                    return Mono.empty();  // Silent drop — don't crash the simulator
                }

                throughputTracker.recordEvent();
                return Mono.fromFuture(producer.publishAsync(envelope));
            } catch (Exception e) {
                return Mono.error(e);
            }
        });
    }
}

