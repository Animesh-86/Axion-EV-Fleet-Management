package com.axion.ingestion.service;

import com.axion.ingestion.model.primary.VehicleRegistryEntity;
import com.axion.ingestion.repository.primary.VehicleRegistryRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Vehicle Registry — Manages the lifecycle of known fleet devices.
 *
 * Addresses the architectural gap where digital twins were created implicitly
 * from any vehicleId that appeared in telemetry. Now the ingestion path can
 * validate that a vehicle is registered before accepting its data.
 *
 * Uses an in-memory cache (ConcurrentHashMap) for O(1) validation on the
 * hot ingestion path, backed by PostgreSQL for persistence.
 */
@Slf4j
@Service
public class VehicleRegistryService {

    private final VehicleRegistryRepository repository;

    /**
     * Hot-path cache: vehicleIds of ACTIVE vehicles.
     * Refreshed on registration/decommission. Avoids DB hit per telemetry event.
     */
    private final Set<String> activeVehicleCache = ConcurrentHashMap.newKeySet();

    public VehicleRegistryService(VehicleRegistryRepository repository) {
        this.repository = repository;
        refreshCache();
    }

    /**
     * Validates whether a vehicleId is registered and active.
     * Called on the telemetry ingestion hot path — must be O(1).
     */
    public boolean isRegistered(String vehicleId) {
        return activeVehicleCache.contains(vehicleId);
    }

    @Transactional
    public VehicleRegistryEntity provision(String vehicleId, String profile, String registeredBy) {
        if (repository.existsByVehicleId(vehicleId)) {
            log.warn("Vehicle {} already registered, returning existing", vehicleId);
            return repository.findById(vehicleId).orElseThrow();
        }

        VehicleRegistryEntity entity = VehicleRegistryEntity.builder()
                .vehicleId(vehicleId)
                .displayName(vehicleId)
                .vehicleProfile(profile)
                .firmwareVersion("v1.0.0")
                .lifecycleState("ACTIVE")
                .registeredAt(Instant.now())
                .registeredBy(registeredBy)
                .build();

        VehicleRegistryEntity saved = repository.save(entity);
        activeVehicleCache.add(vehicleId);
        log.info("Vehicle provisioned: id={} profile={} by={}", vehicleId, profile, registeredBy);
        return saved;
    }

    /**
     * Bulk provision — used by the simulator bootstrap to register all
     * vehicles from fleet.yaml before telemetry emission begins.
     */
    @Transactional
    public int bulkProvision(List<String> vehicleIds, String profile, String registeredBy) {
        int provisioned = 0;
        for (String vehicleId : vehicleIds) {
            if (!repository.existsByVehicleId(vehicleId)) {
                repository.save(VehicleRegistryEntity.builder()
                        .vehicleId(vehicleId)
                        .displayName(vehicleId)
                        .vehicleProfile(profile)
                        .firmwareVersion("v1.0.0")
                        .lifecycleState("ACTIVE")
                        .registeredAt(Instant.now())
                        .registeredBy(registeredBy)
                        .build());
                activeVehicleCache.add(vehicleId);
                provisioned++;
            }
        }
        log.info("Bulk provisioned {} vehicles with profile={}", provisioned, profile);
        return provisioned;
    }

    @Transactional
    public VehicleRegistryEntity decommission(String vehicleId) {
        VehicleRegistryEntity entity = repository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found: " + vehicleId));
        entity.setLifecycleState("DECOMMISSIONED");
        repository.save(entity);
        activeVehicleCache.remove(vehicleId);
        log.info("Vehicle decommissioned: {}", vehicleId);
        return entity;
    }

    public List<VehicleRegistryEntity> listAll() {
        return repository.findAll();
    }

    public List<VehicleRegistryEntity> listByState(String state) {
        return repository.findByLifecycleState(state);
    }

    public Optional<VehicleRegistryEntity> findById(String vehicleId) {
        return repository.findById(vehicleId);
    }

    public long countActive() {
        return activeVehicleCache.size();
    }

    @Transactional
    public void updateLastSeen(String vehicleId) {
        repository.findById(vehicleId).ifPresent(entity -> {
            entity.setLastSeenAt(Instant.now());
            repository.save(entity);
        });
    }

    private void refreshCache() {
        try {
            List<VehicleRegistryEntity> active = repository.findByLifecycleState("ACTIVE");
            activeVehicleCache.clear();
            active.forEach(v -> activeVehicleCache.add(v.getVehicleId()));
            log.info("Vehicle registry cache initialized with {} active vehicles", activeVehicleCache.size());
        } catch (Exception e) {
            log.warn("Vehicle registry cache initialization deferred: {}", e.getMessage());
        }
    }
}
