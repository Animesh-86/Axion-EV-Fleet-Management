package com.axion.ingestion.service;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicLong;

@Component
public class ThroughputTracker {

    private final AtomicLong totalEvents = new AtomicLong(0);

    // Sliding window: store counts for last N seconds
    private static final int WINDOW_SECONDS = 5;
    private final AtomicLong[] buckets = new AtomicLong[WINDOW_SECONDS];
    private final AtomicLong currentSecond = new AtomicLong(0);

    public ThroughputTracker() {
        for (int i = 0; i < WINDOW_SECONDS; i++) {
            buckets[i] = new AtomicLong(0);
        }
        currentSecond.set(System.currentTimeMillis() / 1000);
    }

    public void recordEvent() {
        totalEvents.incrementAndGet();
        long now = System.currentTimeMillis() / 1000;
        long prev = currentSecond.get();
        if (now != prev) {
            // Clear buckets for skipped seconds
            for (long s = prev + 1; s <= now; s++) {
                buckets[(int) (s % WINDOW_SECONDS)].set(0);
            }
            currentSecond.set(now);
        }
        buckets[(int) (now % WINDOW_SECONDS)].incrementAndGet();
    }

    public double getEventsPerSecond() {
        long now = System.currentTimeMillis() / 1000;
        long prev = currentSecond.get();

        // Use completed seconds only (exclude current partial second)
        long sum = 0;
        int count = 0;
        for (int i = 1; i < WINDOW_SECONDS; i++) {
            long sec = now - i;
            if (sec <= prev - WINDOW_SECONDS) continue;
            sum += buckets[(int) (sec % WINDOW_SECONDS)].get();
            count++;
        }
        return count > 0 ? (double) sum / count : 0.0;
    }

    public long getTotalEvents() {
        return totalEvents.get();
    }
}
