package com.axion.ota.producer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OtaEventProducer {

    @Value("${axion.kafka.topic.ota-events}")
    private String topic;

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OtaEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(String vehicleId, Object event) {
        kafkaTemplate.send(topic, vehicleId, event);
    }
}
