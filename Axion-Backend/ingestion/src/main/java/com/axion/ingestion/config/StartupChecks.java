package com.axion.ingestion.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

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

        StringBuilder missing = new StringBuilder();
        if (openAiKey == null || openAiKey.isBlank()) {
            missing.append("OPENAI API key (spring.ai.openai.api-key) is not configured. ");
        }
        if (jwtSecret == null || jwtSecret.isBlank()) {
            missing.append("JWT secret (axion.jwt.secret) is not configured. ");
        }

        if (missing.length() > 0) {
            throw new IllegalStateException("Startup secret validation failed: " + missing.toString());
        }
    }
}
