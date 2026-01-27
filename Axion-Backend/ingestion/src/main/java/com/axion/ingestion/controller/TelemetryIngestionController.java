package com.axion.ingestion.controller;

import com.axion.ingestion.api.TelemetryIngestionRequest;
import com.axion.ingestion.service.TelemetryIngestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/telemetry")
@Tag(name = "Telemetry Ingestion", description = "Vehicle telemetry ingestion APIs")
public class TelemetryIngestionController {

    private final TelemetryIngestionService ingestionService;

    public TelemetryIngestionController(TelemetryIngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @Operation(
            summary = "Ingest vehicle telemetry",
            description = "Accepts raw vehicle telemetry via REST and forwards it to the telemetry pipeline"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "Telemetry accepted"),
            @ApiResponse(responseCode = "400", description = "Invalid JSON payload"),
            @ApiResponse(responseCode = "422", description = "Telemetry validation failed"),
            @ApiResponse(responseCode = "503", description = "Ingestion temporarily unavailable")
    })
    @PostMapping
    public Mono<ResponseEntity<Void>> ingest(
            @RequestBody TelemetryIngestionRequest request) {

        return ingestionService.ingestRest(request.getPayload())
                .thenReturn(ResponseEntity.accepted().build());
    }
}
