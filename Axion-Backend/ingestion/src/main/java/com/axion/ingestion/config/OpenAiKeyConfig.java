package com.axion.ingestion.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@Component
public class OpenAiKeyConfig {

    private static final String PROPERTY_SOURCE_NAME = "openai-file";

    private final ConfigurableEnvironment environment;
    private final String keyFilePath;

    public OpenAiKeyConfig(ConfigurableEnvironment environment,
                           @Value("${axion.openai.key-file:/run/secrets/OPENAI_API_KEY}") String keyFilePath) {
        this.environment = environment;
        this.keyFilePath = keyFilePath;
    }

    @PostConstruct
    public void init() {
        try {
            String key = readKeyFromFile();
            if (key != null && !key.isEmpty()) {
                Map<String, Object> map = new HashMap<>();
                map.put("spring.ai.openai.api-key", key.trim());
                MapPropertySource ps = new MapPropertySource(PROPERTY_SOURCE_NAME, map);
                if (!environment.getPropertySources().contains(PROPERTY_SOURCE_NAME)) {
                    environment.getPropertySources().addFirst(ps);
                }
            }
        } catch (Exception e) {
            // Do not fail startup if secret file not present
        }
    }

    public boolean reload() {
        try {
            String key = readKeyFromFile();
            if (key == null) {
                // remove property source if present
                if (environment.getPropertySources().contains(PROPERTY_SOURCE_NAME)) {
                    environment.getPropertySources().remove(PROPERTY_SOURCE_NAME);
                }
                return false;
            }
            Map<String, Object> map = new HashMap<>();
            map.put("spring.ai.openai.api-key", key.trim());
            MapPropertySource ps = new MapPropertySource(PROPERTY_SOURCE_NAME, map);
            if (environment.getPropertySources().contains(PROPERTY_SOURCE_NAME)) {
                environment.getPropertySources().replace(PROPERTY_SOURCE_NAME, ps);
            } else {
                environment.getPropertySources().addFirst(ps);
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private String readKeyFromFile() {
        try {
            Path p = Path.of(keyFilePath);
            if (Files.exists(p) && Files.isReadable(p)) {
                return Files.readString(p).trim();
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }
}
