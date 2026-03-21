package com.axion.ingestion.mqtt;

import com.axion.ingestion.adapter.RestTelemetryAdapter;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.producer.TelemetryKafkaProducer;
import com.axion.ingestion.service.ThroughputTracker;
import com.axion.ingestion.validation.TelemetryValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

import org.springframework.beans.factory.annotation.Autowired;

@Slf4j
@Component
public class MqttMessageHandler {

    private final RestTelemetryAdapter adapter = new RestTelemetryAdapter();
    private final TelemetryValidator validator = new TelemetryValidator();
    private final TelemetryKafkaProducer producer;
    private final ThroughputTracker throughputTracker;

    @Autowired
    public MqttMessageHandler(TelemetryKafkaProducer producer, ThroughputTracker throughputTracker) {
        this.producer = producer;
        this.throughputTracker = throughputTracker;
    }

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handle(Message<String> message) {
        try {
            String payload = message.getPayload();

            CanonicalTelemetryEnvelope envelope = adapter.adapt(payload);
            if (envelope.getConnection() != null) {
                envelope.getConnection().setProtocol("MQTT");
            }

            validator.validate(envelope);
            producer.publish(envelope);
            throughputTracker.recordEvent();
        } catch (Exception e) {
            log.error("Failed to process MQTT message: {}", e.getMessage());
        }
    }
}
