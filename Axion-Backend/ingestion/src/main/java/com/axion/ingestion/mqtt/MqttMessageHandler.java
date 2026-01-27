package com.axion.ingestion.mqtt;

import com.axion.ingestion.adapter.RestTelemetryAdapter;
import com.axion.ingestion.model.CanonicalTelemetryEnvelope;
import com.axion.ingestion.producer.TelemetryKafkaProducer;
import com.axion.ingestion.validation.TelemetryValidator;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;

public class MqttMessageHandler {

    private final RestTelemetryAdapter adapter = new RestTelemetryAdapter();
    private final TelemetryValidator validator = new TelemetryValidator();
    private final TelemetryKafkaProducer producer;

    public MqttMessageHandler(TelemetryKafkaProducer producer) {
        this.producer = producer;
    }

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handle(Message<String> message) {

        String payload = message.getPayload();

        CanonicalTelemetryEnvelope envelope = adapter.adapt(payload);
        envelope.getConnection().setProtocol("MQTT");

        validator.validate(envelope);
        producer.publish(envelope);
    }
}
