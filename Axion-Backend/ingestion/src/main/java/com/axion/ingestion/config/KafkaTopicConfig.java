package com.axion.ingestion.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Kafka topic configuration with explicit partitioning strategy.
 * 
 * Telemetry is partitioned by vehicleId (set as the Kafka message key in
 * TelemetryKafkaProducer.publish). This ensures:
 * - All events for a single vehicle land on the same partition (ordering guarantee)
 * - Multiple consumers can process different vehicle sets in parallel
 * - Consumer group rebalancing preserves per-vehicle event ordering
 */
@Configuration
public class KafkaTopicConfig {

    @Value("${axion.kafka.topic.telemetry:telemetry.normal}")
    private String telemetryTopic;

    @Value("${axion.kafka.topic.ota:ota.events}")
    private String otaTopic;

    @Value("${axion.kafka.topic.dlq:telemetry.dlq}")
    private String dlqTopic;

    @Bean
    public NewTopic telemetryTopic() {
        return TopicBuilder.name(telemetryTopic)
                .partitions(4) // Enables parallel consumer processing by vehicleId hash
                .replicas(1)   // Single broker in dev; production would use replicas(3)
                .build();
    }

    @Bean
    public NewTopic otaTopic() {
        return TopicBuilder.name(otaTopic)
                .partitions(2)
                .replicas(1)
                .build();
    }

    /**
     * Dead Letter Queue for telemetry events that fail deserialization or processing.
     * Events are routed here instead of being silently dropped.
     */
    @Bean
    public NewTopic deadLetterTopic() {
        return TopicBuilder.name(dlqTopic)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
