package com.axion.ingestion.repository.primary;

import com.axion.ingestion.model.primary.OtaJobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OtaJobRepository extends JpaRepository<OtaJobEntity, String> {

    List<OtaJobEntity> findByCampaign_CampaignId(String campaignId);

    long countByCampaign_CampaignIdAndState(String campaignId, String state);
}
