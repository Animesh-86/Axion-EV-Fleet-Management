package com.axion.ingestion.repository.primary;

import com.axion.ingestion.model.primary.VehicleRegistryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRegistryRepository extends JpaRepository<VehicleRegistryEntity, String> {

    List<VehicleRegistryEntity> findByLifecycleState(String lifecycleState);

    boolean existsByVehicleId(String vehicleId);

    long countByLifecycleState(String lifecycleState);
}
