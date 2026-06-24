package com.axion.ingestion;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.axion.ingestion.repository.primary.VehicleRegistryRepository;

@SpringBootTest
class AxionApplicationTests {

	@MockBean
	VehicleRegistryRepository vehicleRegistryRepository;

	@Test
	void contextLoads() {
	}

}
