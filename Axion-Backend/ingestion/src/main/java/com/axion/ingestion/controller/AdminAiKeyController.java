package com.axion.ingestion.controller;

import com.axion.ingestion.config.OpenAiKeyConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/admin/ai")
public class AdminAiKeyController {

    private final OpenAiKeyConfig openAiKeyConfig;

    public AdminAiKeyController(OpenAiKeyConfig openAiKeyConfig) {
        this.openAiKeyConfig = openAiKeyConfig;
    }

    @PostMapping("/reload-key")
    public ResponseEntity<Map<String, Object>> reloadKey() {
        boolean ok = openAiKeyConfig.reload();
        return ResponseEntity.ok(Map.of("reloaded", ok));
    }
}
