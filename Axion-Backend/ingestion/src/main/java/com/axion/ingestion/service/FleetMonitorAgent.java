package com.axion.ingestion.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FleetMonitorAgent {

    private final ChatClient chatClient;

    public FleetMonitorAgent(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    /**
     * Executes autonomously on a schedule. Instructs the LLM to analyze overall fleet state
     * by calling exposed tool beans dynamically and compiling a proactive maintenance digest.
     */
    @Scheduled(fixedRateString = "${axion.agent.monitor.rate-ms:300000}", initialDelay = 60000)
    public void runAutonomousFleetAudit() {
        log.info("Initiating scheduled agentic loop audit sequence using Spring AI Function Calling execution callbacks");
        try {
            String reportText = chatClient.prompt()
                    .user("Evaluate the health state of the entire fleet by invoking your available status query tools. Summarize key risks, list critical vehicle IDs, and outline high-priority infrastructure actions required.")
                    .functions("getVehicleStatus", "getFleetSummary")
                    .call()
                    .content();

            log.info("=== Autonomous GenAI Fleet Health Digest ===\n{}", reportText);
        } catch (Exception e) {
            log.warn("Scheduled Agentic function calling execution loop skipped/deferred: {}", e.getMessage());
        }
    }
}
