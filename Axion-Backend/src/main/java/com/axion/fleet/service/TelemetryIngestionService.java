package com.axion.fleet.service;

import com.axion.fleet.adapter.RestTelemetryAdapter;
import com.axion.fleet.model.CanonicalTelemetryEnvelope;
import com.axion.fleet.model.TelemetryPayload;
import com.axion.fleet.producer.TelemetryKafkaProducer;
import com.axion.fleet.validation.TelemetryValidator;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class TelemetryIngestionService {

    private final RestTelemetryAdapter adapter = new RestTelemetryAdapter();
    private final TelemetryValidator validator = new TelemetryValidator();
    private final TelemetryKafkaProducer producer;

    public TelemetryIngestionService(TelemetryKafkaProducer producer) {
        this.producer = producer;
    }

    public Mono<Void> ingestRest(String rawPayload) {
        return Mono.fromCallable(() -> {
            CanonicalTelemetryEnvelope envelope = adapter.adapt(rawPayload);
            validator.validate(envelope);
            producer.publish(envelope);
            return true;
        }).then();
    }
}
