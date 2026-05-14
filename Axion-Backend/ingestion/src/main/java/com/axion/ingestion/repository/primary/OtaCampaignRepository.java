package com.axion.ingestion.repository.primary;

import com.axion.ingestion.model.primary.OtaCampaignEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OtaCampaignRepository extends JpaRepository<OtaCampaignEntity, String> {

    List<OtaCampaignEntity> findAllByOrderByCreatedAtDesc();

    List<OtaCampaignEntity> findByStatusIn(List<String> statuses);
}
