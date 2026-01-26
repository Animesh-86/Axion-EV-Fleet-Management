package com.axion.fleet.config;

import com.axion.fleet.model.CanonicalTelemetryEnvelope;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.*;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaProducerConfig {

    @Bean
    public ProducerFactory<String, CanonicalTelemetryEnvelope> producerFactory() {

        Map<String, Object> props = new HashMap<>();

        // Broker
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");

        // Serialization
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                org.springframework.kafka.support.serializer.JacksonJsonSerializer.class);

        // Reliability guarantees
        props.put(ProducerConfig.ACKS_CONFIG, "all"); // Leader + ISR
        props.put(ProducerConfig.RETRIES_CONFIG, 5); // Retry transient failures
        props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);

        // Ordering guarantees
        props.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);

        // Timeout tuning
        props.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 30000);
        props.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 120000);

        return new DefaultKafkaProducerFactory<>(props);
    }

    @Bean
    public KafkaTemplate<String, CanonicalTelemetryEnvelope> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
