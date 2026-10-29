package com.axion.ingestion.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FleetMonitorAgent {

    private final ChatClient.Builder chatClientBuilder;

    @Value("${axion.agent.monitor.enabled:false}")
    private boolean enabled;

    public FleetMonitorAgent(@Autowired(required = false) ChatClient.Builder chatClientBuilder) {
        this.chatClientBuilder = chatClientBuilder;
    }

    @Scheduled(fixedRateString = "${axion.agent.monitor.rate-ms:300000}", initialDelay = 60000)
    public void runAutonomousFleetAudit() {
        if (!enabled) {
            log.debug("FleetMonitorAgent skipped because axion.agent.monitor.enabled=false");
            return;
        }

        if (chatClientBuilder == null) {
            log.debug("FleetMonitorAgent skipped because ChatClient.Builder is not configured");
            return;
        }

        log.info("Initiating scheduled agentic fleet audit");
        try {
            String reportText = chatClientBuilder.build().prompt()
                    .user("Evaluate the health state of the entire fleet by invoking your available status query tools. Summarize key risks, list critical vehicle IDs, and outline high-priority infrastructure actions required.")
                    .functions("getVehicleStatus", "getFleetSummary")
                    .call()
                    .content();

            log.info("Autonomous Fleet Health Digest:\n{}", reportText);
        } catch (Exception e) {
            log.warn("Scheduled fleet audit loop deferred: {}", e.getMessage());
        }
    }
}
