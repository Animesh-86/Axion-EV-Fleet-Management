package com.axion.ingestion.mqtt;

import com.axion.ingestion.adapter.RestTelemetryAdapter;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.producer.TelemetryProducer;
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

    private final RestTelemetryAdapter adapter;
    private final TelemetryValidator validator;
    private final TelemetryProducer producer;
    private final ThroughputTracker throughputTracker;
    private final com.axion.ingestion.service.VehicleRegistryService registryService;

    @Autowired
    public MqttMessageHandler(RestTelemetryAdapter adapter,
                              TelemetryValidator validator,
                              TelemetryProducer producer, 
                              ThroughputTracker throughputTracker,
                              @Autowired(required = false) com.axion.ingestion.service.VehicleRegistryService registryService) {
        this.adapter = adapter;
        this.validator = validator;
        this.producer = producer;
        this.throughputTracker = throughputTracker;
        this.registryService = registryService;
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

            if (registryService != null && !registryService.isRegistered(envelope.getVehicleId())) {
                log.warn("MQTT Telemetry rejected: vehicle {} is not registered", envelope.getVehicleId());
                return;
            }

            producer.publishAsync(envelope);
            throughputTracker.recordEvent();
        } catch (Exception e) {
            log.error("Failed to process MQTT message: {}", e.getMessage());
        }
    }
}
