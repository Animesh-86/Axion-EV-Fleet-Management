package com.axion.ingestion.service;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class ThroughputTracker {

    private final MeterRegistry meterRegistry;
    private final AtomicLong currentCount = new AtomicLong(0);
    private final AtomicLong lastCount = new AtomicLong(0);
    private volatile double eventsPerSecond = 0.0;

    public ThroughputTracker(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void recordEvent() {
        meterRegistry.counter("axion.telemetry.ingested.total").increment();
        currentCount.incrementAndGet();
    }

    @Scheduled(fixedRate = 1000)
    public void calculateThroughput() {
        long current = currentCount.get();
        eventsPerSecond = (double) (current - lastCount.get());
        lastCount.set(current);
    }

    public double getEventsPerSecond() {
        return eventsPerSecond;
    }

    public long getTotalEvents() {
        return (long) meterRegistry.counter("axion.telemetry.ingested.total").count();
    }
}
