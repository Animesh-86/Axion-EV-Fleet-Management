package com.axion.ingestion.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Structured schema output target used by Spring AI to guarantee parsable POJOs
 * without brittle regular expression matching.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyExplanation {

    @JsonProperty(required = true, value = "severity")
    private String severity; // WARNING, CRITICAL

    @JsonProperty(required = true, value = "summary")
    private String summary;

    @JsonProperty(required = true, value = "rootCause")
    private String rootCause;

    @JsonProperty(required = true, value = "recommendedAction")
    private String recommendedAction;

    @JsonProperty(required = true, value = "confidenceScore")
    private Double confidenceScore;
}
