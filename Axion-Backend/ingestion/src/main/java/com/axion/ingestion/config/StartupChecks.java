package com.axion.ingestion.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class StartupChecks {

    @Value("${axion.require-secrets:true}")
    private boolean requireSecrets;

    @Value("${spring.ai.openai.api-key:}")
    private String openAiKey;

    @Value("${axion.jwt.secret:}")
    private String jwtSecret;

    @EventListener(ApplicationReadyEvent.class)
    public void validateSecrets() {
        if (!requireSecrets) return;

        if (openAiKey == null || openAiKey.isBlank() || "disabled".equalsIgnoreCase(openAiKey)) {
            log.warn("OPENAI API key (spring.ai.openai.api-key) is not configured or disabled; AI fallback mode is active.");
        }

        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("Startup secret validation failed: JWT secret (axion.jwt.secret) is not configured.");
        }
    }
}
