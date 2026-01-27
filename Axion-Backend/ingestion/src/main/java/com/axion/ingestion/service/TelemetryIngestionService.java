package com.axion.ingestion.service;

import com.axion.ingestion.adapter.RestTelemetryAdapter;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.producer.TelemetryKafkaProducer;
import com.axion.ingestion.validation.TelemetryValidator;
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
