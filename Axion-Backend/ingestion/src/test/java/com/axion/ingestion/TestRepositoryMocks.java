package com.axion.ingestion;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Configuration
@ConditionalOnProperty(prefix = "axion.datasource", name = "enabled", havingValue = "false", matchIfMissing = true)
public class TestRepositoryMocks {

    @Bean
    public com.axion.ingestion.repository.primary.UserRepository userRepository() {
        return createProxy(com.axion.ingestion.repository.primary.UserRepository.class);
    }

    @Bean
    public com.axion.ingestion.repository.primary.OtaCampaignRepository otaCampaignRepository() {
        return createProxy(com.axion.ingestion.repository.primary.OtaCampaignRepository.class);
    }

    @Bean
    public com.axion.ingestion.repository.primary.OtaJobRepository otaJobRepository() {
        return createProxy(com.axion.ingestion.repository.primary.OtaJobRepository.class);
    }

    @Bean
    public com.axion.ingestion.repository.primary.VehicleRegistryRepository vehicleRegistryRepository() {
        return createProxy(com.axion.ingestion.repository.primary.VehicleRegistryRepository.class);
    }

    @Bean
    public com.axion.ingestion.repository.primary.AnomalyExplanationRepository anomalyExplanationRepository() {
        return createProxy(com.axion.ingestion.repository.primary.AnomalyExplanationRepository.class);
    }

    @SuppressWarnings("unchecked")
    private <T> T createProxy(Class<T> iface) {
        InvocationHandler handler = new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                Class<?> ret = method.getReturnType();
                if (ret.equals(java.util.List.class)) return Collections.emptyList();
                if (ret.equals(java.util.Optional.class)) return Optional.empty();
                if (ret.equals(void.class)) return null;
                if (ret.isPrimitive()) {
                    if (ret.equals(boolean.class)) return false;
                    if (ret.equals(int.class)) return 0;
                    if (ret.equals(long.class)) return 0L;
                    if (ret.equals(double.class)) return 0.0d;
                    if (ret.equals(float.class)) return 0.0f;
                    if (ret.equals(short.class)) return (short) 0;
                    if (ret.equals(byte.class)) return (byte) 0;
                    if (ret.equals(char.class)) return '\0';
                }
                // Best-effort defaults
                return null;
            }
        };
        return (T) Proxy.newProxyInstance(iface.getClassLoader(), new Class[]{iface}, handler);
    }

    @Bean
    @Qualifier("tsdbJdbcTemplate")
    public JdbcTemplate tsdbJdbcTemplate() {
        return new JdbcTemplate() {
            @Override
            public void afterPropertiesSet() {
                // Skip dataSource validation in tests
            }

            @Override
            public <T> List<T> query(String sql, Object[] args, org.springframework.jdbc.core.RowMapper<T> rowMapper) {
                return Collections.emptyList();
            }

            @Override
            public <T> T queryForObject(String sql, Object[] args, Class<T> requiredType) {
                return null;
            }

            @Override
            public int update(String sql, Object... args) {
                return 0;
            }
        };
    }
}
