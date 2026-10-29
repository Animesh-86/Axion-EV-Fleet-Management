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
 * Fleet device registry service managing asset lifecycle states,
 * active status caching, and telemetry admission validation.
 */
@Slf4j
@Service
public class VehicleRegistryService {

    private final VehicleRegistryRepository repository;
    private final Set<String> activeVehicleCache = ConcurrentHashMap.newKeySet();

    @org.springframework.beans.factory.annotation.Value("${axion.registry.default-firmware-version:v1.0.0}")
    private String defaultFirmwareVersion;

    public VehicleRegistryService(VehicleRegistryRepository repository) {
        this.repository = repository;
        refreshCache();
    }

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
                .firmwareVersion(defaultFirmwareVersion)
                .lifecycleState("ACTIVE")
                .registeredAt(Instant.now())
                .registeredBy(registeredBy)
                .build();

        VehicleRegistryEntity saved = repository.save(entity);
        activeVehicleCache.add(vehicleId);
        log.info("Vehicle provisioned: id={} profile={} by={}", vehicleId, profile, registeredBy);
        return saved;
    }

    @Transactional
    public int bulkProvision(List<String> vehicleIds, String profile, String registeredBy) {
        int provisioned = 0;
        for (String vehicleId : vehicleIds) {
            if (!repository.existsByVehicleId(vehicleId)) {
                repository.save(VehicleRegistryEntity.builder()
                        .vehicleId(vehicleId)
                        .displayName(vehicleId)
                        .vehicleProfile(profile)
                        .firmwareVersion(defaultFirmwareVersion)
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

    public long countTotal() {
        return repository.count();
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
