package com.axion.ingestion.repository.primary;

import com.axion.ingestion.model.primary.AnomalyExplanationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnomalyExplanationRepository extends JpaRepository<AnomalyExplanationEntity, String> {
    List<AnomalyExplanationEntity> findByVehicleIdOrderByCreatedAtDesc(String vehicleId);
}
