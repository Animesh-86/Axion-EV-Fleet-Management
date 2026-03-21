package com.axion.ota.service;

import com.axion.ota.model.*;
import com.axion.ota.producer.OtaEventProducer;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class OtaOrchestratorService {

    private final OtaEventProducer producer;

    public OtaOrchestratorService(OtaEventProducer producer) {
        this.producer = producer;
    }

    public OtaJob startJob(String campaignId, String vehicleId) {

        OtaJob job = new OtaJob();
        job.setJobId(UUID.randomUUID().toString());
        job.setCampaignId(campaignId);
        job.setVehicleId(vehicleId);
        job.setState(OtaState.IN_PROGRESS);
        job.setStartedAt(Instant.now());

        producer.publish(vehicleId,
                "OTA_STARTED:" + job.getJobId());

        // ---- SIMULATION ----
        simulateOutcome(job);

        return job;
    }

    private void simulateOutcome(OtaJob job) {

        boolean success = Math.random() > 0.2; // 80% success

        if (success) {
            job.setState(OtaState.SUCCESS);
            job.setCompletedAt(Instant.now());
            producer.publish(job.getVehicleId(),
                    "OTA_SUCCESS:" + job.getJobId());
        } else {
            job.setState(OtaState.FAILED);
            producer.publish(job.getVehicleId(),
                    "OTA_FAILED:" + job.getJobId());

            rollback(job);
        }
    }

    private void rollback(OtaJob job) {
        job.setState(OtaState.ROLLED_BACK);
        producer.publish(job.getVehicleId(),
                "OTA_ROLLED_BACK:" + job.getJobId());
    }
}
