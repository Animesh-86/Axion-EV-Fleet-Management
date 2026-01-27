package com.axion.ingestion.controller;

import com.axion.ingestion.service.TelemetryIngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/telemetry")
public class TelemetryIngestionController {

    private final TelemetryIngestionService ingestionService;

    public TelemetryIngestionController(TelemetryIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping
    public Mono<ResponseEntity<Void>> ingest(@RequestBody String rawPayload) {
        return ingestionService.ingestRest(rawPayload)
                .thenReturn(ResponseEntity.accepted().build());
    }
}
