package com.axion.fleet.controller;

import com.axion.fleet.service.TelemetryIngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/telemetry")
public class TelemertryIngestioncontroller {

    private final TelemetryIngestionService ingestionService;

    public TelemertryIngestioncontroller(TelemetryIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping
    public Mono<ResponseEntity<Void>> ingest(@RequestBody String rawPayload) {
        return ingestionService.ingestRest(rawPayload)
                .thenReturn(ResponseEntity.accepted().build());
    }
}
