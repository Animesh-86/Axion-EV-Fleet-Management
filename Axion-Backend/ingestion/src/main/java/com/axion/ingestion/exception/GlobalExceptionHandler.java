package com.axion.ingestion.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidPayloadException.class)
    public ResponseEntity<?> handleInvalidPayload(InvalidPayloadException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error("INVALID_PAYLOAD", ex.getMessage()));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidation(ValidationException ex) {
        return ResponseEntity
                .status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(error("VALIDATION_FAILED", ex.getMessage()));
    }

    @ExceptionHandler(IngestionUnavailableException.class)
    public ResponseEntity<?> handleUnavailable(IngestionUnavailableException ex) {
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(error("INGESTION_UNAVAILABLE", ex.getMessage()));
    }

    private Map<String, Object> error(String code, String message) {
        return Map.of(
                "timestamp", Instant.now(),
                "error_code", code,
                "message", message
        );
    }
}
