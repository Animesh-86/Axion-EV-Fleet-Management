package com.axion.ingestion.config;

import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.*;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Value("${axion.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${axion.kafka.producer.retries}")
    private int retries;

    @Value("${axion.kafka.producer.max-in-flight}")
    private int maxInFlight;

    @Value("${axion.kafka.producer.request-timeout-ms}")
    private int requestTimeoutMs;

    @Value("${axion.kafka.producer.delivery-timeout-ms}")
    private int deliveryTimeoutMs;

    @Bean
    public ProducerFactory<String, CanonicalTelemetryEnvelope> producerFactory() {

        Map<String, Object> props = new HashMap<>();

        // Broker
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);

        // Serialization
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                org.springframework.kafka.support.serializer.JsonSerializer.class);

        // Reliability guarantees
        props.put(ProducerConfig.ACKS_CONFIG, "all");
        props.put(ProducerConfig.RETRIES_CONFIG, retries);
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);

        // Ordering guarantees
        props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, maxInFlight);

        // Timeout tuning
        props.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, requestTimeoutMs);
        props.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, deliveryTimeoutMs);

        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, CanonicalTelemetryEnvelope> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
