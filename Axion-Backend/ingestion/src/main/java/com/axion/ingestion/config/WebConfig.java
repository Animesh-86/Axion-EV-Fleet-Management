package com.axion.ingestion.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS is configured centrally via {@link com.axion.ingestion.security.SecurityConfig#corsConfigurationSource()}.
 * This class is intentionally empty to avoid duplicate/conflicting CORS registrations.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // Intentionally empty — CORS is managed by SecurityConfig
}
