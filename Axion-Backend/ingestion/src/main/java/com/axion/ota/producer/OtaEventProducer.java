package com.axion.ota.producer;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OtaEventProducer {

    private static final String TOPIC = "ota.events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public OtaEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(String vehicleId, Object event) {
        kafkaTemplate.send(TOPIC, vehicleId, event);
    }
}
