package com.axion.ingestion.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.binder.MeterBinder;
import lombok.Getter;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.atomic.AtomicInteger;

@Configuration
@Getter
public class AxionMetricsConfiguration implements MeterBinder {

    private Counter telemetryIngestedCounter;
    private AtomicInteger kafkaConsumerLagGauge = new AtomicInteger(0);
    private AtomicInteger activeOtaCampaignsGauge = new AtomicInteger(1);
    private Timer apiLatencyTimer;

    @Override
    public void bindTo(MeterRegistry meterRegistry) {
        this.telemetryIngestedCounter = Counter.builder("axion_telemetry_ingested_total")
                .description("Total telemetry messages processed across all EV nodes")
                .register(meterRegistry);

        Gauge.builder("axion_kafka_consumer_lag", kafkaConsumerLagGauge, AtomicInteger::get)
                .description("Estimated lag across digital twin Kafka consumer groups")
                .register(meterRegistry);

        Gauge.builder("axion_ota_campaigns_active", activeOtaCampaignsGauge, AtomicInteger::get)
                .description("Currently active over-the-air firmware update campaigns")
                .register(meterRegistry);

        this.apiLatencyTimer = Timer.builder("axion_api_latency_seconds")
                .description("API gateway request execution duration and distribution summary")
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(meterRegistry);
    }

    public void incrementTelemetryCount() {
        if (telemetryIngestedCounter != null) {
            telemetryIngestedCounter.increment();
        }
    }

    public void setConsumerLag(int lag) {
        if (kafkaConsumerLagGauge != null) {
            kafkaConsumerLagGauge.set(lag);
        }
    }

    public void setActiveCampaigns(int count) {
        if (activeOtaCampaignsGauge != null) {
            activeOtaCampaignsGauge.set(count);
        }
    }
}
