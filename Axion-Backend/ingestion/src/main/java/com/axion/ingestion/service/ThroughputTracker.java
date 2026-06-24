package com.axion.ingestion.service;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class ThroughputTracker {

    private final MeterRegistry meterRegistry;

    public ThroughputTracker(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void recordEvent() {
        meterRegistry.counter("axion.telemetry.ingested.total").increment();
    }

    public double getEventsPerSecond() {
        // Handled by Prometheus/Grafana natively via Micrometer metrics
        return 0.0; 
    }

    public long getTotalEvents() {
        return (long) meterRegistry.counter("axion.telemetry.ingested.total").count();
    }
}
