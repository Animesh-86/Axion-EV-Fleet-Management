package com.axion.ingestion.health;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.List;

@RequiredArgsConstructor
@Getter
@Setter
public class HealthScoreResult {

    private final int score;
    private final HealthState state;
    private final List<String> explanations;
}
