package com.axion.ingestion.exception;

public class IngestionUnavailableException extends RuntimeException {
    public IngestionUnavailableException(String message) {
        super(message);
    }
}
